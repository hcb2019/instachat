import "server-only";
import { isDemoMode } from "@/lib/env";
import { MockAudienceIntelligenceProvider } from "@/server/audience/mock-provider";
import { OpenAIAudienceIntelligenceProvider } from "@/server/audience/openai-provider";

export function audienceIntelligenceProvider() {
  return isDemoMode ? new MockAudienceIntelligenceProvider() : new OpenAIAudienceIntelligenceProvider();
}
