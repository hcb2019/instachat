import "server-only";
import { createHmac } from "node:crypto";
import { z } from "zod";
import { constantTimeTextEqual } from "@/server/crypto";
import type { InstagramCommentEvent } from "@/server/instagram/types";

const commentValueSchema = z.object({
  id: z.string(),
  text: z.string().max(2200),
  from: z.object({
    id: z.string().optional(),
    username: z.string().max(80),
    self_ig_scoped_id: z.string().optional(),
  }),
  media: z.object({
    id: z.string(),
    media_product_type: z.string(),
  }),
});

const commentChangeSchema = z.object({
  field: z.literal("comments"),
  value: commentValueSchema,
});

const webhookSchema = z.object({
  object: z.literal("instagram"),
  entry: z.array(z.union([
    z.object({
      id: z.string(),
      changes: z.array(commentChangeSchema),
    }),
    z.object({
      id: z.string(),
      field: z.literal("comments"),
      value: commentValueSchema,
    }),
  ])),
});

export function verifyWebhookSignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature?.startsWith("sha256=")) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  return constantTimeTextEqual(signature, expected);
}

export function parseCommentEvents(rawBody: string): InstagramCommentEvent[] {
  const payload = webhookSchema.parse(JSON.parse(rawBody));
  return payload.entry.flatMap((entry) => {
    const values = "changes" in entry
      ? entry.changes.map((change) => change.value)
      : [entry.value];

    return values.map((value) => ({
      instagramUserId: entry.id,
      commentId: value.id,
      mediaId: value.media.id,
      mediaProductType: value.media.media_product_type,
      commenterScopedId: value.from.id
        ?? `username:${value.from.username.normalize("NFKC").toLocaleLowerCase("en-US")}`,
      commenterUsername: value.from.username,
      text: value.text,
      isSelf: Boolean(value.from.self_ig_scoped_id)
        || (value.from.id !== undefined && value.from.id === entry.id),
    }));
  });
}
