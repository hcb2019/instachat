import { getOwner } from "@/lib/auth";
import { env, isDemoMode } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { decryptSecret } from "@/server/crypto";
import { instagramGateway } from "@/server/instagram";

export async function POST(request: Request) {
  const owner = await getOwner();
  if (!owner) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin !== env.APP_ORIGIN) return Response.json({ error: "Invalid origin" }, { status: 403 });
  if (isDemoMode) return Response.json({ synced: 3 });
  const supabase = createSupabaseAdminClient();
  const { data: connection } = await supabase.from("instagram_connections").select("*").eq("owner_id", owner.id).single();
  if (!connection) return Response.json({ error: "Connection unavailable" }, { status: 409 });
  try {
    const accessToken = decryptSecret({ ciphertext: connection.token_ciphertext, iv: connection.token_iv, tag: connection.token_tag });
    const reels = await instagramGateway().listReels(connection.instagram_user_id, accessToken);
    if (reels.length) await supabase.from("instagram_media").upsert(reels.map((item) => ({
      owner_id: owner.id, connection_id: connection.id, external_id: item.externalId, media_product_type: "REELS",
      caption: item.caption, permalink: item.permalink, thumbnail_url: item.thumbnailUrl, published_at: item.publishedAt,
      synced_at: new Date().toISOString(),
    })), { onConflict: "connection_id,external_id" });
    await supabase.from("instagram_connections").update({ last_sync_at: new Date().toISOString(), last_error: null }).eq("id", connection.id);
    return Response.json({ synced: reels.length });
  } catch {
    await supabase.from("instagram_connections").update({ status: "error", last_error: "Não foi possível sincronizar os Reels." }).eq("id", connection.id);
    return Response.json({ error: "Sync failed" }, { status: 502 });
  }
}
