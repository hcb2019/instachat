import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { contentConceptsOutputSchema, contentPackageSchema } from "@/lib/content-studio";
import { env, isDemoMode } from "@/lib/env";
import { HUMANIZER_PROMPT, formatInstagramCaption, humanizeText } from "@/lib/humanizer";
import type { ContentConcept, ContentPackage, ContentProject, CreatorProfile } from "@/types/content-studio";

export const CONTENT_PROMPT_VERSION = "content-studio-v1-humanizer";

const BASE_PROMPT = `Você é um estrategista de conteúdo brasileiro que escreve para Instagram.
Crie conteúdo útil, específico e plausível. Não invente estatística, resultado, experiência pessoal ou autoridade.
O formato é um Reel de 7 a 10 segundos, sem fala obrigatória, com um único texto fixo na tela e uma legenda conectada.
O hook deve caber em 3 a 6 linhas, ter entre 18 e 32 palavras e criar curiosidade sem clickbait enganoso.
Nunca copie frases dos exemplos de referência. Nunca use "link na bio": a entrega acontece após um comentário com palavra-chave.
Toda legenda deve começar exatamente com o @ informado. A palavra-chave, o CTA e o material precisam falar da mesma promessa.
Formate a legenda para ser colada sem ajustes no Instagram: parágrafos curtos, uma linha em branco entre blocos, listas fáceis de escanear e CTA isolado. Nunca entregue um bloco longo de texto.
${HUMANIZER_PROMPT}`;

function cleanConcept(concept: ContentConcept): ContentConcept {
  return { ...concept, title: humanizeText(concept.title), hook: humanizeText(concept.hook), angle: humanizeText(concept.angle), audiencePain: humanizeText(concept.audiencePain), promise: humanizeText(concept.promise), visualDirection: humanizeText(concept.visualDirection), deliverableIdea: humanizeText(concept.deliverableIdea), cta: humanizeText(concept.cta), keywords: concept.keywords.map((item) => item.normalize("NFKC").toLocaleUpperCase("pt-BR").replace(/[^\p{L}\p{N}]/gu, "").slice(0, 30)) as [string,string,string] };
}

function cleanPackage(value: ContentPackage, handle: string): ContentPackage {
  const caption = (text: string) => {
    const cleaned = humanizeText(text.replace(/^@[A-Za-z0-9._]+\s*/u, ""));
    return formatInstagramCaption(`${handle}\n\n${cleaned}`).slice(0, 2200);
  };
  return {
    ...value,
    onScreenHook: humanizeText(value.onScreenHook), visualDirection: humanizeText(value.visualDirection),
    shortCaption: caption(value.shortCaption), mediumCaption: caption(value.mediumCaption), fullCaption: caption(value.fullCaption),
    selectedKeyword: value.selectedKeyword.normalize("NFKC").toLocaleUpperCase("pt-BR").replace(/[^\p{L}\p{N}]/gu, ""),
    keywordSuggestions: value.keywordSuggestions.map((item) => item.normalize("NFKC").toLocaleUpperCase("pt-BR").replace(/[^\p{L}\p{N}]/gu, "")) as [string,string,string],
    publicReplies: value.publicReplies.map(humanizeText) as [string,string,string], dmMessages: value.dmMessages.map(humanizeText) as [string,string,string],
    deliverable: { ...value.deliverable, title: humanizeText(value.deliverable.title), summary: humanizeText(value.deliverable.summary), introduction: humanizeText(value.deliverable.introduction), sections: value.deliverable.sections.map((section) => ({ heading: humanizeText(section.heading), body: humanizeText(section.body), items: section.items.map(humanizeText) })), closing: humanizeText(value.deliverable.closing) },
  };
}

function fallbackConcepts(project: Pick<ContentProject,"topic"|"deliverableType">): ContentConcept[] {
  const topic = project.topic.replace(/[.!?]+$/u, "");
  return [
    { title: "O erro que custa tempo", style: "safe", hook: `Se você ainda faz ${topic.toLocaleLowerCase("pt-BR")} no braço, provavelmente está gastando mais tempo do que precisa.`, angle: "Mostrar uma tarefa cotidiana e o ponto exato em que a IA pode assumir a parte repetitiva.", audiencePain: "Falta de tempo e dificuldade para começar.", promise: "Uma primeira aplicação simples, sem trocar todo o processo.", visualDirection: "Grave uma tarefa comum no computador ou celular, com câmera parada e movimento discreto ao fundo.", deliverableIdea: `Um ${project.deliverableType === "prompt" ? "prompt" : "material"} curto para testar no mesmo dia.`, cta: "Comente TESTAR para receber o material no direct.", keywords: ["TESTAR","COMEÇAR","PRÁTICO"] },
    { title: "A ferramenta não é o problema", style: "provocative", hook: "Você não precisa conhecer mais uma ferramenta de IA. Precisa parar de usar dez ferramentas sem resolver uma tarefa inteira.", angle: "Confrontar o consumo de novidades e trocar a busca por ferramentas por uma aplicação completa.", audiencePain: "Excesso de informação e pouca execução.", promise: "Um jeito de escolher a IA a partir do problema real.", visualDirection: "Mostre várias abas abertas e feche todas até sobrar apenas uma tarefa na tela.", deliverableIdea: "Um checklist para escolher o que vale automatizar primeiro.", cta: "Comente FOCO para receber o checklist.", keywords: ["FOCO","ESCOLHER","FLUXO"] },
    { title: "Seu concorrente já automatizou", style: "strong", hook: "Enquanto você repete a mesma tarefa toda semana, alguém do seu mercado já entregou antes porque automatizou essa parte.", angle: "Criar urgência sem prometer dinheiro ou usar estatísticas inventadas.", audiencePain: "Processos manuais que atrasam atendimento, conteúdo ou venda.", promise: "Encontrar uma repetição que pode ser automatizada agora.", visualDirection: "Use um relógio, uma lista repetida ou a mesma ação sendo refeita no computador.", deliverableIdea: "Um mapa rápido para identificar tarefas repetitivas.", cta: "Comente MAPA para receber o material.", keywords: ["MAPA","AUTOMATIZAR","TEMPO"] },
  ];
}

function fallbackPackage(project: ContentProject, concept: ContentConcept, profile: CreatorProfile): ContentPackage {
  const keyword = concept.keywords[0];
  const lead = `${profile.instagramHandle}\n\n${concept.hook}\n\nO problema costuma aparecer numa tarefa pequena, daquelas que você repete sem perceber. Quando soma a semana inteira, virou tempo perdido.`;
  const cta = `\n\nComente ${keyword} e eu mando o material no seu direct.`;
  return cleanPackage({ onScreenHook: concept.hook, visualDirection: concept.visualDirection, shortCaption: `${lead}${cta}`, mediumCaption: `${lead}\n\nAntes de procurar outra ferramenta, anote a tarefa, o que entra e o resultado que precisa sair. Aí sim escolha a IA.${cta}`, fullCaption: `${lead}\n\nAntes de procurar outra ferramenta, faça um teste simples:\n\n1. Anote a tarefa que mais se repete.\n2. Separe o que muda e o que sempre fica igual.\n3. Defina como é uma resposta boa.\n\nIsso já dá contexto suficiente para montar um primeiro fluxo sem bagunçar seu processo inteiro.${cta}\n\nSalva para testar depois e segue ${profile.instagramHandle} para ver mais usos práticos de IA.`, selectedKeyword: keyword, keywordSuggestions: concept.keywords, publicReplies: ["Te mandei no direct. Confere lá!", "Prontinho, acabou de chegar na sua DM.", "Enviei agora. Dá uma olhada nas mensagens."], dmMessages: ["O material que você pediu está logo abaixo:", "Separei tudo por aqui. É só abrir:", "Pode acessar o material neste link:"], deliverable: { title: `${concept.title}: material prático`, summary: concept.deliverableIdea, introduction: `Use este material para aplicar ${project.topic.toLocaleLowerCase("pt-BR")} em uma tarefa real.`, sections: [{ heading: "Antes de começar", body: "Escolha uma tarefa pequena e repetitiva. Não tente automatizar o processo inteiro de uma vez.", items: ["O que inicia a tarefa?", "Quais dados ela usa?", "Como você sabe que terminou bem?"] }, { heading: "Teste rápido", body: "Rode uma primeira versão e confira o resultado antes de entregar para alguém.", items: ["Teste com um exemplo real", "Corrija instruções ambíguas", "Salve a versão que funcionou"] }], closing: "Comece pequeno. Se funcionar duas vezes do mesmo jeito, aí vale transformar em rotina." } }, profile.instagramHandle);
}

export class ContentStudioProvider {
  private client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: 60_000, maxRetries: 2 }) : null;

  async generateConcepts(project: ContentProject, profile: CreatorProfile) {
    if (isDemoMode || !this.client) return { concepts: fallbackConcepts(project).map(cleanConcept), usage: { inputTokens: 0, outputTokens: 0 } };
    const response = await this.client.responses.parse({ model: env.OPENAI_AUDIENCE_MODEL, store: false, instructions: `${BASE_PROMPT}\nGere exatamente três conceitos: seguro, provocativo e forte.`, input: JSON.stringify({ project, profile }), text: { format: zodTextFormat(contentConceptsOutputSchema, "content_concepts") } });
    if (!response.output_parsed) throw new Error("A IA não retornou conceitos válidos.");
    return { concepts: response.output_parsed.concepts.map(cleanConcept), usage: { inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 } };
  }

  async generatePackage(project: ContentProject, concept: ContentConcept, profile: CreatorProfile) {
    if (isDemoMode || !this.client) return { package: fallbackPackage(project, concept, profile), usage: { inputTokens: 0, outputTokens: 0 } };
    const response = await this.client.responses.parse({ model: env.OPENAI_AUDIENCE_MODEL, store: false, instructions: `${BASE_PROMPT}\nGere o pacote completo. As respostas públicas e DMs não devem repetir o hook nem citar o título do Reel. O entregável deve ter conteúdo de verdade, pronto para uso.`, input: JSON.stringify({ project, selectedConcept: concept, profile }), text: { format: zodTextFormat(contentPackageSchema, "content_package") } });
    if (!response.output_parsed) throw new Error("A IA não retornou o pacote de conteúdo.");
    return { package: cleanPackage(response.output_parsed, profile.instagramHandle), usage: { inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 } };
  }
}
