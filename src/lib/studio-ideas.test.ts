import { describe, expect, it } from "vitest";
import { INSTAGRAM_TREND_LIMIT, buildDemoStudioIdeas, studioIdeasOutputSchema } from "@/lib/studio-ideas";

describe("ideias automáticas do Estúdio", () => {
  it("devolve ideias modeladas, sem copiar terceiros, e documenta o limite da API", () => {
    const ideas = buildDemoStudioIdeas();
    expect(ideas).toHaveLength(6);
    expect(new Set(ideas.map((idea) => idea.topic)).size).toBe(6);
    expect(ideas.every((idea) => idea.topic.length >= 12)).toBe(true);
    expect(INSTAGRAM_TREND_LIMIT).toMatch(/não entrega Reels de terceiros/i);
    expect(studioIdeasOutputSchema.safeParse({ ideas, limitNote: INSTAGRAM_TREND_LIMIT }).success).toBe(true);
  });
});
