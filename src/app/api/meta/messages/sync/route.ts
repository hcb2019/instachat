import { getOwner } from "@/lib/auth";
import { env, isDemoMode } from "@/lib/env";
import { recoverPendingFollowerMessages } from "@/server/jobs";

function redirectWith(result: "success" | "empty" | "error", recovered = 0) {
  const url = new URL("/settings", env.APP_ORIGIN);
  url.searchParams.set("messages", result);
  if (recovered) url.searchParams.set("recovered", String(recovered));
  return Response.redirect(url, 303);
}

export async function POST(request: Request) {
  const owner = await getOwner();
  if (!owner) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("origin") !== env.APP_ORIGIN) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (isDemoMode) return redirectWith("empty");

  try {
    const result = await recoverPendingFollowerMessages();
    return redirectWith(result.recovered > 0 ? "success" : "empty", result.recovered);
  } catch {
    return redirectWith("error");
  }
}
