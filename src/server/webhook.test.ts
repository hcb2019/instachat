import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { parseCommentEvents, verifyWebhookSignature } from "@/server/webhook";

const payload = JSON.stringify({
  object: "instagram",
  entry: [{ id: "ig-owner", changes: [{ field: "comments", value: { id: "comment-1", text: "1991", from: { id: "person-1", username: "maria" }, media: { id: "reel-1", media_product_type: "REELS" } } }] }],
});

describe("Meta webhooks", () => {
  it("verifies the exact raw body", () => {
    const signature = `sha256=${createHmac("sha256", "secret").update(payload).digest("hex")}`;
    expect(verifyWebhookSignature(payload, signature, "secret")).toBe(true);
    expect(verifyWebhookSignature(`${payload} `, signature, "secret")).toBe(false);
    expect(verifyWebhookSignature(payload, null, "secret")).toBe(false);
  });

  it("maps a comment event without retaining the full envelope", () => {
    expect(parseCommentEvents(payload)).toEqual([{ instagramUserId: "ig-owner", commentId: "comment-1", mediaId: "reel-1", mediaProductType: "REELS", commenterScopedId: "person-1", commenterUsername: "maria", text: "1991", isSelf: false }]);
  });

  it("accepts the direct comment payload sent by the current Instagram API", () => {
    const directPayload = JSON.stringify({
      object: "instagram",
      entry: [{
        id: "ig-owner",
        field: "comments",
        value: {
          id: "comment-2",
          text: "QUERO",
          from: { username: "Maria.Silva" },
          media: { id: "reel-2", media_product_type: "REELS" },
        },
      }],
    });

    expect(parseCommentEvents(directPayload)).toEqual([{
      instagramUserId: "ig-owner",
      commentId: "comment-2",
      mediaId: "reel-2",
      mediaProductType: "REELS",
      commenterScopedId: "username:maria.silva",
      commenterUsername: "Maria.Silva",
      text: "QUERO",
      isSelf: false,
    }]);
  });

  it("accepts comment values sent as an array with optional author and media fields omitted", () => {
    const compactPayload = JSON.stringify({
      object: "instagram",
      entry: [{
        id: 12345,
        field: "comments",
        value: [{
          id: 67890,
          text: 1991,
          media: { id: 54321 },
        }],
      }],
    });

    expect(parseCommentEvents(compactPayload)).toEqual([{
      instagramUserId: "12345",
      commentId: "67890",
      mediaId: "54321",
      mediaProductType: "UNKNOWN",
      commenterScopedId: "comment:67890",
      commenterUsername: "instagram_user",
      text: "1991",
      isSelf: false,
    }]);
  });

  it("ignores unrelated webhook fields without rejecting the delivery", () => {
    const messagingPayload = JSON.stringify({
      object: "instagram",
      entry: [{
        id: "ig-owner",
        field: "messages",
        value: {
          id: "message-1",
          text: "oi",
          media: { id: "reel-1" },
        },
      }],
    });

    expect(parseCommentEvents(messagingPayload)).toEqual([]);
  });

  it("identifies comments made by the connected account", () => {
    const selfPayload = JSON.stringify({
      object: "instagram",
      entry: [{
        id: "ig-owner",
        changes: [{
          field: "comments",
          value: {
            id: "comment-self",
            text: "quero",
            from: {
              id: "ig-owner",
              username: "hernando.ia",
              self_ig_scoped_id: "ig-owner",
            },
            media: { id: "reel-1", media_product_type: "REELS" },
          },
        }],
      }],
    });

    expect(parseCommentEvents(selfPayload)[0]?.isSelf).toBe(true);
  });

  it("rejects malformed payloads", () => {
    expect(() => parseCommentEvents(JSON.stringify({ object: "other", entry: [] }))).toThrow();
  });
});
