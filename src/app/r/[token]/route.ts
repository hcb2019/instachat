import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/env";
import { hashTrackingToken } from "@/server/crypto";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{22}$/.test(token) || isDemoMode) return new Response("Link não encontrado", { status: 404, headers: { "Cache-Control": "no-store" } });
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("record_click", {
    token_hash: hashTrackingToken(token), user_agent_value: (request.headers.get("user-agent") ?? "").slice(0, 240),
  });
  const destination = typeof data === "string" ? data : null;
  if (error || !destination) return new Response("Link não encontrado", { status: 404, headers: { "Cache-Control": "no-store" } });
  const url = new URL(destination);
  if (url.protocol !== "https:") return new Response("Destino inválido", { status: 500, headers: { "Cache-Control": "no-store" } });
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}

export function HEAD() {
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
