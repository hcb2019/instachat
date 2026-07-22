import { constantTimeTextEqual } from "@/server/crypto";
import { env, isDemoMode } from "@/lib/env";
import { processAudienceQueueBatch, queueScheduledAudienceAnalyses } from "@/server/audience/jobs";
import { syncConnectedAudienceAccounts } from "@/server/audience/sync";

export async function POST(request: Request) {
  const expected = env.WORKER_SECRET ?? (isDemoMode ? "demo-worker-secret" : "");
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!expected || !constantTimeTextEqual(provided, expected)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const sync = await syncConnectedAudienceAccounts();
    const scheduled = await queueScheduledAudienceAnalyses(1);
    const processed = await processAudienceQueueBatch(2);
    return Response.json({ ...sync, ...scheduled, ...processed }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Worker unavailable" }, { status: 503 });
  }
}
