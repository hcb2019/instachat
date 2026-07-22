import "server-only";
import { createHmac } from "node:crypto";
import { z } from "zod";
import { constantTimeTextEqual } from "@/server/crypto";
import type { InstagramCommentEvent } from "@/server/instagram/types";

const webhookSchema = z.object({
  object: z.literal("instagram"),
  entry: z.array(z.object({
    id: z.string(),
    changes: z.array(z.object({
      field: z.literal("comments"),
      value: z.object({
        id: z.string(), text: z.string().max(2200),
        from: z.object({ id: z.string(), username: z.string().max(80), self_ig_scoped_id: z.string().optional() }),
        media: z.object({ id: z.string(), media_product_type: z.string() }),
      }),
    })),
  })),
});

export function verifyWebhookSignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature?.startsWith("sha256=")) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  return constantTimeTextEqual(signature, expected);
}

export function parseCommentEvents(rawBody: string): InstagramCommentEvent[] {
  const payload = webhookSchema.parse(JSON.parse(rawBody));
  return payload.entry.flatMap((entry) => entry.changes.map(({ value }) => ({
    instagramUserId: entry.id, commentId: value.id, mediaId: value.media.id, mediaProductType: value.media.media_product_type,
    commenterScopedId: value.from.id, commenterUsername: value.from.username, text: value.text,
    isSelf: Boolean(value.from.self_ig_scoped_id) || value.from.id === entry.id,
  })));
}
