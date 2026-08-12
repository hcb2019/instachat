import { describe, expect, it } from "vitest";
import {
  automationMessageSuggestionsSchema,
  buildFallbackAutomationSuggestions,
  suggestionReferencesCaption,
  suggestionsAreSafeForCaption,
} from "@/lib/automation-suggestions";

describe("automation message suggestions", () => {
  it("returns three valid message pairs without copying the Reel caption", () => {
    const suggestions = buildFallbackAutomationSuggestions("Três maneiras de usar inteligência artificial no atendimento.");
    expect(suggestions).toHaveLength(3);
    expect(suggestionsAreSafeForCaption(suggestions, "Três maneiras de usar inteligência artificial no atendimento.")).toBe(true);
    expect(suggestions.every(({ dmMessage }) => dmMessage.length <= 150)).toBe(true);
    expect(new Set(suggestions.map(({ publicReply }) => publicReply)).size).toBe(3);
    expect(new Set(suggestions.map(({ dmMessage }) => dmMessage)).size).toBe(3);
    expect(automationMessageSuggestionsSchema.safeParse({ suggestions }).success).toBe(true);
  });

  it("never turns a call to follow an account into generated copy", () => {
    const caption = "Segue @hernando para acompanhar os próximos conteúdos.";
    const suggestions = buildFallbackAutomationSuggestions(caption);
    const combined = suggestions.flatMap(({ publicReply, dmMessage }) => [publicReply, dmMessage]).join(" ").toLocaleLowerCase("pt-BR");
    expect(combined).not.toContain("@hernando");
    expect(combined).not.toContain("segue");
    expect(suggestionsAreSafeForCaption(suggestions, caption)).toBe(true);
  });

  it("rejects AI copy that leaks a username or a specific caption term", () => {
    const caption = "Segue @hernando para conhecer o método Farol.";
    const base = buildFallbackAutomationSuggestions(caption)[0]!;
    expect(suggestionReferencesCaption({ ...base, publicReply: "Enviei o método Farol no direct." }, caption)).toBe(true);
    expect(suggestionReferencesCaption({ ...base, dmMessage: "Segue @hernando e confira:" }, caption)).toBe(true);
  });

  it("rotates the copy when the user generates again", () => {
    const first = buildFallbackAutomationSuggestions("Como planejar conteúdo para Reels.", 1);
    const second = buildFallbackAutomationSuggestions("Como planejar conteúdo para Reels.", 2);
    expect(second.map(({ publicReply }) => publicReply)).not.toEqual(first.map(({ publicReply }) => publicReply));
  });

  it("keeps working when a Reel has no caption", () => {
    const suggestions = buildFallbackAutomationSuggestions("");
    expect(suggestions).toHaveLength(3);
    expect(suggestionsAreSafeForCaption(suggestions, "")).toBe(true);
  });
});
