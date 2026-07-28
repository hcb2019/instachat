import { describe, expect, it } from "vitest";
import { automationSchema, formatPercent, keywordMatches, normalizeKeyword, selectReplyVariant } from "@/lib/domain";

describe("keyword normalization", () => {
  it("normaliza caixa, unicode e espaços", () => {
    expect(normalizeKeyword("  GUIA   RÁPIDO  ")).toBe("guia rápido");
    expect(keywordMatches("  １９９１ ", "1991")).toBe(true);
  });

  it("mantém pontuação relevante", () => {
    expect(keywordMatches("1991!", "1991")).toBe(false);
  });

  it("seleciona uma variação estável para o mesmo comentário", () => {
    const replies = ["Primeira", "Segunda", "Terceira"];
    expect(selectReplyVariant("comment-123", replies)).toBe(selectReplyVariant("comment-123", replies));
    expect(replies).toContain(selectReplyVariant("comment-456", replies));
    expect(selectReplyVariant("comment-1", ["", "Única"])).toBe("Única");
  });
});

describe("automation validation", () => {
  it("permite rascunho incompleto", () => {
    expect(automationSchema.safeParse({ name: "", mediaId: "", keyword: "", publicReply: "", dmMessage: "", destinationUrl: "", intent: "draft" }).success).toBe(true);
  });

  it("exige todos os campos e HTTPS na ativação", () => {
    const invalid = automationSchema.safeParse({ name: "A", mediaId: "id", keyword: "x", publicReply: "ok", publicReplyVariants: ["a", "b", "c"], dmMessage: "ok", dmMessageVariants: ["ok"], destinationUrl: "http://example.com", intent: "active" });
    expect(invalid.success).toBe(false);
    const valid = automationSchema.safeParse({ name: "A", mediaId: "id", keyword: "x", publicReply: "a", publicReplyVariants: ["a", "b", "c"], dmMessage: "ok", dmMessageVariants: ["ok", "aqui está"], destinationUrl: "https://example.com", intent: "active" });
    expect(valid.success).toBe(true);
  });

  it("calcula taxas sem divisão por zero", () => {
    expect(formatPercent(0, 0)).toBe("0%");
    expect(formatPercent(1, 4)).toBe("25%");
  });

  it("exige as duas mensagens quando a confirmação de seguidor está ativa", () => {
    const invalid = automationSchema.safeParse({
      name: "A", mediaId: "id", keyword: "x", publicReply: "ok", publicReplyVariants: ["a", "b", "c"], dmMessage: "ok", dmMessageVariants: ["ok"],
      destinationUrl: "https://example.com", requireFollow: true,
      followGateMessage: "", notFollowingMessage: "", intent: "active",
    });
    expect(invalid.success).toBe(false);
  });
});
