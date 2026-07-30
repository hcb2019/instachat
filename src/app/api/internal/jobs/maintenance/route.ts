import { constantTimeTextEqual } from "@/server/crypto";
import { env, isDemoMode } from "@/lib/env";
import { renewExpiringInstagramTokens } from "@/server/instagram/token-lifecycle";

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
  const result = await renewExpiringInstagramTokens();
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}

export const GET = run;
export const POST = run;
