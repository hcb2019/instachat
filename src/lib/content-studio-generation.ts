import { assembleCaption, keywordsFromPromise } from "@/lib/content-studio-coherence";
import { buildCreatorBrief, mergeCreatorProfile } from "@/lib/creator-identity";
import { briefingToNaturalHook, humanizeText } from "@/lib/humanizer";
import type { ContentConcept, ContentPackage, ContentProject, CreatorProfile, DeliverableType, GeneratedDeliverable } from "@/types/content-studio";

function fitted(value: string, maximum: number) {
  const clean = humanizeText(value);
  return clean.length <= maximum ? clean : `${clean.slice(0, maximum - 1).trimEnd()}…`;
}

function subject(project: Pick<ContentProject, "title" | "topic">) {
  return fitted(project.title || briefingToNaturalHook(project.topic), 72);
}

function materialLabel(type: DeliverableType) {
  return { prompt: "prompt", checklist: "checklist", guide: "guia", page: "página prática" }[type];
}

/** Only the current project's briefing is sent to the model. Generated or stored packages are deliberately excluded. */
export function buildConceptGenerationInput(project: ContentProject, profile: CreatorProfile) {
  const creator = buildCreatorBrief(profile);
  return {
    projectKey: project.id,
    briefing: {
      title: project.title,
      topic: project.topic,
      notes: project.notes,
      pillar: project.pillar,
      primaryGoal: project.primaryGoal,
      secondaryGoal: project.secondaryGoal,
      hookIntensity: project.hookIntensity,
      deliverableType: project.deliverableType,
    },
    creator,
  };
}

export function buildPackageGenerationInput(project: ContentProject, concept: ContentConcept, profile: CreatorProfile) {
  return { ...buildConceptGenerationInput(project, profile), selectedConcept: concept };
}

export function buildHumanizeGenerationInput(
  project: ContentProject,
  concept: ContentConcept,
  profile: CreatorProfile,
  pack: ContentPackage,
  findings: string[],
) {
  return {
    ...buildPackageGenerationInput(project, concept, profile),
    package: pack,
    editorialFindings: findings,
  };
}

export function buildDemoConcepts(project: ContentProject): ContentConcept[] {
  const label = subject(project);
  const lower = label.toLocaleLowerCase("pt-BR");
  const naturalHook = briefingToNaturalHook(project.topic);
  const keywords = keywordsFromPromise(project.topic, project.title, project.deliverableType);
  const material = materialLabel(project.deliverableType);
  return [
    {
      title: fitted(`O ponto que muda ${label}`, 100), style: "safe", hook: fitted(naturalHook, 180),
      angle: fitted(`Abrir na cena real de ${lower} e mostrar o primeiro passo que a audiência consegue aplicar hoje.`, 500),
      audiencePain: fitted(`A pessoa reconhece o problema de ${lower}, mas trava na hora de agir.`, 300),
      promise: fitted(`Sair com um ${material} pra agir em ${lower} sem improviso.`, 300),
      visualDirection: fitted(`Mostre uma situação real ligada a ${lower}, sem dado pessoal, com o texto no centro.`, 400),
      deliverableIdea: fitted(`Um ${material} pra transformar a orientação de ${lower} em ação.`, 300),
      cta: `Comenta ${keywords[0]} que eu te mando no direct.`, keywords,
    },
    {
      title: fitted(`O erro por trás de ${label}`, 100), style: "provocative",
      hook: fitted(`O problema em ${lower} não começa na resposta final. Começa no detalhe que quase todo mundo ignora antes de agir.`, 180),
      angle: fitted(`Questionar a reação mais comum diante de ${lower} e mostrar por que ela não resolve a situação.`, 500),
      audiencePain: fitted(`A audiência tenta resolver ${lower} do jeito mais rápido e acaba repetindo o mesmo erro.`, 300),
      promise: fitted(`Identificar o detalhe que precisa mudar antes da próxima tentativa em ${lower}.`, 300),
      visualDirection: fitted(`Contraste na tela a reação automática e a abordagem recomendada para ${lower}.`, 400),
      deliverableIdea: fitted(`Um ${material} com diagnóstico e modelo de aplicação para ${lower}.`, 300),
      cta: `Comenta ${keywords[1]} que eu te mando no direct.`, keywords: [keywords[1], keywords[0], keywords[2]],
    },
    {
      title: fitted(`Pare de improvisar em ${label}`, 100), style: "strong",
      hook: fitted(`Se ${lower} ainda depende de improviso, vc pode estar perdendo a conversa no momento que mais importa.`, 180),
      angle: fitted(`Criar urgência pra trocar o improviso em ${lower} por um processo simples e repetível.`, 500),
      audiencePain: fitted(`Falta um processo claro pra lidar com ${lower} quando a situação acontece.`, 300),
      promise: fitted(`Sair com um roteiro curto pra usar na próxima situação real de ${lower}.`, 300),
      visualDirection: fitted(`Mostre uma decisão sendo tomada em poucos segundos e conecte a cena a ${lower}.`, 400),
      deliverableIdea: fitted(`Um ${material} pronto pra adaptar e usar na próxima situação de ${lower}.`, 300),
      cta: `Comenta ${keywords[2]} que eu te mando no direct.`, keywords: [keywords[2], keywords[0], keywords[1]],
    },
  ];
}

function demoCaptions(project: ContentProject, concept: ContentConcept, profile: CreatorProfile, keyword: string) {
  const handle = mergeCreatorProfile(profile).instagramHandle;
  const lower = subject(project).toLocaleLowerCase("pt-BR");
  return {
    shortCaption: assembleCaption({ handle, hook: concept.hook, keyword }),
    mediumCaption: assembleCaption({
      handle,
      hook: concept.hook,
      body: `eu quase deixei isso de lado pq parecia detalhe. o que segurou foi perceber que ${lower} trava a conversa antes da pessoa entender o valor.`,
      keyword,
    }),
    fullCaption: assembleCaption({
      handle,
      hook: concept.hook,
      body: `eu achava que o problema era responder rápido.\n\nna prática, o aperto vinha depois: a pessoa sumia sem entender o que estava comprando.\n\nisso ainda não está resolvido em todo atendimento. mas agora eu testo um roteiro curto antes de improvisar.`,
      keyword,
    }),
  };
}

function promptDeliverable(project: ContentProject, concept: ContentConcept, profile: CreatorProfile, keyword: string): GeneratedDeliverable {
  const label = subject(project);
  const lower = label.toLocaleLowerCase("pt-BR");
  const briefing = fitted(project.topic, 480);
  const practicalPrompt = `Quero aplicar esta orientação: ${briefing}\n\nMeu contexto:\n[DESCREVA QUEM VOCÊ ATENDE E O QUE ACONTECE HOJE]\n\nSituação real:\n[COLE OU RESUMA UM EXEMPLO SEM DADOS PESSOAIS]\n\nResultado que quero obter:\n[DESCREVA O QUE DEVE MUDAR]\n\nCrie uma resposta prática para essa situação. Ela precisa:\n1. atacar diretamente o problema descrito;\n2. explicar o valor antes da conclusão;\n3. usar linguagem natural e curta;\n4. terminar com uma pergunta simples que faça a conversa avançar.\n\nEntregue três versões e explique em uma linha quando usar cada uma. Não invente fatos, preços ou condições.`;
  return {
    authorHandle: profile.instagramHandle,
    title: fitted(`${label}: roteiro pra aplicar`, 140),
    summary: fitted(`${concept.deliverableIdea} Vc vai sair com três respostas prontas pro tema “${briefing}”.`, 500),
    introduction: fitted(`Este material é só do tema “${briefing}”. Vc descreve uma situação real, cola o prompt e sai com três respostas que mantêm a conversa andando.`, 1200),
    outcome: fitted(`Sair com três respostas aplicáveis a ${lower}, cada uma ligada a uma situação de uso.`, 600),
    startHere: fitted(`Separe uma situação recente de ${lower}. Tire nomes e dado pessoal antes de continuar.`, 500),
    finalArtifact: fitted(`Três respostas prontas e um critério pra escolher qual usar em ${lower}`, 180),
    completionCriteria: [
      `As respostas tratam diretamente de ${lower}`,
      "Nenhuma versão inventa fato, preço ou condição",
      "Cada resposta termina com um próximo passo claro",
      "Você sabe em qual situação usar cada versão",
    ],
    executionFlow: [
      { action: "prepare", title: "Separe uma situação real", instruction: `Escolha um caso recente de ${lower}. Remova nomes, contatos e qualquer dado pessoal.`, copyableContent: "", customization: [], expectedResult: "Você terá um exemplo real e anônimo para usar no restante do material." },
      { action: "copy", title: "Copie o prompt deste tema", instruction: "Copie o texto e substitua somente os campos entre colchetes.", copyableContent: practicalPrompt, customization: ["Troque [DESCREVA QUEM VOCÊ ATENDE] pelo seu público real", "Troque [SITUAÇÃO REAL] por um caso sem dados pessoais", "Troque [RESULTADO QUE QUERO OBTER] pela mudança desejada"], expectedResult: `O prompt ficará preenchido para uma situação concreta de ${lower}.` },
      { action: "use", title: "Cole na IA que você usa", instruction: "Cole o prompt preenchido no ChatGPT, Claude, Gemini ou outra IA. Responda se ela pedir algum contexto indispensável.", copyableContent: "", customization: [], expectedResult: "Você receberá três respostas diferentes, com indicação de quando usar cada uma." },
      { action: "apply", title: "Escolha sem misturar", instruction: `Compare as três versões com o caso de ${lower}. Escolha uma e ajuste somente detalhes verdadeiros do seu contexto.`, copyableContent: "", customization: [], expectedResult: "Você terá uma versão curta, verdadeira e adequada à situação escolhida." },
      { action: "apply", title: "Teste na próxima conversa", instruction: "Use a resposta escolhida em uma situação compatível e anote se a pessoa entendeu e avançou.", copyableContent: "", customization: [], expectedResult: "Você saberá o que manter e o que ajustar antes de repetir o roteiro." },
    ],
    resultPrompt: "Cole aqui as três respostas geradas pela IA e marque qual delas você vai testar primeiro.",
    resultPlaceholder: "VERSÃO 1\n...\n\nVERSÃO 2\n...\n\nVERSÃO 3\n...\n\nVou testar primeiro a versão __ porque...",
    finalApplication: `Use a versão escolhida somente em uma situação compatível com ${lower}. Depois, registre se a conversa avançou e ajuste o texto antes de reutilizá-lo.`,
    estimatedMinutes: 15,
    difficulty: "beginner",
    prerequisites: [`Uma situação real ligada a ${lower}`, "Acesso à ferramenta de IA que você prefere"],
    sections: [
      { heading: "Defina a situação", body: `Comece pelo caso real de ${lower}, não por uma frase genérica.`, objective: "Dar contexto suficiente para que a resposta tenha utilidade.", action: "Escreva quem perguntou, o que queria decidir e onde a conversa travou.", example: `Exemplo baseado no briefing: “${briefing}”`, responsePrompt: "Resuma a situação em até três linhas.", responsePlaceholder: "A pessoa perguntou...; ela precisava decidir...; a conversa travou quando...", completionCriterion: "Outra pessoa entende a situação sem precisar perguntar quem, o quê e por quê.", items: ["Escolha um caso recente", "Retire dados pessoais", "Registre o ponto em que a conversa travou"], practicalTip: "Use um caso que realmente aconteceu; exemplos inventados escondem os detalhes importantes." },
      { heading: "Defina o valor", body: `Liste o que precisa ser compreendido antes da conclusão em ${lower}.`, objective: "Evitar uma resposta que encerre a conversa cedo demais.", action: "Anote três informações que ajudam a pessoa a entender o valor da solução.", example: `Exemplo: resultado esperado, o que está incluído e qual informação falta para indicar o próximo passo.`, responsePrompt: "Quais três pontos precisam ficar claros?", responsePlaceholder: "1. ...\n2. ...\n3. ...", completionCriterion: "Os três pontos ajudam a decidir e nenhum deles é apenas um adjetivo vago.", items: ["Explique o resultado", "Mostre o que está incluído", "Identifique a informação que ainda falta"], practicalTip: "Troque palavras como ‘completo’ e ‘premium’ por algo que a pessoa consiga visualizar." },
      { heading: "Gere as respostas", body: `Use o prompt preparado especificamente para ${lower}.`, objective: "Criar alternativas sem perder a mesma promessa.", action: "Copie o prompt, preencha os campos e cole na IA de sua preferência.", example: "A saída deve trazer três versões e dizer quando usar cada uma.", responsePrompt: "Cole as três versões recebidas.", responsePlaceholder: "Versão 1:...\nVersão 2:...\nVersão 3:...", completionCriterion: "As três versões tratam do briefing e terminam com uma pergunta simples.", items: ["Preencha todos os colchetes", "Confira se não há fatos inventados", "Mantenha uma pergunta ao final"], practicalTip: "Se uma versão servir para qualquer assunto, ela ainda está genérica demais." },
      { heading: "Escolha uma versão", body: "Compare as opções com a situação real que você separou.", objective: "Evitar misturar pedaços de respostas com intenções diferentes.", action: "Escolha uma única versão e faça apenas os ajustes necessários ao contexto.", example: "Escolha: versão 2, porque explica o valor antes de perguntar o prazo.", responsePrompt: "Qual versão será usada e por quê?", responsePlaceholder: "Vou usar a versão __ porque...", completionCriterion: "A escolha está ligada ao caso real e pode ser explicada em uma frase.", items: ["Compare com o caso real", "Escolha uma versão", "Ajuste somente fatos do contexto"], practicalTip: "Não junte as três respostas. Uma mensagem curta e coerente funciona melhor." },
      { heading: "Teste e ajuste", body: `Aplique a versão em uma situação compatível com ${lower} e observe a continuidade.`, objective: "Transformar o texto em aprendizado para a próxima conversa.", action: "Registre o que a pessoa respondeu e qual trecho precisa ser mantido ou alterado.", example: "A pessoa explicou o prazo depois da pergunta final; manter a estrutura e encurtar a abertura.", responsePrompt: "O que aconteceu depois da resposta?", responsePlaceholder: "A conversa avançou quando...; na próxima vez vou...", completionCriterion: "Existe uma decisão clara sobre o que manter e o que ajustar.", items: ["Use em um caso compatível", "Observe a resposta seguinte", "Registre um ajuste específico"], practicalTip: "Avalie se a conversa avançou, não apenas se a mensagem parece bonita." },
    ],
    examples: [{ title: fitted(`Exemplo de aplicação em ${label}`, 100), scenario: briefing, application: "O usuário separa uma situação real, informa o que a pessoa precisava decidir e usa o prompt para criar três respostas.", result: "Ele escolhe uma versão que explica o valor, não inventa informações e termina com uma pergunta simples." }],
    templates: [
      { title: "Prompt adaptável", description: fitted(`Use este modelo para trabalhar ${lower} sem perder o contexto.`, 500), content: practicalPrompt },
      { title: "Registro do teste", description: "Preencha depois de usar a resposta escolhida.", content: `TEMA: ${briefing}\nSITUAÇÃO USADA: [RESUMA]\nVERSÃO ESCOLHIDA: [1, 2 OU 3]\nO QUE A PESSOA RESPONDEU: [RESPOSTA]\nO QUE FUNCIONOU: [TRECHO]\nO QUE VOU AJUSTAR: [MUDANÇA]` },
    ],
    pitfalls: [
      { mistake: "Usar uma resposta que serviria para qualquer assunto", correction: `Volte ao briefing de ${lower} e inclua o valor e a decisão específicos dessa situação.` },
      { mistake: "Misturar trechos das três versões", correction: "Escolha uma estrutura inteira antes de editar detalhes." },
      { mistake: "Inventar uma condição para deixar o texto convincente", correction: "Use somente informações que você consegue confirmar." },
    ],
    nextSteps: ["Separe um caso real", "Preencha e copie o prompt", "Escolha uma das três respostas", "Teste e registre um ajuste"],
    closing: fitted(`Você concluiu quando tiver uma resposta específica para ${lower}, souber quando usá-la e tiver um próximo ajuste registrado. Palavra-chave: ${keyword}.`, 600),
  };
}

function checklistDeliverable(project: ContentProject, concept: ContentConcept, profile: CreatorProfile, keyword: string): GeneratedDeliverable {
  const label = subject(project);
  const lower = label.toLocaleLowerCase("pt-BR");
  const briefing = fitted(project.topic, 480);
  return {
    authorHandle: profile.instagramHandle,
    title: fitted(`Checklist: ${label}`, 140),
    summary: fitted(`${concept.deliverableIdea} Marca cada ação. No fim vc sabe se ${lower} ficou utilizável.`, 500),
    introduction: fitted(`Isso não é um prompt. É a lista pra executar “${briefing}” em sequência, sem pular o que segura o resultado.`, 1200),
    outcome: fitted(`Sair com ${lower} conferido item a item, pronto pra usar na próxima situação real.`, 600),
    startHere: fitted(`Abra um caso real de ${lower} e vá marcando. Se um item não der pra marcar, pare e resolva ele antes de avançar.`, 500),
    finalArtifact: fitted(`Um checklist preenchido de ${lower}, com o que passou e o que ainda trava`, 180),
    estimatedMinutes: 12,
    difficulty: "beginner",
    prerequisites: [`Um caso real de ${lower}`, "10 minutos sem notificação"],
    completionCriteria: [
      "Cada item marcado tem um exemplo do seu caso",
      "Nenhum item inventa dado",
      "Você sabe o próximo passo depois da lista",
    ],
    sections: [
      { heading: "Antes de começar", body: `Separe o caso real de ${lower}. Sem caso, a lista vira teoria.`, items: ["Abrir um exemplo recente", "Tirar nome e dado pessoal", "Escrever em uma linha o que precisa sair pronto"], action: "Deixe o exemplo visível do lado da lista.", practicalTip: "Se vc não consegue descrever o caso em uma linha, o recorte ainda está amplo." },
      { heading: "Recorte a decisão", body: "A lista só funciona se atacar uma decisão, não um tema.", items: ["Nomear a decisão", "Dizer o que não entra agora", "Marcar quem precisa entender o resultado"], action: "Escreva a decisão em 8 palavras.", practicalTip: "Decisão boa cabe num post-it." },
      { heading: "Faça o núcleo", body: `Execute o miolo de ${lower} sem pular verificação.`, items: ["Aplicar o passo principal no caso real", "Conferir se a saída ainda fala do mesmo problema", "Ajustar só o que é verdadeiro no seu contexto"], action: "Não avance com item em aberto.", practicalTip: "Se ficou genérico, volte um item." },
      { heading: "Trava de segurança", body: "IA e processo nenhum dispensam o limite que vc define.", items: ["Marcar o que a ferramenta não pode inventar", "Conferir dado pessoal fora do texto", "Definir quem revisa antes de enviar"], action: "Escreva o limite em uma frase.", practicalTip: "O limite é parte do produto, não um aviso no rodapé." },
      { heading: "Fechamento", body: "A lista termina quando vc sabe usar de novo.", items: ["Registrar o que funcionou", "Anotar um ajuste", "Definir a próxima situação de teste"], action: "Escreva o próximo teste com data.", practicalTip: "Sem próximo teste, a lista vira arquivo morto." },
    ],
    pitfalls: [
      { mistake: "Tratar item como pergunta vaga", correction: "Reescreva com verbo: faça, marque, copie, revise." },
      { mistake: "Pular a trava de segurança", correction: "Dado pessoal e invenção de fato param o checklist." },
    ],
    nextSteps: ["Marcar o caso real", "Fechar os itens na ordem", "Testar na próxima conversa"],
    closing: fitted(`Se um item ficou em aberto, o material de ${lower} ainda não está pronto. Palavra-chave: ${keyword}.`, 600),
  };
}

function guideDeliverable(project: ContentProject, concept: ContentConcept, profile: CreatorProfile, keyword: string): GeneratedDeliverable {
  const label = subject(project);
  const lower = label.toLocaleLowerCase("pt-BR");
  const briefing = fitted(project.topic, 480);
  return {
    authorHandle: profile.instagramHandle,
    title: fitted(`Guia rápido: ${label}`, 140),
    summary: fitted(`${concept.deliverableIdea} Vc sai entendendo a decisão de ${lower}, não só colecionando dicas.`, 500),
    introduction: fitted(`Este guia existe pra “${briefing}”. Lê, decide, aplica. Não é um prompt único nem uma lista solta.`, 1200),
    outcome: fitted(`Sair com um critério pra decidir o próximo passo em ${lower}.`, 600),
    startHere: fitted(`Leia a cena de ${lower} que vc viveu nesta semana. O guia só funciona em cima dela.`, 500),
    finalArtifact: fitted(`Uma decisão escrita sobre ${lower}, com o porquê e o próximo passo`, 180),
    estimatedMinutes: 18,
    difficulty: "beginner",
    prerequisites: ["Um caso real da semana", "Papel ou nota aberta"],
    completionCriteria: ["A decisão cabe em duas frases", "O porquê não inventa número", "O próximo passo tem prazo"],
    sections: [
      { heading: "A cena", body: `Descreva ${lower} como aconteceu, não como deveria ser.`, items: ["Quem estava na conversa", "Onde travou", "O que vc sentiu na hora"], objective: "Ancorar o guia numa situação específica.", action: "Escreva a cena em 4 linhas.", example: briefing, practicalTip: "Se a cena serve pra qualquer negócio, ainda está genérica." },
      { heading: "A decisão escondida", body: "Quase sempre o erro não é a ferramenta. É a decisão que vc não nomeou.", items: ["Nomear a decisão", "Separar o que é medo do que é dado", "Escolher o que fica de fora"], objective: "Trocar improviso por critério.", action: "Escreva: eu preciso decidir X.", example: "Eu preciso decidir se respondo preço agora ou se explico o valor primeiro.", practicalTip: "Critério bom cabe numa pergunta." },
      { heading: "Como fazer", body: `O método curto pra ${lower}.`, items: ["Aplicar o critério no caso", "Revisar o que a IA não pode inventar", "Encerrar com uma pergunta que anda a conversa"], objective: "Sair com um jeito repetível.", action: "Execute no caso da semana.", example: "Resposta curta + valor + pergunta. Sem número inventado.", practicalTip: "Se ficou bonito e inútil, volte à cena." },
      { heading: "O que ainda fica aberto", body: "O guia não fecha a vida. Ele te deixa com um teste.", items: ["Marcar o que ainda é dúvida", "Escolher a próxima situação", "Anotar o que vc vai observar"], objective: "Honrar que o processo continua.", action: "Escreva o teste da próxima semana.", example: "Vou usar isso no próximo pedido de orçamento e ver se a pessoa responde.", practicalTip: "Fechamento triunfal é cara de IA." },
    ],
    examples: [{ title: fitted(`Um caso de ${label}`, 100), scenario: briefing, application: "A pessoa nomeia a decisão, aplica o critério e termina com uma pergunta.", result: "A conversa anda sem inventar condição." }],
    pitfalls: [
      { mistake: "Ler o guia como artigo", correction: "Pare no fim de cada bloco e escreva a sua resposta." },
      { mistake: "Copiar o exemplo literal", correction: "Troque a cena pela sua, senão o critério não cola." },
    ],
    nextSteps: ["Escrever a cena", "Nomear a decisão", "Testar na próxima conversa real"],
    closing: fitted(`O guia de ${lower} funcionou se vc souber o que fazer na próxima cena, não se o texto ficou bonito. Palavra-chave: ${keyword}.`, 600),
  };
}

function pageDeliverable(project: ContentProject, concept: ContentConcept, profile: CreatorProfile, keyword: string): GeneratedDeliverable {
  const label = subject(project);
  const lower = label.toLocaleLowerCase("pt-BR");
  const briefing = fitted(project.topic, 480);
  return {
    authorHandle: profile.instagramHandle,
    title: fitted(`Ferramenta: ${label}`, 140),
    summary: fitted(`${concept.deliverableIdea} Preenche na página e sai com o artefato de ${lower}.`, 500),
    introduction: fitted(`Esta página é uma ferramenta pra “${briefing}”. Não é aula. Vc preenche, copia, usa.`, 1200),
    outcome: fitted(`Sair da página com um texto ou plano pronto pra ${lower}.`, 600),
    startHere: fitted(`Preencha o primeiro bloco com um caso real de ${lower}. O resto da página só usa o que vc escrever aqui.`, 500),
    finalArtifact: fitted(`Um plano preenchido de ${lower}, pronto pra copiar e testar`, 180),
    estimatedMinutes: 10,
    difficulty: "beginner",
    prerequisites: ["Um caso real", "Algo pra colar depois (WhatsApp, e-mail ou IA)"],
    completionCriteria: ["Todos os blocos têm resposta do seu caso", "O texto final não inventa fato", "Vc sabe onde vai colar o resultado"],
    sections: [
      { heading: "Entrada", body: `Cole o caso de ${lower}.`, items: ["Quem pede", "O que chegou", "O que precisa sair"], objective: "Alimentar a ferramenta com um caso verdadeiro.", action: "Escreva a entrada em 5 linhas.", example: briefing, practicalTip: "Sem entrada real a página vira texto genérico." },
      { heading: "Limite", body: "O que esta ferramenta não pode inventar.", items: ["Dado pessoal fora", "Preço só se vc tiver", "Promessa só se for verdadeira"], objective: "Segurar segurança e LGPD no uso.", action: "Escreva o limite em uma linha.", example: "Não inventar prazo nem desconto.", practicalTip: "O limite vai junto do resultado, não depois." },
      { heading: "Saída", body: `Monte o artefato de ${lower}.`, items: ["Juntar entrada e limite", "Escrever a versão curta", "Marcar onde vai testar"], objective: "Sair com algo colável.", action: "Copie a saída e teste.", example: "Texto curto + pergunta final.", practicalTip: "Se a saída serve pra qualquer caso, volte à entrada." },
    ],
    templates: [{ title: "Bloco pra copiar", description: fitted(`Leve ${lower} embora da página.`, 500), content: `CASO: ${briefing}\nLIMITE: [O QUE NÃO INVENTAR]\nSAÍDA:\n[TEXTO CURTO]\nONDE VOU TESTAR: [SITUAÇÃO]` }],
    pitfalls: [
      { mistake: "Preencher com exemplo inventado", correction: "Use um caso da semana, mesmo que simples." },
      { mistake: "Sair sem copiar", correction: "O valor da página é o artefato, não a leitura." },
    ],
    nextSteps: ["Preencher a entrada", "Copiar a saída", "Testar na próxima conversa"],
    closing: fitted(`Se a página de ${lower} não gerou um texto colável, falta caso real. Palavra-chave: ${keyword}.`, 600),
  };
}

export function buildDemoPackage(project: ContentProject, concept: ContentConcept, profile: CreatorProfile): ContentPackage {
  const keyword = concept.keywords[0];
  const captions = demoCaptions(project, concept, profile, keyword);
  const deliverable = project.deliverableType === "checklist"
    ? checklistDeliverable(project, concept, profile, keyword)
    : project.deliverableType === "guide"
      ? guideDeliverable(project, concept, profile, keyword)
      : project.deliverableType === "page"
        ? pageDeliverable(project, concept, profile, keyword)
        : promptDeliverable(project, concept, profile, keyword);
  return {
    onScreenHook: concept.hook,
    visualDirection: concept.visualDirection,
    ...captions,
    selectedKeyword: keyword,
    keywordSuggestions: concept.keywords,
    hashtags: [],
    publicReplies: ["Te mandei no direct. Confere lá!", "Prontinho, acabou de chegar na sua DM.", "Enviei agora. Dá uma olhada nas mensagens."],
    dmMessages: ["O material que você pediu está logo abaixo:", "Separei o passo a passo por aqui. É só abrir:", "Pode acessar o material neste link:"],
    deliverable,
  };
}
