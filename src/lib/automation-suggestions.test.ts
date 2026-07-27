import { describe, expect, it } from "vitest";
import {
  automationMessageSuggestionsSchema,
  buildFallbackAutomationSuggestions,
  reelTopicFromCaption,
} from "@/lib/automation-suggestions";

describe("automation message suggestions", () => {
  it("extracts a concise topic without links or hashtags", () => {
    expect(reelTopicFromCaption("Como organizar seu lançamento! https://exemplo.com #marketing")).toBe("Como organizar seu lançamento");
  });

  it("returns three valid contextual message pairs", () => {
    const suggestions = buildFallbackAutomationSuggestions("Três maneiras de usar inteligência artificial no atendimento.");
    expect(suggestions).toHaveLength(3);
    expect(suggestions.every(({ dmMessage }) => dmMessage.includes("inteligência artificial"))).toBe(true);
    expect(automationMessageSuggestionsSchema.safeParse({ suggestions }).success).toBe(true);
  });

  it("keeps working when a Reel has no caption", () => {
    const suggestions = buildFallbackAutomationSuggestions("");
    expect(suggestions[0]?.dmMessage).toContain("este conteúdo");
  });
});
