import { getOwner } from "@/lib/auth";
import { env, isDemoMode } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { decryptSecret } from "@/server/crypto";
import { instagramGateway } from "@/server/instagram";
import { MetaApiError } from "@/server/instagram/meta-gateway";

function settingsRedirect(result: "success" | "error", count?: number) {
  const url = new URL("/settings", env.APP_ORIGIN);
  url.searchParams.set("sync", result);
  if (typeof count === "number") url.searchParams.set("count", String(count));
  return Response.redirect(url, 303);
}

export async function POST(request: Request) {
  const owner = await getOwner();
  if (!owner) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin !== env.APP_ORIGIN) return Response.json({ error: "Invalid origin" }, { status: 403 });
  if (isDemoMode) return Response.json({ synced: 3 });
  const supabase = createSupabaseAdminClient();
  const { data: connection, error: connectionError } = await supabase.from("instagram_connections").select("*").eq("owner_id", owner.id).single();
  if (connectionError) return Response.json({ error: "Não foi possível ler a conexão." }, { status: 500 });
  if (!connection) return Response.json({ error: "Connection unavailable" }, { status: 409 });
  try {
    const accessToken = decryptSecret({ ciphertext: connection.token_ciphertext, iv: connection.token_iv, tag: connection.token_tag });
    const reels = await instagramGateway().listReels(connection.instagram_user_id, accessToken);
    if (reels.length) {
      const { error: mediaError } = await supabase.from("instagram_media").upsert(reels.map((item) => ({
        owner_id: owner.id, connection_id: connection.id, external_id: item.externalId, media_product_type: "REELS",
        caption: item.caption, permalink: item.permalink, thumbnail_url: item.thumbnailUrl, published_at: item.publishedAt,
        synced_at: new Date().toISOString(),
      })), { onConflict: "connection_id,external_id" });
      if (mediaError) throw new Error("O banco de dados recusou a gravação dos Reels.");
    }
    const { error: updateError } = await supabase.from("instagram_connections").update({
      status: "connected", last_sync_at: new Date().toISOString(), last_success_at: new Date().toISOString(), last_error: null,
    }).eq("id", connection.id);
    if (updateError) throw new Error("Não foi possível atualizar o estado da conexão.");
    if (request.headers.get("accept")?.includes("text/html")) return settingsRedirect("success", reels.length);
    return Response.json({ synced: reels.length });
  } catch (error) {
    const unsupportedMedia = error instanceof MetaApiError
      && error.code === "2500"
      && error.message.toLowerCase().includes("/media");
    const diagnostic = unsupportedMedia
      ? "A Meta autenticou a conta, mas não liberou a leitura das mídias para este token. No painel da Meta, adicione a permissão instagram_business_basic e depois clique em “Reautorizar Instagram” no InstaChat."
      : error instanceof MetaApiError
        ? `Meta (${error.code ?? error.status}): ${error.message}`
      : error instanceof Error
        ? error.message
        : "Falha desconhecida.";
    await supabase.from("instagram_connections").update({ status: "error", last_error: diagnostic.slice(0, 400) }).eq("id", connection.id);
    if (request.headers.get("accept")?.includes("text/html")) return settingsRedirect("error");
    return Response.json({ error: "Não foi possível sincronizar os Reels.", code: error instanceof MetaApiError ? error.code : "SYNC_ERROR" }, { status: 502 });
  }
}
