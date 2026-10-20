import { describe, expect, it } from "vitest";
import {
  assertPipelineStatusTransition,
  buildCaptionWithHashtags,
  buildDefaultPipelineFlow,
  canTransitionPipelineStatus,
  dedupeHashtags,
  pipelinePostInputSchema,
} from "@/lib/pipeline";

describe("pipeline validation", () => {
  it("normaliza hashtags e limita em cinco itens", () => {
    expect(dedupeHashtags(["#IA", "ia", "Vortex"])).toEqual(["IA", "Vortex"]);
    expect(buildCaptionWithHashtags("Legenda", ["#IA", "vendas"])).toBe("Legenda\n\n#IA #vendas");
    const parsed = pipelinePostInputSchema.safeParse({
      caption: "Legenda",
      hashtags: ["a", "b", "c", "d", "e", "f"],
      keyword: "GUIA",
      deliverableType: "prompt",
      deliverableUrl: "https://example.com/material",
      conversationFlow: { steps: [] },
      scheduledAt: null,
      source: "api",
    });
    expect(parsed.success).toBe(false);
  });

  it("exige palavra-chave e URL HTTPS do material", () => {
    const parsed = pipelinePostInputSchema.safeParse({
      caption: "Legenda",
      hashtags: [],
      keyword: "   ",
      deliverableType: "app",
      deliverableUrl: "http://example.com/material",
      conversationFlow: { steps: [] },
      scheduledAt: null,
      source: "ui",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.keyword?.[0]).toBeDefined();
      expect(parsed.error.flatten().fieldErrors.deliverableUrl?.[0]).toBeDefined();
    }
  });

  it("aceita fluxo com botão final de URL e cria fluxo padrão quando vazio", () => {
    const parsed = pipelinePostInputSchema.safeParse({
      caption: "Legenda",
      hashtags: ["ia"],
      keyword: "GUIA",
      deliverableType: "sistema",
      deliverableUrl: "https://example.com/material",
      conversationFlow: {
        steps: [
          { id: "inicio", text: "Qual caminho?", buttons: [{ id: "a", label: "A", nextStepId: "final", url: null }] },
          { id: "final", text: "Aqui está", buttons: [{ id: "abrir", label: "Abrir", nextStepId: null, url: "https://example.com/material" }] },
        ],
      },
      scheduledAt: null,
      source: "api",
    });
    expect(parsed.success).toBe(true);
    expect(buildDefaultPipelineFlow("https://example.com/material").steps.at(1)?.buttons.at(0)?.url).toBe("https://example.com/material");
  });

  it("bloqueia fluxo sem botão final com URL", () => {
    const parsed = pipelinePostInputSchema.safeParse({
      caption: "Legenda",
      hashtags: [],
      keyword: "GUIA",
      deliverableType: "prompt",
      deliverableUrl: "https://example.com/material",
      conversationFlow: {
        steps: [
          { id: "inicio", text: "Escolha", buttons: [{ id: "a", label: "A", nextStepId: "inicio", url: null }] },
        ],
      },
      scheduledAt: null,
      source: "api",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("pipeline state machine", () => {
  it("permite o caminho feliz até automation_created", () => {
    expect(canTransitionPipelineStatus("draft", "uploading")).toBe(true);
    expect(canTransitionPipelineStatus("uploading", "processing")).toBe(true);
    expect(canTransitionPipelineStatus("processing", "published")).toBe(true);
    expect(canTransitionPipelineStatus("published", "automation_created")).toBe(true);
  });

  it("rejeita transições que pulam etapas terminais", () => {
    expect(canTransitionPipelineStatus("automation_created", "processing")).toBe(false);
    expect(() => assertPipelineStatusTransition("automation_created", "processing")).toThrow("Transição inválida");
  });
});
