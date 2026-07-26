import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth:callback] Supabase rejected the authorization code", {
        code: error.code,
        status: error.status,
      });
      return NextResponse.redirect(`${env.APP_ORIGIN}/login?error=invalid_or_expired_link`);
    }
  }
  return NextResponse.redirect(`${env.APP_ORIGIN}/dashboard`);
}
