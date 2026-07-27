import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env, isDemoMode } from "@/lib/env";
import { normalizeKeyword } from "@/lib/domain";
import { createTrackingToken, decryptSecret } from "@/server/crypto";
import { instagramGateway } from "@/server/instagram";
import { MetaApiError } from "@/server/instagram/meta-gateway";

export async function ingestEvents(events: unknown[]) {
  if (isDemoMode) return { accepted: events.length, queued: 0 };
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("ingest_comment_events", { events });
  if (error) throw new Error("Não foi possível persistir os eventos.");
  return data as { accepted: number; queued: number };
}

export async function processQueueBatch(batchSize = 10) {
  if (isDemoMode) return { processed: 0 };
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("claim_queue_batch", { batch_size: Math.min(Math.max(batchSize, 1), 25) });
  if (error) throw new Error("Falha ao consumir a fila.");
  const messages = (data ?? []) as Array<{ msg_id: number; event_id: string }>;
  let processed = 0;
  for (const message of messages) {
    try {
      await processEvent(message.event_id);
      await supabase.rpc("complete_queue_message", { queue_message_id: message.msg_id });
      processed += 1;
    } catch {
      // O visibility timeout torna a mensagem disponível novamente.
    }
  }
  return { processed };
}

async function processEvent(eventId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase.from("comment_events").select("*").eq("id", eventId).single();
  if (!event || event.processed_at) return;
  const { data: connection } = await supabase.from("instagram_connections").select("*").eq("id", event.connection_id).single();
  if (!connection || connection.status !== "connected") {
    await supabase.from("comment_events").update({ outcome: "connection_unavailable", processed_at: new Date().toISOString() }).eq("id", eventId);
    return;
  }
  const { data: media } = await supabase.from("instagram_media").select("id").eq("connection_id", connection.id).eq("external_id", event.media_external_id).maybeSingle();
  if (!media) {
    await supabase.from("comment_events").update({ outcome: "wrong_media", processed_at: new Date().toISOString() }).eq("id", eventId);
    return;
  }
  const { data: candidates } = await supabase.from("automations").select("*").eq("media_id", media.id).eq("status", "active").is("deleted_at", null);
  const automation = (candidates ?? []).find((item) => item.keyword_normalized === normalizeKeyword(event.comment_text));
  if (!automation) {
    await supabase.from("comment_events").update({ outcome: "not_matched", processed_at: new Date().toISOString() }).eq("id", eventId);
    return;
  }
  const { token, hash } = createTrackingToken();
  const { data: run, error: runError } = await supabase.from("automation_runs").insert({
    owner_id: automation.owner_id, automation_id: automation.id, comment_event_id: event.id,
    automation_name_snapshot: automation.name, automation_version: automation.version,
    media_external_id: event.media_external_id, comment_id: event.comment_id,
    commenter_scoped_id: event.commenter_scoped_id, commenter_username: event.commenter_username,
    comment_text: event.comment_text, public_reply_snapshot: automation.public_reply,
    dm_message_snapshot: automation.dm_message, destination_url_snapshot: automation.destination_url,
    tracking_token_hash: hash, status: "processing",
  }).select("id").single();
  if (runError?.code === "23505") {
    await supabase.from("comment_events").update({ outcome: "duplicate", processed_at: new Date().toISOString() }).eq("id", eventId);
    return;
  }
  if (!run) throw new Error("Falha ao criar execução.");

  await supabase.from("comment_events").update({ automation_id: automation.id, outcome: "matched" }).eq("id", eventId);
  const accessToken = decryptSecret({ ciphertext: connection.token_ciphertext, iv: connection.token_iv, tag: connection.token_tag });
  const gateway = instagramGateway();
  let publicStatus: "succeeded" | "failed" | "ambiguous" = "succeeded";
  let dmStatus: "succeeded" | "failed" | "ambiguous" = "succeeded";
  let publicId: string | null = null;
  let messageId: string | null = null;
  let errorCode: string | null = null;
  let errorMessage: string | null = null;

  try {
    const reply = await gateway.replyToComment(event.comment_id, automation.public_reply, accessToken);
    publicId = reply.id;
  } catch (error) {
    publicStatus = error instanceof MetaApiError && error.ambiguous ? "ambiguous" : "failed";
    errorCode = error instanceof MetaApiError ? error.code ?? `HTTP_${error.status}` : "PUBLIC_REPLY_FAILED";
    errorMessage = error instanceof MetaApiError
      ? `Resposta pública: ${error.message}`
      : "Não foi possível confirmar a resposta pública.";
  }
  try {
    const trackingUrl = `${env.APP_ORIGIN}/r/${token}`;
    const reply = await gateway.sendPrivateReply(connection.instagram_user_id, event.comment_id, `${automation.dm_message}\n\n${trackingUrl}`, accessToken);
    messageId = reply.messageId;
  } catch (error) {
    dmStatus = error instanceof MetaApiError && error.ambiguous ? "ambiguous" : "failed";
    errorCode ??= error instanceof MetaApiError ? error.code ?? `HTTP_${error.status}` : "PRIVATE_REPLY_FAILED";
    errorMessage ??= error instanceof MetaApiError
      ? `Mensagem privada: ${error.message}`
      : "Não foi possível confirmar a mensagem privada.";
  }
  const status = publicStatus === "succeeded" && dmStatus === "succeeded" ? "succeeded" : publicStatus === "failed" && dmStatus === "failed" ? "failed" : publicStatus === "ambiguous" || dmStatus === "ambiguous" ? "ambiguous" : "partial";
  const completedAt = new Date().toISOString();
  await supabase.from("automation_runs").update({
    status, public_reply_status: publicStatus, dm_status: dmStatus, public_reply_id: publicId,
    dm_message_id: messageId, public_reply_attempts: 1, dm_attempts: 1,
    error_code: errorCode, error_message: errorMessage, completed_at: completedAt,
  }).eq("id", run.id);
  await supabase.from("comment_events").update({ processed_at: completedAt }).eq("id", eventId);
}
