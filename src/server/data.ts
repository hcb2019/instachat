import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { demoStore } from "@/server/demo-store";
import type { Automation, AutomationRun, DashboardMetrics, InstagramConnection, InstagramMedia } from "@/types/domain";

function mapAutomation(row: Record<string, unknown>): Automation {
  return {
    id: String(row.id), ownerId: String(row.owner_id), connectionId: String(row.connection_id),
    mediaId: row.media_id ? String(row.media_id) : null, name: String(row.name), keyword: String(row.keyword),
    keywordNormalized: String(row.keyword_normalized), publicReply: String(row.public_reply), dmMessage: String(row.dm_message),
    destinationUrl: String(row.destination_url), status: row.status as Automation["status"], version: Number(row.version),
    createdAt: String(row.created_at), updatedAt: String(row.updated_at), deletedAt: row.deleted_at ? String(row.deleted_at) : null,
  };
}

export async function getConnection(): Promise<InstagramConnection | null> {
  if (isDemoMode) return demoStore().connection;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("instagram_connections").select("*").maybeSingle();
  if (!data) return null;
  return {
    id: data.id, ownerId: data.owner_id, instagramUserId: data.instagram_user_id, username: data.username,
    status: data.status, tokenExpiresAt: data.token_expires_at, lastSyncAt: data.last_sync_at, lastError: data.last_error,
  } as InstagramConnection;
}

export async function listMedia(): Promise<InstagramMedia[]> {
  if (isDemoMode) return demoStore().media;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("instagram_media").select("*").order("published_at", { ascending: false });
  return (data ?? []).map((row) => ({ id: row.id, connectionId: row.connection_id, externalId: row.external_id, caption: row.caption ?? "", permalink: row.permalink, thumbnailUrl: row.thumbnail_url, publishedAt: row.published_at }));
}

export async function listAutomations(): Promise<Automation[]> {
  if (isDemoMode) return demoStore().automations.filter((item) => item.status !== "deleted");
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("automations").select("*").is("deleted_at", null).order("updated_at", { ascending: false });
  return (data ?? []).map(mapAutomation);
}

export async function getAutomation(id: string): Promise<Automation | null> {
  if (isDemoMode) return demoStore().automations.find((item) => item.id === id && item.status !== "deleted") ?? null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("automations").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
  return data ? mapAutomation(data) : null;
}

export async function listRuns(): Promise<AutomationRun[]> {
  if (isDemoMode) return demoStore().runs;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("automation_runs").select("*, automations(name)").order("created_at", { ascending: false }).limit(250);
  return (data ?? []).map((row) => ({
    id: row.id, automationId: row.automation_id, automationName: (row.automations as { name?: string } | null)?.name ?? row.automation_name_snapshot,
    mediaExternalId: row.media_external_id, commentId: row.comment_id, commenterScopedId: row.commenter_scoped_id,
    commenterUsername: row.commenter_username, commentText: row.comment_text, status: row.status,
    publicReplyStatus: row.public_reply_status, dmStatus: row.dm_status, publicReplyAttempts: row.public_reply_attempts,
    dmAttempts: row.dm_attempts, errorCode: row.error_code, errorMessage: row.error_message,
    firstClickedAt: row.first_clicked_at, createdAt: row.created_at,
  })) as AutomationRun[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [automations, runs] = await Promise.all([listAutomations(), listRuns()]);
  return {
    activeAutomations: automations.filter((item) => item.status === "active").length,
    matchedComments: runs.length,
    eligibleRecipients: runs.length,
    sentDms: runs.filter((item) => item.dmStatus === "succeeded").length,
    uniqueClicks: runs.filter((item) => item.firstClickedAt).length,
    failures: runs.filter((item) => ["failed", "partial", "ambiguous"].includes(item.status)).length,
    duplicates: 0,
    lastRunAt: runs[0]?.createdAt ?? null,
  };
}
