import "server-only";
import { createHmac } from "node:crypto";
import { z } from "zod";
import { constantTimeTextEqual } from "@/server/crypto";
import type { InstagramCommentEvent } from "@/server/instagram/types";

const metaIdSchema = z.union([z.string(), z.number().transform(String)]);

const commentValueSchema = z.object({
  id: metaIdSchema,
  text: z.union([z.string(), z.number().transform(String)]).default(""),
  from: z.object({
    id: metaIdSchema.optional(),
    username: z.string().max(80).optional(),
    self_ig_scoped_id: metaIdSchema.optional(),
  }).optional(),
  media: z.object({
    id: metaIdSchema,
    media_product_type: z.string().optional(),
  }),
}).passthrough();

const commentValuesSchema = z.union([
  commentValueSchema,
  z.array(commentValueSchema),
]);

const webhookSchema = z.object({
  object: z.enum(["instagram", "instagram_business_account"]),
  entry: z.array(z.object({
    id: metaIdSchema,
    field: z.string().optional(),
    value: z.unknown().optional(),
    changes: z.array(z.object({
      field: z.string(),
      value: z.unknown(),
    }).passthrough()).optional(),
  }).passthrough()),
}).passthrough();

export function verifyWebhookSignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature?.startsWith("sha256=")) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  return constantTimeTextEqual(signature, expected);
}

export function parseCommentEvents(rawBody: string): InstagramCommentEvent[] {
  const payload = webhookSchema.parse(JSON.parse(rawBody));
  return payload.entry.flatMap((entry) => {
    const directResult = entry.field === "comments"
      ? commentValuesSchema.safeParse(entry.value)
      : null;
    const directValues = directResult?.success
      ? (Array.isArray(directResult.data) ? directResult.data : [directResult.data])
      : [];
    const changedValues = (entry.changes ?? [])
      .filter((change) => change.field === "comments")
      .flatMap((change) => {
        const result = commentValuesSchema.safeParse(change.value);
        if (!result.success) return [];
        return Array.isArray(result.data) ? result.data : [result.data];
      });
    const values = [...directValues, ...changedValues];

    return values.map((value) => ({
      instagramUserId: entry.id,
      commentId: value.id,
      mediaId: value.media.id,
      mediaProductType: value.media.media_product_type ?? "UNKNOWN",
      commenterScopedId: value.from?.id
        ?? (value.from?.username
          ? `username:${value.from.username.normalize("NFKC").toLocaleLowerCase("en-US")}`
          : `comment:${value.id}`),
      commenterUsername: value.from?.username ?? "instagram_user",
      text: value.text,
      isSelf: Boolean(value.from?.self_ig_scoped_id)
        || (value.from?.id !== undefined && value.from.id === entry.id),
    }));
  });
}
