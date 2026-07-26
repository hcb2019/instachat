import { getOwner } from "@/lib/auth";
import { env, isDemoMode } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { decryptSecret } from "@/server/crypto";
import { instagramGateway } from "@/server/instagram";

function settingsRedirect(result: "active" | "restored" | "error") {
  const url = new URL("/settings", env.APP_ORIGIN);
  url.searchParams.set("webhook", result);
  return Response.redirect(url, 303);
}

export async function POST(request: Request) {
  const owner = await getOwner();
  if (!owner) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("origin") !== env.APP_ORIGIN) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (isDemoMode) return settingsRedirect("active");

  const supabase = createSupabaseAdminClient();
  const { data: connection } = await supabase
    .from("instagram_connections")
    .select("*")
    .eq("owner_id", owner.id)
    .single();
  if (!connection) return settingsRedirect("error");

  try {
    const accessToken = decryptSecret({
      ciphertext: connection.token_ciphertext,
      iv: connection.token_iv,
      tag: connection.token_tag,
    });
    const gateway = instagramGateway();
    if (await gateway.hasCommentSubscription(connection.instagram_user_id, accessToken)) {
      return settingsRedirect("active");
    }

    await gateway.subscribeToComments(connection.instagram_user_id, accessToken);
    const restored = await gateway.hasCommentSubscription(connection.instagram_user_id, accessToken);
    return settingsRedirect(restored ? "restored" : "error");
  } catch {
    return settingsRedirect("error");
  }
}
