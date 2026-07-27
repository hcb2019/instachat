import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getOwner } from "@/lib/auth";
import { env, isDemoMode } from "@/lib/env";

export async function GET() {
  const owner = await getOwner();
  if (!owner) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoMode) return NextResponse.redirect(`${env.APP_ORIGIN}/settings`);
  if (!env.META_APP_ID) return Response.json({ error: "Meta não configurada" }, { status: 503 });
  const state = randomBytes(32).toString("base64url");
  const redirectUri = `${env.APP_ORIGIN}/api/meta/oauth/callback`;
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.search = new URLSearchParams({
    enable_fb_login: "0", force_authentication: "1", client_id: env.META_APP_ID,
    redirect_uri: redirectUri, response_type: "code",
    scope: "instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages,instagram_business_manage_insights", state,
  }).toString();
  const response = NextResponse.redirect(url);
  response.cookies.set("meta_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/meta/oauth/callback", maxAge: 600 });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
