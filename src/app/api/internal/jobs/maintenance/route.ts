import { constantTimeTextEqual } from "@/server/crypto";
import { env, isDemoMode } from "@/lib/env";
import { renewExpiringInstagramTokens } from "@/server/instagram/token-lifecycle";
import { processDuePipelinePosts } from "@/server/pipeline";

export const runtime = "nodejs";
export const maxDuration = 60;

function isAuthorized(request: Request) {
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const accepted = [env.CRON_SECRET, env.WORKER_SECRET, isDemoMode ? "demo-worker-secret" : undefined]
    .filter((value): value is string => Boolean(value));
  return Boolean(provided) && accepted.some((expected) => constantTimeTextEqual(provided, expected));
}

async function run(request: Request) {
  if (!isAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoMode) return Response.json({ checked: 0, renewed: 0, skipped: 0, failed: 0 });
  const [tokenRenewal, pipeline] = await Promise.all([
    renewExpiringInstagramTokens(),
    processDuePipelinePosts().catch(() => ({ pipelineProcessed: 0, pipelineFailed: 1 })),
  ]);
  return Response.json({ ...tokenRenewal, pipeline }, { headers: { "Cache-Control": "no-store" } });
}

export const GET = run;
export const POST = run;
