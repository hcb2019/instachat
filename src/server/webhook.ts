import "server-only";
import { createHash, createHmac } from "node:crypto";
import { z } from "zod";
import { constantTimeTextEqual } from "@/server/crypto";
import type { InstagramCommentEvent, InstagramMessageEvent } from "@/server/instagram/types";

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
    messaging: z.array(z.unknown()).optional(),
  }).passthrough()),
}).passthrough();

const messagingEventSchema = z.object({
  sender: z.object({ id: metaIdSchema }),
  recipient: z.object({ id: metaIdSchema }),
  timestamp: metaIdSchema.optional(),
  is_self: z.boolean().optional(),
  message: z.object({
    mid: metaIdSchema.optional(),
    id: metaIdSchema.optional(),
    text: z.union([z.string(), z.number().transform(String)]).default(""),
    is_echo: z.boolean().optional(),
    is_self: z.boolean().optional(),
  }).passthrough(),
}).passthrough();

function messageIdFor(
  entryId: string,
  event: z.infer<typeof messagingEventSchema>,
) {
  const suppliedId = event.message.mid ?? event.message.id;
  if (suppliedId) return suppliedId;
  const fingerprint = [
    entryId,
    event.sender.id,
    event.recipient.id,
    event.timestamp ?? "",
    event.message.text,
  ].join("\u001f");
  return `derived:${createHash("sha256").update(fingerprint).digest("hex")}`;
}

export function verifyWebhookSignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature?.startsWith("sha256=")) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  return constantTimeTextEqual(signature, expected);
}

export function verifyWebhookSignatureWithSecrets(
  rawBody: string,
  signature: string | null,
  secrets: Array<string | undefined>,
) {
  const configuredSecrets = [...new Set(secrets.filter((secret): secret is string => Boolean(secret)))];
  return configuredSecrets.length > 0
    && configuredSecrets.some((secret) => verifyWebhookSignature(rawBody, signature, secret));
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

export function parseMessageEvents(rawBody: string): InstagramMessageEvent[] {
  const payload = webhookSchema.parse(JSON.parse(rawBody));
  return payload.entry.flatMap((entry) => {
    const directValues = entry.field === "messages" ? [entry.value] : [];
    const changedValues = (entry.changes ?? [])
      .filter((change) => change.field === "messages")
      .map((change) => change.value);
    const candidates = [...(entry.messaging ?? []), ...directValues, ...changedValues];

    return candidates.flatMap((candidate) => {
      const parsed = messagingEventSchema.safeParse(candidate);
      if (!parsed.success) return [];
      const event = parsed.data;
      return [{
        instagramUserId: entry.id,
        messageId: messageIdFor(entry.id, event),
        senderScopedId: event.sender.id,
        recipientId: event.recipient.id,
        text: event.message.text,
        isEcho: event.is_self === true
          || event.message.is_echo === true
          || event.message.is_self === true
          || event.sender.id === entry.id
          || event.recipient.id !== entry.id,
      }];
    });
  });
}
