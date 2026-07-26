import { after } from "next/server";
import { env, isDemoMode } from "@/lib/env";
import { ingestEvents, processQueueBatch } from "@/server/jobs";
import { queueScheduledAudienceAnalyses } from "@/server/audience/jobs";
import { parseCommentEvents, verifyWebhookSignature } from "@/server/webhook";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token") ?? "";
  const challenge = url.searchParams.get("hub.challenge") ?? "";
  const expected = env.META_WEBHOOK_VERIFY_TOKEN ?? (isDemoMode ? "demo-verify-token" : "");
  if (mode !== "subscribe" || !expected || token !== expected || !challenge) return new Response("Forbidden", { status: 403 });
  return new Response(challenge, { headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 256_000) return new Response("Payload too large", { status: 413 });
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody) > 256_000) return new Response("Payload too large", { status: 413 });
  const secret = env.META_APP_SECRET ?? (isDemoMode ? "demo-webhook-secret" : "");
  if (!secret || !verifyWebhookSignature(rawBody, request.headers.get("x-hub-signature-256"), secret)) return new Response("Invalid signature", { status: 401 });
  let events;
  try {
    events = parseCommentEvents(rawBody).filter((event) => !event.isSelf);
  } catch (error) {
    console.warn("Instagram webhook payload rejected", {
      error: error instanceof Error ? error.name : "UnknownError",
      bodyBytes: Buffer.byteLength(rawBody),
    });
    return Response.json({ error: "Invalid payload" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const result = await ingestEvents(events);
    after(async () => {
      await processQueueBatch().catch(() => undefined);
      await queueScheduledAudienceAnalyses(20).catch(() => undefined);
    });
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Instagram webhook ingestion failed", {
      error: error instanceof Error ? error.message : "UnknownError",
      eventCount: events.length,
    });
    return Response.json({ error: "Ingestion failed" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
