import { briefingToNaturalHook, humanizeText } from "@/lib/humanizer";
import type { ContentConcept, ContentPackage, ContentProject, CreatorProfile } from "@/types/content-studio";

const stopwords = new Set<string>(["a","ao","aos","as","com","como","da","das","de","do","dos","e","em","ensinar","explicar","falar","mostrar","o","os","para","por","que","se","sobre","um","uma"]);

function fitted(value: string, maximum: number) {
  const clean = humanizeText(value);
  return clean.length <= maximum ? clean : `${clean.slice(0, maximum - 1).trimEnd()}…`;
}

function subject(project: Pick<ContentProject, "title" | "topic">) {
  return fitted(project.title || briefingToNaturalHook(project.topic), 72);
}

function topicKeywords(project: Pick<ContentProject, "title" | "topic">): [string, string, string] {
  const candidates: string[] = `${project.title} ${project.topic}`
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleUpperCase("pt-BR")
    .match(/[A-Z0-9]{3,}/g) ?? [];
  const unique = candidates.filter((word, index) => !stopwords.has(word.toLocaleLowerCase("pt-BR")) && candidates.indexOf(word) === index);
  for (const fallback of ["GUIA", "PRONTO", "MATERIAL"]) if (!unique.includes(fallback)) unique.push(fallback);
  return unique.slice(0, 3) as [string, string, string];
}

/** Only the current project's briefing is sent to the model. Generated or stored packages are deliberately excluded. */
export function buildConceptGenerationInput(project: ContentProject, profile: CreatorProfile) {
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
    creator: profile,
  };
}

export function buildPackageGenerationInput(project: ContentProject, concept: ContentConcept, profile: CreatorProfile) {
  return { ...buildConceptGenerationInput(project, profile), selectedConcept: concept };
}

export function buildDemoConcepts(project: ContentProject): ContentConcept[] {
  const label = subject(project);
  const lower = label.toLocaleLowerCase("pt-BR");
  const naturalHook = briefingToNaturalHook(project.topic);
  const keywords = topicKeywords(project);
  const material = project.deliverableType === "prompt" ? "prompt" : project.deliverableType === "checklist" ? "checklist" : project.deliverableType === "guide" ? "guia" : "página prática";
  return [
    {
      title: fitted(`O ponto que muda ${label}`, 100), style: "safe", hook: fitted(naturalHook, 180),
      angle: fitted(`Explicar ${project.topic} com uma situação concreta e um próximo passo que a audiência consiga aplicar.`, 500),
      audiencePain: fitted(`A pessoa reconhece o problema de ${lower}, mas não sabe qual atitude tomar primeiro.`, 300),
      promise: fitted(`Entender como agir diante de ${lower} sem depender de improviso.`, 300),
      visualDirection: fitted(`Mostre uma situação real relacionada a ${lower}, sem dados pessoais, enquanto o texto permanece no centro.`, 400),
      deliverableIdea: fitted(`Um ${material} para transformar a orientação sobre ${lower} em uma ação prática.`, 300),
      cta: `Comente ${keywords[0]} para receber o material no direct.`, keywords,
    },
    {
      title: fitted(`O erro por trás de ${label}`, 100), style: "provocative",
      hook: fitted(`O problema em ${lower} não começa na resposta final. Começa no detalhe que quase todo mundo ignora antes de agir.`, 180),
      angle: fitted(`Questionar a reação mais comum diante de ${lower} e mostrar por que ela não resolve a situação.`, 500),
      audiencePain: fitted(`A audiência tenta resolver ${lower} do jeito mais rápido e acaba repetindo o mesmo erro.`, 300),
      promise: fitted(`Identificar o detalhe que precisa mudar antes da próxima tentativa.`, 300),
      visualDirection: fitted(`Contraste na tela a reação automática e a abordagem recomendada para ${lower}.`, 400),
      deliverableIdea: fitted(`Um ${material} com diagnóstico e modelo de aplicação para ${lower}.`, 300),
      cta: `Comente ${keywords[1]} para receber o passo a passo no direct.`, keywords: [keywords[1], keywords[0], keywords[2]],
    },
    {
      title: fitted(`Pare de improvisar em ${label}`, 100), style: "strong",
      hook: fitted(`Se ${lower} ainda depende de improviso, você pode estar perdendo a conversa justamente no momento que mais importa.`, 180),
      angle: fitted(`Criar urgência para substituir o improviso em ${lower} por um processo simples e repetível.`, 500),
      audiencePain: fitted(`Falta uma resposta ou processo claro para lidar com ${lower} quando a situação acontece.`, 300),
      promise: fitted(`Sair com um roteiro curto para usar na próxima situação real.`, 300),
      visualDirection: fitted(`Mostre uma decisão sendo tomada em poucos segundos e conecte a cena a ${lower}.`, 400),
      deliverableIdea: fitted(`Um ${material} pronto para adaptar e usar na próxima situação de ${lower}.`, 300),
      cta: `Comente ${keywords[2]} e eu envio o modelo no direct.`, keywords: [keywords[2], keywords[0], keywords[1]],
    },
  ];
}

export function buildDemoPackage(project: ContentProject, concept: ContentConcept, profile: CreatorProfile): ContentPackage {
  const label = subject(project);
  const lower = label.toLocaleLowerCase("pt-BR");
  const briefing = fitted(project.topic, 480);
  const keyword = concept.keywords[0];
  const lead = `${profile.instagramHandle}\n\n${concept.hook}\n\n${concept.audiencePain}\n\n${concept.promise}`;
  const cta = `\n\nComente ${keyword} e eu mando o material no seu direct.`;
  const practicalPrompt = `Quero aplicar esta orientação: ${briefing}\n\nMeu contexto:\n[DESCREVA QUEM VOCÊ ATENDE E O QUE ACONTECE HOJE]\n\nSituação real:\n[COLE OU RESUMA UM EXEMPLO SEM DADOS PESSOAIS]\n\nResultado que quero obter:\n[DESCREVA O QUE DEVE MUDAR]\n\nCrie uma resposta prática para essa situação. Ela precisa:\n1. atacar diretamente o problema descrito;\n2. explicar o valor antes da conclusão;\n3. usar linguagem natural e curta;\n4. terminar com uma pergunta simples que faça a conversa avançar.\n\nEntregue três versões e explique em uma linha quando usar cada uma. Não invente fatos, preços ou condições.`;
  return {
    onScreenHook: concept.hook,
    visualDirection: concept.visualDirection,
    shortCaption: `${lead}${cta}`,
    mediumCaption: `${lead}\n\nNa prática, observe onde ${lower} costuma travar. Em vez de repetir a resposta automática, explique o que a pessoa precisa entender e termine com uma pergunta que ajude a conversa a continuar.${cta}`,
    fullCaption: `${lead}\n\nUse este caminho na próxima vez:\n\n1. Identifique o que a pessoa realmente quer decidir.\n2. Explique o valor ligado a essa decisão.\n3. Faça uma pergunta curta para entender o próximo passo.\n\nO assunto deste Reel é: ${briefing}\n\nA ideia não é decorar uma frase. É ter clareza suficiente para adaptar a resposta sem perder o sentido.${cta}\n\nSalva para consultar depois e segue ${profile.instagramHandle} para mais aplicações práticas.`,
    selectedKeyword: keyword,
    keywordSuggestions: concept.keywords,
    publicReplies: ["Te mandei no direct. Confere lá!", "Prontinho, acabou de chegar na sua DM.", "Enviei agora. Dá uma olhada nas mensagens."],
    dmMessages: ["O material que você pediu está logo abaixo:", "Separei o passo a passo por aqui. É só abrir:", "Pode acessar o material neste link:"],
    deliverable: {
      authorHandle: profile.instagramHandle,
      title: fitted(`${label}: roteiro para aplicar`, 140),
      summary: fitted(`${concept.deliverableIdea} O material parte do briefing “${briefing}” e termina com uma resposta pronta para testar.`, 500),
      introduction: fitted(`Este material foi criado exclusivamente para o tema “${briefing}”. Você vai usar uma situação real, adaptar um prompt ao seu contexto e sair com três respostas que mantêm a conversa avançando.`, 1200),
      outcome: fitted(`Sair com três respostas aplicáveis a ${lower}, cada uma ligada a uma situação de uso e a um próximo passo claro.`, 600),
      startHere: fitted(`Separe uma situação recente relacionada a ${lower}. Retire nomes e dados pessoais antes de continuar.`, 500),
      finalArtifact: fitted(`Três respostas prontas e um critério para escolher qual usar em ${lower}.`, 180),
      completionCriteria: [
        `As respostas tratam diretamente de ${lower}`,
        "Nenhuma versão inventa fatos, preço ou condição",
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
      closing: fitted(`Você concluiu quando tiver uma resposta específica para ${lower}, souber quando usá-la e tiver um próximo ajuste registrado.`, 600),
    },
  };
}
