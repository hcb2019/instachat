import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { contentConceptsOutputSchema, parseStoredContentConcepts, richContentPackageSchema } from "@/lib/content-studio";
import { buildConceptGenerationInput, buildDemoConcepts, buildDemoPackage, buildPackageGenerationInput } from "@/lib/content-studio-generation";
import { env, isDemoMode } from "@/lib/env";
import { HUMANIZER_PROMPT, formatInstagramCaption, humanizeContentHook, humanizeText } from "@/lib/humanizer";
import { hasValidOpenAIKeyShape } from "@/lib/openai-error";
import type { ContentConcept, ContentPackage, ContentProject, CreatorProfile } from "@/types/content-studio";

export const CONTENT_PROMPT_VERSION = "content-studio-v5-project-isolation";

const BASE_PROMPT = `Você é um estrategista de conteúdo brasileiro que escreve para Instagram.
Crie conteúdo útil, específico e plausível. Não invente estatística, resultado, experiência pessoal ou autoridade.
O formato é um Reel de 7 a 10 segundos, sem fala obrigatória, com um único texto fixo na tela e uma legenda conectada.
O hook deve caber em 3 a 6 linhas, ter entre 18 e 32 palavras e criar curiosidade sem clickbait enganoso.
Nunca copie frases dos exemplos de referência. Nunca use "link na bio": a entrega acontece após um comentário com palavra-chave.
Toda legenda deve começar exatamente com o @ informado. A palavra-chave, o CTA e o material precisam falar da mesma promessa.
O campo topic é um briefing, não é texto pronto. Remova comandos como "mostrar que", "ensinar", "explicar" e "falar sobre" antes de escrever. Leia o hook em voz alta e reescreva qualquer encontro de verbos que soe truncado.
Formate a legenda para ser colada sem ajustes no Instagram: parágrafos curtos, uma linha em branco entre blocos, listas fáceis de escanear e CTA isolado.
O entregável deve permitir que uma pessoa aplique a ideia sem pesquisar outra fonte.
Exija resultado concreto, tempo estimado, pré-requisitos, 4 a 7 etapas detalhadas, exemplos preenchidos, dois modelos copiáveis, erros comuns e próximos passos.
Cada etapa precisa explicar o que fazer, como fazer e como saber se ficou bom. Evite conselhos genéricos sem execução.
O material deve funcionar como jornada guiada. As etapas dependem umas das outras e levam a um artefato final claramente nomeado.
Logo no começo, diga a primeira ação de cinco minutos e o que estará pronto no fim. Toda pergunta deve produzir uma resposta usada na etapa seguinte.
Em cada etapa, preencha objective, action, example, responsePrompt, responsePlaceholder e completionCriterion. Use imperativo, exemplo preenchido e critério verificável.
Os itens do checklist são ações, nunca perguntas vagas. finalArtifact é uma única frase de até 18 palavras.
Crie executionFlow com 4 a 6 passos: preparar, copiar, personalizar, usar e aplicar. instruction tem no máximo duas frases curtas. customization diz literalmente o que substituir.
Use somente o briefing recebido nesta chamada. Cada chamada representa um projeto novo e isolado: não reutilize estrutura, exemplos, corpo, entregável ou frases de nenhum outro projeto.
Vincule todas as partes ao assunto, à promessa e ao tipo de entregável escolhidos. Não entregue um método genérico quando a promessa resolver uma situação específica.
Adapte a profundidade ao tipo: prompt inclui contexto, variáveis e exemplo; checklist usa critérios; guia ensina decisões; página funciona como ferramenta.
${HUMANIZER_PROMPT}`;

function cleanConcept(concept: ContentConcept, topic: string): ContentConcept {
  const cleaned = {
    ...concept,
    title: humanizeText(concept.title),
    hook: humanizeContentHook(concept.hook, topic),
    angle: humanizeText(concept.angle),
    audiencePain: humanizeText(concept.audiencePain),
    promise: humanizeText(concept.promise),
    visualDirection: humanizeText(concept.visualDirection),
    deliverableIdea: humanizeText(concept.deliverableIdea),
    cta: humanizeText(concept.cta),
    keywords: concept.keywords.map((item) => item.normalize("NFKC").toLocaleUpperCase("pt-BR").replace(/[^\p{L}\p{N}]/gu, "").slice(0, 30)) as [string, string, string],
  };
  return parseStoredContentConcepts([cleaned])[0] ?? concept;
}

function cleanPackage(value: ContentPackage, handle: string): ContentPackage {
  const caption = (text: string) => {
    const cleaned = humanizeText(text.replace(/^@[A-Za-z0-9._]+\s*/u, ""));
    return formatInstagramCaption(`${handle}\n\n${cleaned}`).slice(0, 2200);
  };
  return {
    ...value,
    onScreenHook: humanizeText(value.onScreenHook),
    visualDirection: humanizeText(value.visualDirection),
    shortCaption: caption(value.shortCaption), mediumCaption: caption(value.mediumCaption), fullCaption: caption(value.fullCaption),
    selectedKeyword: value.selectedKeyword.normalize("NFKC").toLocaleUpperCase("pt-BR").replace(/[^\p{L}\p{N}]/gu, ""),
    keywordSuggestions: value.keywordSuggestions.map((item) => item.normalize("NFKC").toLocaleUpperCase("pt-BR").replace(/[^\p{L}\p{N}]/gu, "")) as [string, string, string],
    publicReplies: value.publicReplies.map(humanizeText) as [string, string, string], dmMessages: value.dmMessages.map(humanizeText) as [string, string, string],
    deliverable: {
      ...value.deliverable,
      authorHandle: handle,
      title: humanizeText(value.deliverable.title), summary: humanizeText(value.deliverable.summary), introduction: humanizeText(value.deliverable.introduction),
      outcome: value.deliverable.outcome ? humanizeText(value.deliverable.outcome) : undefined,
      startHere: value.deliverable.startHere ? humanizeText(value.deliverable.startHere) : undefined,
      finalArtifact: value.deliverable.finalArtifact ? humanizeText(value.deliverable.finalArtifact) : undefined,
      completionCriteria: value.deliverable.completionCriteria?.map(humanizeText),
      executionFlow: value.deliverable.executionFlow?.map((step) => ({ ...step, title: humanizeText(step.title), instruction: humanizeText(step.instruction), copyableContent: step.copyableContent.trim(), customization: step.customization.map(humanizeText), expectedResult: humanizeText(step.expectedResult) })),
      resultPrompt: value.deliverable.resultPrompt ? humanizeText(value.deliverable.resultPrompt) : undefined,
      resultPlaceholder: value.deliverable.resultPlaceholder ? humanizeText(value.deliverable.resultPlaceholder) : undefined,
      finalApplication: value.deliverable.finalApplication ? humanizeText(value.deliverable.finalApplication) : undefined,
      prerequisites: value.deliverable.prerequisites?.map(humanizeText),
      sections: value.deliverable.sections.map((section) => ({ ...section, heading: humanizeText(section.heading), body: humanizeText(section.body), items: section.items.map(humanizeText), practicalTip: section.practicalTip ? humanizeText(section.practicalTip) : undefined, objective: section.objective ? humanizeText(section.objective) : undefined, action: section.action ? humanizeText(section.action) : undefined, example: section.example ? humanizeText(section.example) : undefined, responsePrompt: section.responsePrompt ? humanizeText(section.responsePrompt) : undefined, responsePlaceholder: section.responsePlaceholder ? humanizeText(section.responsePlaceholder) : undefined, completionCriterion: section.completionCriterion ? humanizeText(section.completionCriterion) : undefined })),
      examples: value.deliverable.examples?.map((example) => ({ title: humanizeText(example.title), scenario: humanizeText(example.scenario), application: humanizeText(example.application), result: humanizeText(example.result) })),
      templates: value.deliverable.templates?.map((template) => ({ title: humanizeText(template.title), description: humanizeText(template.description), content: template.content.trim() })),
      pitfalls: value.deliverable.pitfalls?.map((pitfall) => ({ mistake: humanizeText(pitfall.mistake), correction: humanizeText(pitfall.correction) })),
      nextSteps: value.deliverable.nextSteps?.map(humanizeText), closing: humanizeText(value.deliverable.closing),
    },
  };
}

export class ContentStudioProvider {
  private client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: 60_000, maxRetries: 2 }) : null;

  async generateConcepts(project: ContentProject, profile: CreatorProfile) {
    if (isDemoMode || !this.client) return { concepts: buildDemoConcepts(project).map((concept) => cleanConcept(concept, project.topic)), usage: { inputTokens: 0, outputTokens: 0 } };
    if (!hasValidOpenAIKeyShape(env.OPENAI_API_KEY)) throw Object.assign(new Error("Invalid OpenAI API key configuration"), { status: 401, code: "invalid_api_key" });
    const response = await this.client.responses.parse({ model: env.OPENAI_AUDIENCE_MODEL, store: false, instructions: `${BASE_PROMPT}\nGere exatamente três conceitos: seguro, provocativo e forte.`, input: JSON.stringify(buildConceptGenerationInput(project, profile)), text: { format: zodTextFormat(contentConceptsOutputSchema, "content_concepts") } });
    if (!response.output_parsed) throw new Error("A IA não retornou conceitos válidos.");
    return { concepts: response.output_parsed.concepts.map((concept) => cleanConcept(concept, project.topic)), usage: { inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 } };
  }

  async generatePackage(project: ContentProject, concept: ContentConcept, profile: CreatorProfile) {
    if (isDemoMode || !this.client) return { package: cleanPackage(buildDemoPackage(project, concept, profile), profile.instagramHandle), usage: { inputTokens: 0, outputTokens: 0 } };
    if (!hasValidOpenAIKeyShape(env.OPENAI_API_KEY)) throw Object.assign(new Error("Invalid OpenAI API key configuration"), { status: 401, code: "invalid_api_key" });
    const response = await this.client.responses.parse({ model: env.OPENAI_AUDIENCE_MODEL, store: false, instructions: `${BASE_PROMPT}\nGere o pacote completo. Respostas públicas e DMs não devem repetir o hook nem citar o título do Reel.`, input: JSON.stringify(buildPackageGenerationInput(project, concept, profile)), text: { format: zodTextFormat(richContentPackageSchema, "content_package") } });
    if (!response.output_parsed) throw new Error("A IA não retornou o pacote de conteúdo.");
    return { package: cleanPackage(response.output_parsed, profile.instagramHandle), usage: { inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 } };
  }
}
