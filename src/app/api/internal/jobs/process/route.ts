import { constantTimeTextEqual } from "@/server/crypto";
import { env, isDemoMode } from "@/lib/env";
import { processQueueBatch } from "@/server/jobs";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const expected = env.WORKER_SECRET ?? (isDemoMode ? "demo-worker-secret" : "");
  if (!expected || !provided || !constantTimeTextEqual(provided, expected)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const result = await processQueueBatch();
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
