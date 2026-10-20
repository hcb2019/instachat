import { constantTimeTextEqual } from "@/server/crypto";
import { env, isDemoMode } from "@/lib/env";
import { processQueueBatch, recoverPendingFollowerMessages } from "@/server/jobs";
import { renewExpiringInstagramTokens } from "@/server/instagram/token-lifecycle";
import { processDuePipelinePosts } from "@/server/pipeline";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const expected = env.WORKER_SECRET ?? (isDemoMode ? "demo-worker-secret" : "");
  if (!expected || !provided || !constantTimeTextEqual(provided, expected)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const tokenRenewal = await renewExpiringInstagramTokens().catch(() => ({
    checked: 0,
    renewed: 0,
    skipped: 0,
    failed: 1,
  }));
  const [queue, followerReplies] = await Promise.all([
    processQueueBatch(),
    recoverPendingFollowerMessages(),
  ]);
  const pipeline = await processDuePipelinePosts().catch(() => ({ pipelineProcessed: 0, pipelineFailed: 1 }));
  return Response.json({ ...queue, followerReplies, tokenRenewal, pipeline }, { headers: { "Cache-Control": "no-store" } });
}
