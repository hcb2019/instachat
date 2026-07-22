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

  it("rejects malformed payloads", () => {
    expect(() => parseCommentEvents(JSON.stringify({ object: "other", entry: [] }))).toThrow();
  });
});
