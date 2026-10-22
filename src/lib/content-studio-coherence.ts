import { textHitsCreatorBlacklist } from "@/lib/creator-identity";
import { formatInstagramCaption, humanizeText, inspectHumanizedText } from "@/lib/humanizer";
import { dedupeHashtags } from "@/lib/pipeline";
import type { ContentConcept, ContentPackage, ContentProject, CreatorProfile, GeneratedDeliverable } from "@/types/content-studio";

export const CAPTION_HOOK_WINDOW = 125;

const GENERIC_KEYWORDS = new Set<string>(["GUIA", "MAPA", "PRONTO", "MATERIAL", "CONTEUDO", "CONTEÚDO", "LINK", "BIO"]);
const STOPWORDS = new Set<string>(["a","ao","aos","as","com","como","da","das","de","do","dos","e","em","ensinar","explicar","falar","mostrar","o","os","para","por","que","se","sobre","um","uma","pra","pro","sua","seu","nao","não"]);

export interface CoherenceIssue {
  code: string;
  message: string;
}

export function normalizeStudioKeyword(value: string) {
  return value.normalize("NFKC").toLocaleUpperCase("pt-BR").replace(/[^\p{L}\p{N}]/gu, "").slice(0, 30);
}

export function captionPreview(caption: string, length = CAPTION_HOOK_WINDOW) {
  return caption.replace(/\s+/g, " ").trim().slice(0, length);
}

export function extractCaptionBody(caption: string, handle: string) {
  return caption.replace(new RegExp(`^${handle.replace(".", "\\.")}\\s*`, "u"), "").trim();
}

function significantTokens(input: string) {
  const candidates: string[] = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleUpperCase("pt-BR")
    .match(/[A-Z0-9]{4,}/g) ?? [];
  return candidates.filter((word, index) => !STOPWORDS.has(word.toLocaleLowerCase("pt-BR")) && candidates.indexOf(word) === index);
}

export function keywordsFromPromise(promise: string, topic: string, deliverableType: ContentProject["deliverableType"]): [string, string, string] {
  const preferred = significantTokens(`${promise} ${topic}`).filter((word) => !GENERIC_KEYWORDS.has(word));
  const typeFallback = { prompt: "PROMPT", checklist: "CHECK", guide: "PASSO", page: "PAGINA" }[deliverableType];
  const unique: string[] = [...preferred];
  for (const fallback of [typeFallback, "PROCESSO", "VORTEX"]) {
    if (fallback && !unique.includes(fallback)) unique.push(fallback);
  }
  return unique.slice(0, 3) as [string, string, string];
}

export function assembleCaption(options: {
  handle: string;
  hook: string;
  body?: string;
  keyword: string;
  cta?: string;
  hashtags?: string[];
}) {
  const hook = humanizeText(options.hook);
  const body = options.body ? humanizeText(options.body) : "";
  const cta = humanizeText(options.cta ?? `Comenta ${options.keyword} que eu te mando no direct.`);
  const blocks = [`${options.handle}\n\n${hook}`, body, cta].filter((block) => block.trim());
  const hashtags = (options.hashtags ?? []).slice(0, 5);
  if (hashtags.length) blocks.push(hashtags.map((tag) => tag.startsWith("#") ? tag : `#${tag}`).join(" "));
  return formatInstagramCaption(blocks.join("\n\n")).slice(0, 2200);
}

function collectPackageText(value: ContentPackage) {
  const deliverable = value.deliverable;
  return [
    value.onScreenHook,
    value.visualDirection,
    value.shortCaption,
    value.mediumCaption,
    value.fullCaption,
    ...value.publicReplies,
    ...value.dmMessages,
    deliverable.title,
    deliverable.summary,
    deliverable.introduction,
    deliverable.outcome,
    deliverable.startHere,
    deliverable.finalArtifact,
    deliverable.closing,
    ...(deliverable.sections ?? []).flatMap((section) => [section.heading, section.body, ...section.items]),
  ].filter((item): item is string => Boolean(item));
}

export function inspectPackageCoherence(
  value: ContentPackage,
  context: { concept: ContentConcept; profile: CreatorProfile; project: Pick<ContentProject, "deliverableType"> },
): CoherenceIssue[] {
  const issues: CoherenceIssue[] = [];
  const keyword = normalizeStudioKeyword(value.selectedKeyword);
  const handle = context.profile.instagramHandle;
  const promise = context.concept.promise.toLocaleLowerCase("pt-BR");
  const captions = [value.shortCaption, value.mediumCaption, value.fullCaption];

  if (!keyword) issues.push({ code: "keyword_missing", message: "A palavra-chave ficou vazia." });
  if (GENERIC_KEYWORDS.has(keyword) && !promise.includes(keyword.toLocaleLowerCase("pt-BR"))) {
    issues.push({ code: "keyword_generic", message: "A palavra-chave não é o verbo/objeto da promessa." });
  }

  for (const caption of captions) {
    if (!caption.startsWith(handle)) issues.push({ code: "caption_handle", message: "A legenda precisa começar com o @." });
    if (!caption.toLocaleUpperCase("pt-BR").includes(keyword)) issues.push({ code: "caption_keyword", message: "A legenda precisa pedir a palavra-chave." });
    const preview = captionPreview(caption);
    const hookStart = humanizeText(value.onScreenHook).slice(0, 40);
    if (hookStart && !preview.toLocaleLowerCase("pt-BR").includes(hookStart.slice(0, 24).toLocaleLowerCase("pt-BR"))) {
      issues.push({ code: "caption_hook_window", message: "O hook não aparece nos primeiros caracteres da legenda." });
    }
  }

  const dmBlob = value.dmMessages.join(" ").toLocaleLowerCase("pt-BR");
  const materialBlob = `${value.deliverable.title} ${value.deliverable.summary} ${value.deliverable.outcome ?? ""}`.toLocaleLowerCase("pt-BR");
  if (!dmBlob.includes("http") && !/abaixo|link|aqui|direct/i.test(dmBlob)) {
    issues.push({ code: "dm_delivery", message: "A DM precisa entregar o material." });
  }
  const promiseTokens = significantTokens(context.concept.promise).slice(0, 2);
  if (promiseTokens.length && !promiseTokens.some((token) => materialBlob.includes(token.toLocaleLowerCase("pt-BR")) || keyword.includes(token))) {
    issues.push({ code: "material_promise", message: "O material não fala da mesma promessa do hook." });
  }

  if (value.hashtags && value.hashtags.length > 5) {
    issues.push({ code: "hashtag_limit", message: "Use no máximo 5 hashtags." });
  }

  for (const text of collectPackageText(value)) {
    if (textHitsCreatorBlacklist(text)) issues.push({ code: "blacklist", message: "Apareceu termo da blacklist editorial." });
    const findings = inspectHumanizedText(text);
    if (findings.length) issues.push({ code: "ai_voice", message: findings[0]?.pattern ?? "Cara de IA" });
  }

  return uniqueIssues(issues);
}

function uniqueIssues(issues: CoherenceIssue[]) {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    if (seen.has(issue.code)) return false;
    seen.add(issue.code);
    return true;
  });
}

function withHandle(caption: string, handle: string) {
  const cleaned = formatInstagramCaption(caption.replace(/^@[A-Za-z0-9._]+\s*/u, ""));
  return formatInstagramCaption(`${handle}\n\n${cleaned}`).slice(0, 2200);
}

function ensureKeywordCta(caption: string, keyword: string) {
  if (caption.toLocaleUpperCase("pt-BR").includes(keyword)) return caption;
  return formatInstagramCaption(`${caption}\n\nComenta ${keyword} que eu te mando no direct.`);
}

function ensureHookWindow(caption: string, handle: string, hook: string, keyword: string) {
  const preview = captionPreview(caption);
  const hookStart = humanizeText(hook).slice(0, 40);
  if (hookStart && preview.toLocaleLowerCase("pt-BR").includes(hookStart.slice(0, 24).toLocaleLowerCase("pt-BR"))) return caption;
  const rest = extractCaptionBody(caption, handle).replace(humanizeText(hook), "").trim();
  return assembleCaption({ handle, hook, body: rest.replace(new RegExp(`comenta\\s+${keyword}.*$`, "iu"), "").trim(), keyword });
}

export function alignPackageCoherence(
  value: ContentPackage,
  context: { concept: ContentConcept; profile: CreatorProfile; project: Pick<ContentProject, "deliverableType"> },
): ContentPackage {
  const handle = context.profile.instagramHandle;
  const keyword = normalizeStudioKeyword(value.selectedKeyword) || keywordsFromPromise(context.concept.promise, context.concept.hook, context.project.deliverableType)[0];
  const hook = humanizeText(value.onScreenHook);
  const hashtags = dedupeHashtags(value.hashtags ?? []).slice(0, 5);
  const shortCaption = ensureHookWindow(ensureKeywordCta(withHandle(value.shortCaption, handle), keyword), handle, hook, keyword);
  const mediumCaption = ensureHookWindow(ensureKeywordCta(withHandle(value.mediumCaption, handle), keyword), handle, hook, keyword);
  const fullCaption = ensureHookWindow(ensureKeywordCta(withHandle(value.fullCaption, handle), keyword), handle, hook, keyword);
  const suggestions = value.keywordSuggestions.map((item) => normalizeStudioKeyword(item) || keyword) as [string, string, string];
  if (!suggestions.includes(keyword)) suggestions[0] = keyword;

  return {
    ...value,
    onScreenHook: hook,
    shortCaption,
    mediumCaption,
    fullCaption,
    selectedKeyword: keyword,
    keywordSuggestions: suggestions,
    hashtags,
    publicReplies: value.publicReplies.map((item) => humanizeText(item)) as [string, string, string],
    dmMessages: value.dmMessages.map((item) => humanizeText(item)) as [string, string, string],
    deliverable: sanitizeDeliverable(value.deliverable, handle),
  };
}

function sanitizeDeliverable(deliverable: GeneratedDeliverable, handle: string): GeneratedDeliverable {
  const text = (input?: string) => input ? humanizeText(input) : input;
  return {
    ...deliverable,
    authorHandle: handle,
    title: humanizeText(deliverable.title),
    summary: humanizeText(deliverable.summary),
    introduction: humanizeText(deliverable.introduction),
    outcome: text(deliverable.outcome),
    startHere: text(deliverable.startHere),
    finalArtifact: text(deliverable.finalArtifact),
    closing: humanizeText(deliverable.closing),
    completionCriteria: deliverable.completionCriteria?.map(humanizeText),
    prerequisites: deliverable.prerequisites?.map(humanizeText),
    nextSteps: deliverable.nextSteps?.map(humanizeText),
    resultPrompt: text(deliverable.resultPrompt),
    resultPlaceholder: text(deliverable.resultPlaceholder),
    finalApplication: text(deliverable.finalApplication),
    sections: deliverable.sections.map((section) => ({
      ...section,
      heading: humanizeText(section.heading),
      body: humanizeText(section.body),
      items: section.items.map(humanizeText),
      practicalTip: text(section.practicalTip),
      objective: text(section.objective),
      action: text(section.action),
      example: text(section.example),
      responsePrompt: text(section.responsePrompt),
      responsePlaceholder: text(section.responsePlaceholder),
      completionCriterion: text(section.completionCriterion),
    })),
    examples: deliverable.examples?.map((example) => ({
      title: humanizeText(example.title),
      scenario: humanizeText(example.scenario),
      application: humanizeText(example.application),
      result: humanizeText(example.result),
    })),
    templates: deliverable.templates?.map((template) => ({
      title: humanizeText(template.title),
      description: humanizeText(template.description),
      content: template.content.trim(),
    })),
    pitfalls: deliverable.pitfalls?.map((pitfall) => ({
      mistake: humanizeText(pitfall.mistake),
      correction: humanizeText(pitfall.correction),
    })),
    executionFlow: deliverable.executionFlow?.map((step) => ({
      ...step,
      title: humanizeText(step.title),
      instruction: humanizeText(step.instruction),
      copyableContent: step.copyableContent.trim(),
      customization: step.customization.map(humanizeText),
      expectedResult: humanizeText(step.expectedResult),
    })),
  };
}

export function deliverablePromiseLine(deliverable: GeneratedDeliverable) {
  const artifact = humanizeText(deliverable.finalArtifact || deliverable.outcome || deliverable.summary);
  const minutes = deliverable.estimatedMinutes ?? 10;
  const trimmed = artifact.replace(/\.$/, "");
  return `você vai sair com ${trimmed.charAt(0).toLocaleLowerCase("pt-BR")}${trimmed.slice(1)} em ${minutes} minutos`;
}
