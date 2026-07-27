import { getOwner } from "@/lib/auth";
import { env } from "@/lib/env";
import { retryPrivateReply } from "@/server/jobs";

function historyRedirect(result: "success" | "error") {
  const url = new URL("/history", env.APP_ORIGIN);
  url.searchParams.set("retryDm", result);
  return Response.redirect(url, 303);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const owner = await getOwner();
  if (!owner) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("origin") !== env.APP_ORIGIN) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await retryPrivateReply(owner.id, id);
    return historyRedirect("success");
  } catch {
    return historyRedirect("error");
  }
}
