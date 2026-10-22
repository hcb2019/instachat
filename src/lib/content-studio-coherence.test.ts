import { describe, expect, it } from "vitest";
import { alignPackageCoherence, assembleCaption, captionPreview, deliverablePromiseLine, inspectPackageCoherence, keywordsFromPromise } from "@/lib/content-studio-coherence";
import { buildDemoConcepts, buildDemoPackage } from "@/lib/content-studio-generation";
import { textHitsCreatorBlacklist } from "@/lib/creator-identity";
import type { ContentProject, CreatorProfile } from "@/types/content-studio";

const profile: CreatorProfile = {
  instagramHandle: "@hernando.ia",
  niche: "IA",
  audience: "autônomos",
  voice: "conversado",
  preferredTerms: ["na prática"],
  avoidedTerms: ["guru"],
  defaultCta: "Comenta VORTEX que eu te mando no direct.",
};

function project(type: ContentProject["deliverableType"] = "prompt"): ContentProject {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    ownerId: "owner",
    sourceInsightId: null,
    title: "Preço no Direct",
    topic: "Ensinar a responder preço sem encerrar a conversa.",
    pillar: "ai_business",
    primaryGoal: "leads",
    secondaryGoal: "saves",
    hookIntensity: "provocative",
    deliverableType: type,
    notes: "",
    status: "idea",
    concepts: [],
    selectedConceptIndex: null,
    contentPackage: null,
    mediaId: null,
    automationId: null,
    deliverableSlug: null,
    createdAt: "2026-08-17T00:00:00.000Z",
    updatedAt: "2026-08-17T00:00:00.000Z",
  };
}

describe("coerência do Estúdio", () => {
  it("extrai palavra-chave do verbo/objeto da promessa, não de coringas", () => {
    const keywords = keywordsFromPromise("Sair com um prompt pra responder preço", "orçamento no WhatsApp", "prompt");
    expect(keywords[0]).not.toBe("GUIA");
    expect(keywords.join(" ")).toMatch(/PRECO|PROMPT|ORCAMENTO|RESPONDER/);
  });

  it("coloca o hook na janela visível da legenda e isola o CTA", () => {
    const hook = "se a resposta parece IA, a pessoa desconfia de vc.";
    const caption = assembleCaption({ handle: "@hernando.ia", hook, body: "eu quase mandei o texto cru.", keyword: "PROCESSO" });
    expect(caption.startsWith("@hernando.ia")).toBe(true);
    expect(captionPreview(caption).toLocaleLowerCase("pt-BR")).toContain("se a resposta parece ia");
    expect(caption).toMatch(/Comenta PROCESSO/i);
    expect(caption).not.toContain("—");
  });

  it("bloqueia identidade e termos da blacklist", () => {
    expect(textHitsCreatorBlacklist("Eu sou um dev e isso mudou minha jornada")).toBe(true);
    expect(textHitsCreatorBlacklist("Mostro o processo na prática, com LGPD.")).toBe(false);
  });

  it("alinha hook, keyword e material na mesma promessa", () => {
    const current = project("prompt");
    const concept = buildDemoConcepts(current)[0];
    const pack = alignPackageCoherence(buildDemoPackage(current, concept, profile), { concept, profile, project: current });
    const issues = inspectPackageCoherence(pack, { concept, profile, project: current });
    expect(issues.filter((issue) => issue.code === "caption_handle" || issue.code === "caption_keyword")).toEqual([]);
    expect(pack.selectedKeyword.length).toBeGreaterThan(3);
    expect(pack.shortCaption.toLocaleUpperCase("pt-BR")).toContain(pack.selectedKeyword);
    expect(deliverablePromiseLine(pack.deliverable)).toMatch(/^você vai sair com .+ em \d+ minutos$/);
  });

  it("não força prompt de ChatGPT em checklist", () => {
    const current = project("checklist");
    const concept = buildDemoConcepts(current)[0];
    const pack = buildDemoPackage(current, concept, profile);
    expect(pack.deliverable.executionFlow).toBeUndefined();
    expect(pack.deliverable.resultPrompt).toBeUndefined();
    expect(pack.deliverable.sections[0]?.items[0]).not.toMatch(/\?$/);
  });
});
