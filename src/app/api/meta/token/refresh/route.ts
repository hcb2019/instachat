import { getOwner } from "@/lib/auth";
import { env, isDemoMode } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { renewInstagramConnectionToken } from "@/server/instagram/token-lifecycle";

function settingsRedirect(result: "success" | "error") {
  const url = new URL("/settings", env.APP_ORIGIN);
  url.searchParams.set("token", result);
  return Response.redirect(url, 303);
}

export async function POST(request: Request) {
  const owner = await getOwner();
  if (!owner) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("origin") !== env.APP_ORIGIN) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (isDemoMode) return settingsRedirect("success");

  const supabase = createSupabaseAdminClient();
  const { data: connection } = await supabase
    .from("instagram_connections")
    .select("id,token_ciphertext,token_iv,token_tag,token_expires_at,status")
    .eq("owner_id", owner.id)
    .maybeSingle();
  if (!connection) return settingsRedirect("error");
  try {
    await renewInstagramConnectionToken(connection, { force: true });
    return settingsRedirect("success");
  } catch {
    return settingsRedirect("error");
  }
}
