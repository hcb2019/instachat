import type { InstagramGateway } from "@/server/instagram/types";
import { demoStore } from "@/server/demo-store";

export class MockInstagramGateway implements InstagramGateway {
  async exchangeCode() {
    return {
      accessToken: "demo-token",
      userId: demoStore().connection.instagramUserId,
      expiresIn: 5_184_000,
      permissions: ["instagram_business_basic", "instagram_business_manage_comments", "instagram_business_manage_insights"],
    };
  }
  async getProfile() { return { userId: demoStore().connection.instagramUserId, username: demoStore().connection.username }; }
  async subscribeToComments() {}
  async listReels() { return demoStore().media.map((item) => ({ externalId: item.externalId, caption: item.caption, permalink: item.permalink, thumbnailUrl: item.thumbnailUrl, publishedAt: item.publishedAt })); }
  async listComments(mediaId: string) { return demoStore().audience.insights.flatMap((insight) => insight.evidence).filter((item, index, all) => item.mediaId === mediaId && all.findIndex(({ id }) => id === item.id) === index).map((item) => ({ commentId: item.id, commenterScopedId: `demo-${item.id}`, commenterUsername: item.username, text: item.text, publishedAt: item.publishedAt })); }
  async getMediaInsights(mediaId: string) { const index = Math.max(0, demoStore().media.findIndex(({ externalId }) => externalId === mediaId)); return { comments: 64 - index * 11, views: 18200 - index * 3100, reach: 13900 - index * 2200, shares: 312 - index * 48, saved: 528 - index * 73, totalInteractions: 1840 - index * 260, raw: {} }; }
  async replyToComment(commentId: string) { return { id: `reply-${commentId}` }; }
  async sendPrivateReply(_userId: string, commentId: string) { return { recipientId: `recipient-${commentId}`, messageId: `message-${commentId}` }; }
}
