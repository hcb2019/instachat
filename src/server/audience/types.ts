import type { AnonymousAudienceComment, AudienceProviderResult } from "@/types/audience";

export interface AudienceIntelligenceInput {
  comments: AnonymousAudienceComment[];
  periodDays: 7 | 30 | 90;
  context: {
    analyzedComments: number;
    reelCount: number;
  };
}

export interface AudienceIntelligenceProvider {
  analyze(input: AudienceIntelligenceInput): Promise<AudienceProviderResult>;
  synthesize(input: { results: AudienceProviderResult[]; periodDays: 7 | 30 | 90 }): Promise<{ insights: AudienceProviderResult["insights"]; usage: AudienceProviderResult["usage"] }>;
}
