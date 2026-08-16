export const contentPillars = ["ai_business", "automation_productivity", "content_sales"] as const;
export const contentGoals = ["leads", "followers", "saves", "shares", "education", "offer"] as const;
export const hookIntensities = ["safe", "provocative", "strong"] as const;
export const deliverableTypes = ["prompt", "checklist", "guide", "page"] as const;

export type ContentPillar = typeof contentPillars[number];
export type ContentGoal = typeof contentGoals[number];
export type HookIntensity = typeof hookIntensities[number];
export type DeliverableType = typeof deliverableTypes[number];
export type ContentProjectStatus = "idea" | "producing" | "ready" | "awaiting_publication" | "awaiting_media" | "automation_draft" | "active" | "archived";

export interface CreatorProfile {
  instagramHandle: string;
  niche: string;
  audience: string;
  voice: string;
  preferredTerms: string[];
  avoidedTerms: string[];
  defaultCta: string;
}

export interface ContentConcept {
  title: string;
  style: "safe" | "provocative" | "strong";
  hook: string;
  angle: string;
  audiencePain: string;
  promise: string;
  visualDirection: string;
  deliverableIdea: string;
  cta: string;
  keywords: [string, string, string];
}

export interface DeliverableSection {
  heading: string;
  body: string;
  items: string[];
  practicalTip?: string;
}

export interface DeliverableExample {
  title: string;
  scenario: string;
  application: string;
  result: string;
}

export interface DeliverableTemplate {
  title: string;
  description: string;
  content: string;
}

export interface DeliverablePitfall {
  mistake: string;
  correction: string;
}

export interface GeneratedDeliverable {
  title: string;
  summary: string;
  introduction: string;
  sections: DeliverableSection[];
  closing: string;
  authorHandle?: string;
  outcome?: string;
  estimatedMinutes?: number;
  difficulty?: "beginner" | "intermediate";
  prerequisites?: string[];
  examples?: DeliverableExample[];
  templates?: DeliverableTemplate[];
  pitfalls?: DeliverablePitfall[];
  nextSteps?: string[];
}

export interface ContentPackage {
  onScreenHook: string;
  visualDirection: string;
  shortCaption: string;
  mediumCaption: string;
  fullCaption: string;
  selectedKeyword: string;
  keywordSuggestions: [string, string, string];
  publicReplies: [string, string, string];
  dmMessages: [string, string, string];
  deliverable: GeneratedDeliverable;
}

export interface ContentProject {
  id: string;
  ownerId: string;
  sourceInsightId: string | null;
  title: string;
  topic: string;
  pillar: ContentPillar;
  primaryGoal: ContentGoal;
  secondaryGoal: ContentGoal | null;
  hookIntensity: HookIntensity;
  deliverableType: DeliverableType;
  notes: string;
  status: ContentProjectStatus;
  concepts: ContentConcept[];
  selectedConceptIndex: number | null;
  contentPackage: ContentPackage | null;
  mediaId: string | null;
  automationId: string | null;
  deliverableSlug: string | null;
  createdAt: string;
  updatedAt: string;
}
