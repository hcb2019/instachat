import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { alignPackageCoherence, inspectPackageCoherence, normalizeStudioKeyword } from "@/lib/content-studio-coherence";
import { contentConceptsOutputSchema, openAIContentConceptsOutputSchema, openAIContentPackageSchemaFor, parseStoredContentConcepts, richContentPackageSchemaFor } from "@/lib/content-studio";
import { buildConceptGenerationInput, buildDemoConcepts, buildDemoPackage, buildHumanizeGenerationInput, buildPackageGenerationInput } from "@/lib/content-studio-generation";
import { buildConceptInstructions, buildHumanizeInstructions, buildPackageInstructions, CONTENT_PROMPT_VERSION } from "@/lib/content-studio-prompts";
import { mergeCreatorProfile } from "@/lib/creator-identity";
import { env, isDemoMode } from "@/lib/env";
import { formatInstagramCaption, humanizeContentHook, humanizeText, inspectHumanizedText } from "@/lib/humanizer";
import { hasValidOpenAIKeyShape } from "@/lib/openai-error";
import { INSTAGRAM_TREND_LIMIT, buildDemoStudioIdeas, studioIdeasOutputSchema, type StudioIdea, type StudioIdeaSignals } from "@/lib/studio-ideas";
import type { ContentConcept, ContentPackage, ContentProject, CreatorProfile } from "@/types/content-studio";

export { CONTENT_PROMPT_VERSION };

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
    keywords: concept.keywords.map((item) => normalizeStudioKeyword(item)).filter(Boolean) as [string, string, string],
  };
  return parseStoredContentConcepts([cleaned])[0] ?? concept;
}

function cleanPackage(value: ContentPackage, project: ContentProject, concept: ContentConcept, profile: CreatorProfile): ContentPackage {
  const handle = mergeCreatorProfile(profile).instagramHandle;
  const caption = (text: string) => formatInstagramCaption(`${handle}\n\n${humanizeText(text.replace(/^@[A-Za-z0-9._]+\s*/u, ""))}`).slice(0, 2200);
  const normalized: ContentPackage = {
    ...value,
    onScreenHook: humanizeContentHook(value.onScreenHook, project.topic),
    visualDirection: humanizeText(value.visualDirection),
    shortCaption: caption(value.shortCaption),
    mediumCaption: caption(value.mediumCaption),
    fullCaption: caption(value.fullCaption),
    selectedKeyword: normalizeStudioKeyword(value.selectedKeyword),
    keywordSuggestions: value.keywordSuggestions.map((item) => normalizeStudioKeyword(item)) as [string, string, string],
    publicReplies: value.publicReplies.map(humanizeText) as [string, string, string],
    dmMessages: value.dmMessages.map(humanizeText) as [string, string, string],
    hashtags: value.hashtags ?? [],
    deliverable: value.deliverable,
  };
  return alignPackageCoherence(normalized, { concept, profile: mergeCreatorProfile(profile), project });
}

function packageFindings(value: ContentPackage) {
  return inspectHumanizedText([
    value.onScreenHook,
    value.shortCaption,
    value.mediumCaption,
    value.fullCaption,
    ...value.publicReplies,
    ...value.dmMessages,
    value.deliverable.introduction,
    value.deliverable.summary,
  ].join("\n"));
}

export class ContentStudioProvider {
  private client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: 90_000, maxRetries: 2 }) : null;

  async generateConcepts(project: ContentProject, profile: CreatorProfile) {
    const merged = mergeCreatorProfile(profile);
    if (isDemoMode || !this.client) return { concepts: buildDemoConcepts(project).map((concept) => cleanConcept(concept, project.topic)), usage: { inputTokens: 0, outputTokens: 0 } };
    if (!hasValidOpenAIKeyShape(env.OPENAI_API_KEY)) throw Object.assign(new Error("Invalid OpenAI API key configuration"), { status: 401, code: "invalid_api_key" });
    const response = await this.client.responses.parse({
      model: env.OPENAI_AUDIENCE_MODEL,
      store: false,
      instructions: buildConceptInstructions(project.primaryGoal, project.deliverableType),
      input: JSON.stringify(buildConceptGenerationInput(project, merged)),
      text: { format: zodTextFormat(openAIContentConceptsOutputSchema, "content_concepts") },
    });
    if (!response.output_parsed) throw new Error("A IA não retornou conceitos válidos.");
    const parsed = contentConceptsOutputSchema.parse(response.output_parsed);
    return { concepts: parsed.concepts.map((concept) => cleanConcept(concept, project.topic)), usage: { inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 } };
  }

  async generatePackage(project: ContentProject, concept: ContentConcept, profile: CreatorProfile) {
    const merged = mergeCreatorProfile(profile);
    if (isDemoMode || !this.client) {
      return { package: cleanPackage(buildDemoPackage(project, concept, merged), project, concept, merged), usage: { inputTokens: 0, outputTokens: 0 } };
    }
    if (!hasValidOpenAIKeyShape(env.OPENAI_API_KEY)) throw Object.assign(new Error("Invalid OpenAI API key configuration"), { status: 401, code: "invalid_api_key" });

    const schema = openAIContentPackageSchemaFor(project.deliverableType);
    const generated = await this.client.responses.parse({
      model: env.OPENAI_AUDIENCE_MODEL,
      store: false,
      instructions: buildPackageInstructions(project.primaryGoal, project.deliverableType),
      input: JSON.stringify(buildPackageGenerationInput(project, concept, merged)),
      text: { format: zodTextFormat(schema, "content_package") },
    });
    if (!generated.output_parsed) throw new Error("A IA não retornou o pacote de conteúdo.");
    const firstPass = richContentPackageSchemaFor(project.deliverableType).parse(generated.output_parsed);

    let usage = { inputTokens: generated.usage?.input_tokens ?? 0, outputTokens: generated.usage?.output_tokens ?? 0 };
    let current = firstPass;
    try {
      const findings = packageFindings(firstPass).map((item) => item.pattern);
      const humanized = await this.client.responses.parse({
        model: env.OPENAI_AUDIENCE_MODEL,
        store: false,
        instructions: buildHumanizeInstructions(project.primaryGoal, project.deliverableType),
        input: JSON.stringify(buildHumanizeGenerationInput(project, concept, merged, firstPass, findings)),
        text: { format: zodTextFormat(schema, "content_package_humanized") },
      });
      if (humanized.output_parsed) {
        current = richContentPackageSchemaFor(project.deliverableType).parse(humanized.output_parsed);
        usage = {
          inputTokens: usage.inputTokens + (humanized.usage?.input_tokens ?? 0),
          outputTokens: usage.outputTokens + (humanized.usage?.output_tokens ?? 0),
        };
      }
    } catch {
      current = firstPass;
    }

    const cleaned = cleanPackage(current, project, concept, merged);
    void inspectPackageCoherence(cleaned, { concept, profile: merged, project });
    return { package: cleaned, usage };
  }

  async generateIdeas(profile: CreatorProfile, signals: StudioIdeaSignals): Promise<{ ideas: StudioIdea[]; limitNote: string; usage: { inputTokens: number; outputTokens: number } }> {
    const merged = mergeCreatorProfile(profile);
    if (isDemoMode || !this.client) {
      return { ideas: buildDemoStudioIdeas(), limitNote: INSTAGRAM_TREND_LIMIT, usage: { inputTokens: 0, outputTokens: 0 } };
    }
    if (!hasValidOpenAIKeyShape(env.OPENAI_API_KEY)) throw Object.assign(new Error("Invalid OpenAI API key configuration"), { status: 401, code: "invalid_api_key" });
    const response = await this.client.responses.parse({
      model: env.OPENAI_AUDIENCE_MODEL,
      store: false,
      instructions: `Você sugere ideias de Reels para ${merged.instagramHandle}.
Modele padrões de conteúdo de IA em alta (processo na prática, segurança/LGPD, empacotar método, tom humano). Nunca copie legenda, nome, identidade visual ou gancho literal de terceiros.
${INSTAGRAM_TREND_LIMIT}
Use os Reels do próprio criador e os pedidos da audiência quando existirem. Se não houver dado, apoie-se nos padrões, sem inventar métrica.
Voz: ${merged.voice}. Nicho: ${merged.niche}.
Nunca chame o criador de dev. Nunca fale de farda, quartel, Exército ou rua pessoal.
Devolva 6 ideias, cada uma com topic utilizável como briefing do Estúdio.`,
      input: JSON.stringify({ creator: merged, signals }),
      text: { format: zodTextFormat(studioIdeasOutputSchema, "studio_ideas") },
    });
    if (!response.output_parsed) throw new Error("A IA não retornou ideias.");
    const parsed = studioIdeasOutputSchema.parse(response.output_parsed);
    return {
      ideas: parsed.ideas.map((idea) => ({
        ...idea,
        title: humanizeText(idea.title),
        topic: humanizeText(idea.topic),
        hook: humanizeText(idea.hook),
        angle: humanizeText(idea.angle),
        reason: humanizeText(idea.reason),
      })),
      limitNote: INSTAGRAM_TREND_LIMIT,
      usage: { inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 },
    };
  }
}
