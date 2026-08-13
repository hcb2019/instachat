import { describe, expect, it } from "vitest";
import { HUMANIZER_VERSION, formatInstagramCaption, humanizeText, inspectHumanizedText, textPassesHumanizer } from "@/lib/humanizer";

describe("humanizer", () => {
  it("remove fala de assistente e enchimento sem perder o conteúdo", () => {
    expect(humanizeText("Claro! Além disso, é importante destacar que você pode automatizar essa tarefa."))
      .toBe("Você pode automatizar essa tarefa.");
  });

  it("troca pontuação que costuma denunciar texto artificial", () => {
    expect(humanizeText("A ideia — que parece simples — funciona de verdade."))
      .toBe("A ideia, que parece simples, funciona de verdade.");
    expect(humanizeText("“Testa isso hoje”"))
      .toBe('"Testa isso hoje"');
  });

  it("preserva parágrafos e detalhes concretos", () => {
    expect(humanizeText("São 10 minutos.\n\nTeste com dois clientes amanhã."))
      .toBe("São 10 minutos.\n\nTeste com dois clientes amanhã.");
  });

  it("sinaliza padrões residuais de escrita artificial", () => {
    const findings = inspectHumanizedText("Não é apenas uma ferramenta, mas também uma jornada transformadora.");
    expect(findings.map(({ pattern }) => pattern)).toContain("paralelismo artificial");
    expect(textPassesHumanizer("Testa isso com um cliente antes de mudar o processo inteiro.")).toBe(true);
    expect(HUMANIZER_VERSION).toBe("humanizer-v1");
  });

  it("preserva a formatação pronta para colar no Instagram", () => {
    const caption = "@hernando.ia  \n\nPrimeiro parágrafo.   Segunda frase.\n\n\nComente GUIA para receber.";
    expect(formatInstagramCaption(caption)).toBe("@hernando.ia\n\nPrimeiro parágrafo. Segunda frase.\n\nComente GUIA para receber.");
  });
});
