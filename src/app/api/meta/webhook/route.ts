import { after } from "next/server";
import { env, isDemoMode } from "@/lib/env";
import { ingestEvents, processIncomingMessages, processQueueBatch } from "@/server/jobs";
import { queueScheduledAudienceAnalyses } from "@/server/audience/jobs";
import { parseCommentEvents, parseMessageEvents, verifyWebhookSignatureWithSecrets } from "@/server/webhook";

export const runtime = "nodejs";
export const maxDuration = 60;

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
  const webhookSecrets = isDemoMode
    ? ["demo-webhook-secret", "demo-meta-secret"]
    : [env.META_WEBHOOK_APP_SECRET, env.META_APP_SECRET];
  if (!verifyWebhookSignatureWithSecrets(
    rawBody,
    request.headers.get("x-hub-signature-256"),
    webhookSecrets,
  )) {
    console.warn("Instagram webhook signature rejected", {
      bodyBytes: Buffer.byteLength(rawBody),
      hasPlatformSecret: Boolean(env.META_WEBHOOK_APP_SECRET),
      hasInstagramSecret: Boolean(env.META_APP_SECRET),
    });
    return new Response("Invalid signature", { status: 401 });
  }
  let events;
  let messageEvents;
  try {
    events = parseCommentEvents(rawBody).filter((event) => !event.isSelf);
    messageEvents = parseMessageEvents(rawBody).filter((event) => !event.isEcho);
  } catch (error) {
    console.warn("Instagram webhook payload rejected", {
      error: error instanceof Error ? error.name : "UnknownError",
      bodyBytes: Buffer.byteLength(rawBody),
    });
    return Response.json({ error: "Invalid payload" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const result = await ingestEvents(events);
    const messages = await processIncomingMessages(messageEvents);
    let processed = 0;
    if (result.queued > 0) {
      try {
        const batch = await processQueueBatch(Math.min(result.queued, 10));
        processed = batch.processed;
      } catch (error) {
        // The event is already durable. A later worker invocation can safely
        // reclaim it after the queue visibility timeout.
        console.error("Instagram webhook immediate processing failed", {
          error: error instanceof Error ? error.message : "UnknownError",
          queued: result.queued,
        });
      }
    }
    after(async () => {
      await queueScheduledAudienceAnalyses(20).catch(() => undefined);
    });
    return Response.json({ ...result, processed, messages }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Instagram webhook ingestion failed", {
      error: error instanceof Error ? error.message : "UnknownError",
      eventCount: events.length,
      messageEventCount: messageEvents.length,
    });
    return Response.json({ error: "Ingestion failed" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
