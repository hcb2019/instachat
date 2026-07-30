export type ConnectionStatus =
  | "disconnected"
  | "connected"
  | "expiring"
  | "expired"
  | "error";

export type AutomationStatus = "draft" | "active" | "paused" | "error" | "deleted";
export type RunStatus = "queued" | "processing" | "succeeded" | "partial" | "failed" | "ambiguous";
export type StepStatus = "pending" | "succeeded" | "failed" | "ambiguous" | "skipped";
export type FollowGateStatus = "not_required" | "awaiting_reply" | "not_following" | "verified" | "failed";

export interface InstagramConnection {
  id: string;
  ownerId: string;
  instagramUserId: string;
  username: string;
  status: ConnectionStatus;
  tokenExpiresAt: string | null;
  tokenRefreshedAt: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
}

export interface InstagramMedia {
  id: string;
  connectionId: string;
  externalId: string;
  caption: string;
  permalink: string;
  thumbnailUrl: string | null;
  publishedAt: string;
  insights?: {
    comments: number;
    views: number;
    reach: number;
    shares: number;
    saved: number;
    totalInteractions: number;
  } | null;
}

export interface Automation {
  id: string;
  ownerId: string;
  connectionId: string;
  mediaId: string | null;
  name: string;
  keyword: string;
  keywordNormalized: string;
  keywordVariants: string[];
  publicReply: string;
  publicReplyVariants: string[];
  dmMessage: string;
  dmMessageVariants: string[];
  destinationUrl: string;
  requireFollow: boolean;
  followGateMessage: string;
  notFollowingMessage: string;
  status: AutomationStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AutomationRun {
  id: string;
  automationId: string;
  automationName: string;
  mediaExternalId: string;
  commentId: string;
  commenterScopedId: string;
  commenterUsername: string;
  commentText: string;
  status: RunStatus;
  publicReplyStatus: StepStatus;
  dmStatus: StepStatus;
  publicReplyAttempts: number;
  dmAttempts: number;
  requireFollow: boolean;
  followStatus: FollowGateStatus;
  contentDeliveredAt: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  firstClickedAt: string | null;
  createdAt: string;
}

export interface DashboardMetrics {
  activeAutomations: number;
  matchedComments: number;
  eligibleRecipients: number;
  sentDms: number;
  uniqueClicks: number;
  failures: number;
  duplicates: number;
  lastRunAt: string | null;
}

export interface AutomationInput {
  id?: string;
  name: string;
  mediaId: string;
  keyword: string;
  keywordVariants: string[];
  publicReply: string;
  publicReplyVariants: string[];
  dmMessage: string;
  dmMessageVariants: string[];
  destinationUrl: string;
  requireFollow: boolean;
  followGateMessage: string;
  notFollowingMessage: string;
  intent: "draft" | "active";
}
