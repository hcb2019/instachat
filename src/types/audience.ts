export const audienceCategories = [
  "purchase_intent",
  "question",
  "objection",
  "content_request",
  "support",
  "praise",
  "irrelevant",
] as const;

export type AudienceCategory = (typeof audienceCategories)[number];
export type AudienceSentiment = "positive" | "neutral" | "negative";
export type InsightStatus = "new" | "reviewed" | "converted" | "dismissed";
export type InsightFeedback = "useful" | "not_useful" | null;
export type AnalysisStatus = "queued" | "running" | "succeeded" | "failed" | "skipped";

export interface AudienceEvidence {
  id: string;
  text: string;
  username: string;
  mediaId: string;
  mediaCaption: string;
  publishedAt: string;
}

export interface AudienceTheme {
  id: string;
  label: string;
  summary: string;
  volume: number;
  share: number;
  trend: number;
  confidence: number;
  relatedMediaIds: string[];
  evidence: AudienceEvidence[];
}

export interface ContentSuggestion {
  hook: string;
  angle: string;
  outline: string[];
  cta: string;
  keyword: string;
  publicReply: string;
  dmMessage: string;
}

export interface AudienceInsight {
  id: string;
  category: AudienceCategory;
  title: string;
  summary: string;
  recommendation: string;
  confidence: number;
  evidenceCount: number;
  isEarlySignal: boolean;
  status: InsightStatus;
  feedback: InsightFeedback;
  priority: number;
  mediaIds: string[];
  evidence: AudienceEvidence[];
  contentSuggestion: ContentSuggestion | null;
  createdAutomationId: string | null;
  createdAt: string;
}

export interface AudienceAnalysisRun {
  id: string;
  status: AnalysisStatus;
  model: string;
  promptVersion: string;
  periodDays: 7 | 30 | 90;
  commentCount: number;
  inputTokens: number;
  outputTokens: number;
  durationMs: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface AudienceRadarMetrics {
  analyzedComments: number;
  openQuestions: number;
  purchaseIntent: number;
  contentRequests: number;
  objections: number;
  lastUpdatedAt: string | null;
}

export interface AudienceRadarData {
  metrics: AudienceRadarMetrics;
  themes: AudienceTheme[];
  insights: AudienceInsight[];
  ideas: AudienceInsight[];
  latestRun: AudienceAnalysisRun | null;
}

export interface AnonymousAudienceComment {
  alias: string;
  text: string;
  mediaCaption: string;
  publishedAt: string;
}

export interface AudienceClassification {
  alias: string;
  category: AudienceCategory;
  sentiment: AudienceSentiment;
  urgency: number;
  confidence: number;
  theme: string;
  opportunity: string;
}

export interface AudienceProviderResult {
  classifications: AudienceClassification[];
  insights: Array<{
    category: AudienceCategory;
    title: string;
    summary: string;
    recommendation: string;
    confidence: number;
    evidenceAliases: string[];
    priority: number;
    suggestion: ContentSuggestion | null;
  }>;
  usage: { inputTokens: number; outputTokens: number };
}
