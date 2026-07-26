export interface InstagramCommentEvent {
  instagramUserId: string;
  commentId: string;
  mediaId: string;
  mediaProductType: string;
  commenterScopedId: string;
  commenterUsername: string;
  text: string;
  isSelf: boolean;
}

export interface InstagramTokenResult {
  accessToken: string;
  userId: string;
  expiresIn: number | null;
  permissions: string[] | null;
}

export interface InstagramGateway {
  exchangeCode(code: string, redirectUri: string): Promise<InstagramTokenResult>;
  getProfile(accessToken: string): Promise<{ userId: string; username: string }>;
  subscribeToComments(userId: string, accessToken: string): Promise<void>;
  listReels(userId: string, accessToken: string): Promise<Array<{ externalId: string; caption: string; permalink: string; thumbnailUrl: string | null; publishedAt: string }>>;
  listComments(mediaId: string, accessToken: string, since: Date, limit: number): Promise<Array<{ commentId: string; commenterScopedId: string; commenterUsername: string; text: string; publishedAt: string }>>;
  getMediaInsights(mediaId: string, accessToken: string): Promise<{ comments: number; views: number; reach: number; shares: number; saved: number; totalInteractions: number; raw: Record<string, number> }>;
  replyToComment(commentId: string, message: string, accessToken: string): Promise<{ id: string }>;
  sendPrivateReply(userId: string, commentId: string, message: string, accessToken: string): Promise<{ recipientId: string; messageId: string }>;
}
