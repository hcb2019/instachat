import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env, isDemoMode } from "@/lib/env";
import { normalizeKeyword } from "@/lib/domain";
import { createTrackingToken, decryptSecret } from "@/server/crypto";
import { instagramGateway } from "@/server/instagram";
import { MetaApiError } from "@/server/instagram/meta-gateway";

function metaDiagnosticCode(error: MetaApiError) {
  return error.subcode ? `${error.code ?? `HTTP_${error.status}`}/${error.subcode}` : error.code ?? `HTTP_${error.status}`;
}

function metaDiagnosticMessage(prefix: string, error: MetaApiError) {
  const details = [
    error.subcode ? `subcódigo ${error.subcode}` : null,
    error.requestId ? `requisição ${error.requestId}` : null,
  ].filter(Boolean).join(", ");
  return `${prefix}${details ? ` (${details})` : ""}: ${error.message}`;
}

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

export async function retryPrivateReply(ownerId: string, runId: string) {
  if (isDemoMode) return { sent: true };
  const supabase = createSupabaseAdminClient();
  const { data: run } = await supabase
    .from("automation_runs")
    .select("*")
    .eq("id", runId)
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (!run) throw new Error("Execução não encontrada.");
  if (run.dm_status !== "failed") throw new Error("A DM desta execução não está disponível para reenvio.");
  if (Date.now() - new Date(run.created_at).getTime() > 7 * 24 * 60 * 60 * 1000) {
    throw new Error("A janela de sete dias da Meta terminou.");
  }

  const { data: connection } = await supabase
    .from("instagram_connections")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("status", "connected")
    .maybeSingle();
  if (!connection) throw new Error("Conexão do Instagram indisponível.");

  const { token, hash } = createTrackingToken();
  const attempts = Number(run.dm_attempts ?? 0) + 1;
  const accessToken = decryptSecret({
    ciphertext: connection.token_ciphertext,
    iv: connection.token_iv,
    tag: connection.token_tag,
  });
  const gateway = instagramGateway();

  try {
    const trackingUrl = `${env.APP_ORIGIN}/r/${token}`;
    const reply = await gateway.sendPrivateReply(
      connection.instagram_user_id,
      run.comment_id,
      `${run.dm_message_snapshot}\n\n${trackingUrl}`,
      accessToken,
    );
    const status = run.public_reply_status === "succeeded"
      ? "succeeded"
      : run.public_reply_status === "ambiguous"
        ? "ambiguous"
        : "partial";
    const { error } = await supabase
      .from("automation_runs")
      .update({
        tracking_token_hash: hash,
        dm_status: "succeeded",
        dm_message_id: reply.messageId,
        dm_attempts: attempts,
        status,
        error_code: null,
        error_message: null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id)
      .eq("owner_id", ownerId);
    if (error) {
      throw new MetaApiError(
        "A DM pode ter sido enviada, mas o histórico não confirmou a gravação.",
        0,
        "PERSISTENCE_AFTER_SEND",
        undefined,
        true,
      );
    }
    return { sent: true };
  } catch (error) {
    const ambiguous = error instanceof MetaApiError && error.ambiguous;
    const errorCode = error instanceof MetaApiError
      ? metaDiagnosticCode(error)
      : "PRIVATE_REPLY_RETRY_FAILED";
    const errorMessage = error instanceof MetaApiError
      ? metaDiagnosticMessage("Mensagem privada", error)
      : error instanceof Error
        ? error.message
        : "Não foi possível confirmar a mensagem privada.";
    await supabase
      .from("automation_runs")
      .update({
        dm_status: ambiguous ? "ambiguous" : "failed",
        dm_attempts: attempts,
        status: ambiguous ? "ambiguous" : run.public_reply_status === "succeeded" ? "partial" : "failed",
        error_code: errorCode,
        error_message: errorMessage.slice(0, 400),
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id)
      .eq("owner_id", ownerId);
    throw error;
  }
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
    errorCode = error instanceof MetaApiError ? metaDiagnosticCode(error) : "PUBLIC_REPLY_FAILED";
    errorMessage = error instanceof MetaApiError
      ? metaDiagnosticMessage("Resposta pública", error)
      : "Não foi possível confirmar a resposta pública.";
  }
  try {
    const trackingUrl = `${env.APP_ORIGIN}/r/${token}`;
    const reply = await gateway.sendPrivateReply(connection.instagram_user_id, event.comment_id, `${automation.dm_message}\n\n${trackingUrl}`, accessToken);
    messageId = reply.messageId;
  } catch (error) {
    dmStatus = error instanceof MetaApiError && error.ambiguous ? "ambiguous" : "failed";
    errorCode ??= error instanceof MetaApiError ? metaDiagnosticCode(error) : "PRIVATE_REPLY_FAILED";
    errorMessage ??= error instanceof MetaApiError
      ? metaDiagnosticMessage("Mensagem privada", error)
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
