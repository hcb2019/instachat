import { getOwner } from "@/lib/auth";
import { env } from "@/lib/env";
import { syncRecentAutomationComments } from "@/server/automation-comment-sync";

function settingsRedirect(result: "success" | "error", counts?: { found: number; queued: number; processed: number }) {
  const url = new URL("/settings", env.APP_ORIGIN);
  url.searchParams.set("comments", result);
  if (counts) {
    url.searchParams.set("found", String(counts.found));
    url.searchParams.set("queued", String(counts.queued));
    url.searchParams.set("processed", String(counts.processed));
  }
  return Response.redirect(url, 303);
}

export async function POST(request: Request) {
  const owner = await getOwner();
  if (!owner) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("origin") !== env.APP_ORIGIN) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  try {
    const result = await syncRecentAutomationComments(owner.id);
    return settingsRedirect("success", result);
  } catch {
    return settingsRedirect("error");
  }
}
