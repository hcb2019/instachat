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
    expect(suggestions.every(({ dmMessage, publicReply }) => dmMessage.includes("inteligência artificial") && publicReply.includes("inteligência artificial"))).toBe(true);
    expect(suggestions.every(({ dmMessage }) => dmMessage.length <= 150)).toBe(true);
    expect(new Set(suggestions.map(({ publicReply }) => publicReply)).size).toBe(3);
    expect(automationMessageSuggestionsSchema.safeParse({ suggestions }).success).toBe(true);
  });

  it("rotates the copy when the user generates again", () => {
    const first = buildFallbackAutomationSuggestions("Como planejar conteúdo para Reels.", 1);
    const second = buildFallbackAutomationSuggestions("Como planejar conteúdo para Reels.", 2);
    expect(second.map(({ publicReply }) => publicReply)).not.toEqual(first.map(({ publicReply }) => publicReply));
  });

  it("keeps working when a Reel has no caption", () => {
    const suggestions = buildFallbackAutomationSuggestions("");
    expect(suggestions[0]?.dmMessage).toContain("este conteúdo");
  });
});
