import { NextResponse, type NextRequest } from "next/server";
import { getOwner } from "@/lib/auth";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { constantTimeTextEqual, encryptSecret } from "@/server/crypto";
import { instagramGateway } from "@/server/instagram";

export async function GET(request: NextRequest) {
  const owner = await getOwner();
  if (!owner) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state") ?? "";
  const savedState = request.cookies.get("meta_oauth_state")?.value ?? "";
  if (!code || !state || !savedState || !constantTimeTextEqual(state, savedState)) return Response.json({ error: "Invalid OAuth state" }, { status: 400 });
  try {
    const gateway = instagramGateway();
    const token = await gateway.exchangeCode(code, `${env.APP_ORIGIN}/api/meta/oauth/callback`);
    const profile = await gateway.getProfile(token.accessToken);
    await gateway.subscribeToComments(profile.userId, token.accessToken);
    const encrypted = encryptSecret(token.accessToken);
    const expiresAt = token.expiresIn ? new Date(Date.now() + token.expiresIn * 1000).toISOString() : null;
    const supabase = createSupabaseAdminClient();
    await supabase.from("instagram_connections").upsert({
      owner_id: owner.id, instagram_user_id: profile.userId, username: profile.username,
      token_ciphertext: encrypted.ciphertext, token_iv: encrypted.iv, token_tag: encrypted.tag,
      token_expires_at: expiresAt, api_version: env.META_GRAPH_API_VERSION, status: "connected",
      last_error: null, updated_at: new Date().toISOString(),
    }, { onConflict: "owner_id" });
    const response = NextResponse.redirect(`${env.APP_ORIGIN}/settings?connected=1`);
    response.cookies.delete("meta_oauth_state");
    return response;
  } catch {
    return NextResponse.redirect(`${env.APP_ORIGIN}/settings?error=oauth`);
  }
}
