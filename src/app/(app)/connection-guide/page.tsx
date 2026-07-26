import Link from "next/link";
import { AlertTriangle, ArrowRight, AtSign, BookOpen, Boxes, Check, CheckCircle2, ChevronRight, CircleHelp, Clock3, Code2, ExternalLink, FileKey2, Globe2, KeyRound, LockKeyhole, MessageCircle, MousePointerClick, Radio, Rocket, ShieldCheck, TestTube2, UserRoundCheck, Webhook } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { CopyValue, GuideProgress, GuideRouteChoice, StepComplete } from "@/features/integration-guide/guide-client";
import { env, isDemoMode } from "@/lib/env";
import { getConnection } from "@/server/data";
import type { IntegrationGuideStep } from "@/types/integration-guide";

export const metadata = { title: "Guia de conexão com Instagram" };

const META_DOCS = "https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api";
const steps: IntegrationGuideStep[] = [
  {
    id: "professional-account", number: "01", phase: "prepare", title: "Prepare uma conta profissional", duration: "5–10 min", location: "Aplicativo do Instagram",
    summary: "A API oficial não funciona com perfil pessoal. Converta a conta para Business ou Creator antes de abrir o painel da Meta.",
    tasks: ["No Instagram, abra Configurações e atividade.", "Entre em Tipo e ferramentas da conta.", "Escolha Mudar para conta profissional e selecione Business ou Creator.", "Mantenha a conta pública durante a configuração e confirme que você consegue publicar/comentar normalmente."],
    checks: ["Conta Business ou Creator", "Login e senha disponíveis", "Autenticação em dois fatores recomendada"],
    warning: "Instagram API with Instagram Login não exige uma Página do Facebook vinculada.",
    action: { label: "Ver como preparar a conta no Instagram", href: "https://www.facebook.com/help/instagram/138925576505882?locale=pt_BR", external: true },
    reference: { label: "Visão geral oficial da Instagram API", href: META_DOCS }, illustration: "account",
  },
  {
    id: "meta-app", number: "02", phase: "meta", title: "Crie o aplicativo na Meta", duration: "10–15 min", location: "Meta for Developers",
    summary: "A Meta apresenta cinco telas antes de criar o aplicativo. Abaixo você verá exatamente o que preencher, qual cartão selecionar e quando apenas clicar em Avançar.",
    tasks: ["Abra o criador de aplicativos da Meta e faça login com a conta que administra seu negócio.", "Preencha o nome e um e-mail que você consulta regularmente.", "Selecione somente o caso de uso “Gerenciar mensagens e conteúdo no Instagram”.", "Escolha seu portfólio empresarial ou use a opção de continuar sem um, conforme explicado abaixo.", "Revise o resumo, crie o aplicativo e abra “Personalizar o caso de uso”."],
    checks: ["Caso de uso correto selecionado", "Aplicativo criado", "API setup with Instagram login aberto"],
    warning: "Não selecione Messenger nem WhatsApp. Depois da criação, não cole as URLs em “Login do Facebook para Empresas”; use a seção “API setup with Instagram login”.",
    action: { label: "Abrir a criação de aplicativo na Meta", href: "https://developers.facebook.com/apps/creation/", external: true },
    reference: { label: "Instagram API with Instagram Login — Meta", href: "https://www.postman.com/meta/instagram/folder/23987686-98bfade9-3736-4738-8b4a-f56d6534f6de" }, illustration: "app",
  },
  {
    id: "oauth", number: "03", phase: "meta", title: "Cadastre as URLs do login", duration: "5 min", location: "Instagram › API setup › Business login",
    summary: "A URL precisa coincidir exatamente com a enviada pelo InstaChat, incluindo HTTPS, domínio, caminho e presença ou ausência da barra final.",
    tasks: ["Abra a configuração de Business Login for Instagram.", "Em Valid OAuth Redirect URIs, adicione a URL de callback abaixo.", "Cadastre também as URLs de desautorização e exclusão de dados.", "Salve, recarregue a página e confirme que as três URLs continuam cadastradas."],
    checks: ["Callback OAuth salvo", "Desautorização cadastrada", "Exclusão de dados cadastrada"],
    warning: "Use o domínio definitivo HTTPS. localhost serve para a demonstração do painel, mas não para a conexão real da Meta.",
    action: { label: "Abrir o painel de aplicativos da Meta", href: "https://developers.facebook.com/apps/", external: true },
    reference: { label: "Documentação oficial do login", href: "https://www.postman.com/meta/instagram/folder/23987686-98bfade9-3736-4738-8b4a-f56d6534f6de" }, illustration: "oauth",
  },
  {
    id: "webhook", number: "04", phase: "meta", title: "Configure o webhook de comentários", duration: "10 min", location: "Instagram › Webhooks",
    summary: "O webhook avisa o InstaChat quando um comentário novo chega. A Meta fará um challenge de verificação antes de aceitar o endereço.",
    tasks: ["No produto Instagram, abra Webhooks/Configure webhooks.", "Cole a Callback URL mostrada abaixo.", "Use exatamente o mesmo valor de META_WEBHOOK_VERIFY_TOKEN configurado no servidor.", "Clique em verificar e salvar.", "Assine o campo comments. live_comments é opcional e não faz parte deste MVP."],
    checks: ["Challenge aprovado", "Campo comments assinado", "Endpoint HTTPS público"],
    warning: "O Verify Token não é o App Secret. Crie uma frase aleatória exclusiva; o App Secret nunca deve ser colado nesse campo.",
    action: { label: "Abrir o painel de webhooks da Meta", href: "https://developers.facebook.com/apps/", external: true },
    reference: { label: "Comentários e webhooks — Meta", href: `${META_DOCS}?entity=request-23987686-5216d45b-1e24-4bff-bdc8-e1bf15358477` }, illustration: "webhook",
  },
  {
    id: "environment", number: "05", phase: "instachat", title: "Configure os segredos do deploy", duration: "10 min", location: "Vercel/Supabase › Environment Variables",
    summary: "Copie App ID e App Secret para o ambiente do servidor. Nunca coloque segredos em arquivos versionados ou variáveis NEXT_PUBLIC_*.",
    tasks: ["Na Meta, copie o Instagram App ID e revele o Instagram App Secret.", "No provedor de deploy, crie as variáveis indicadas no quadro.", "Gere TOKEN_ENCRYPTION_KEY e WORKER_SECRET com valores aleatórios fortes.", "Defina DEMO_MODE=false e APP_ORIGIN para o domínio HTTPS sem barra final.", "Faça um novo deploy depois de salvar as variáveis."],
    checks: ["App ID configurado", "Segredos somente no servidor", "Novo deploy concluído"],
    warning: "Nunca envie App Secret, token de acesso ou chave de criptografia por print, GitHub Issue, chat público ou código do navegador.",
    action: { label: "Abrir variáveis de ambiente na Vercel", href: "https://vercel.com/hernando-candidos-projects/instachat/settings/environment-variables", external: true },
    reference: { label: "Boas práticas da Plataforma Meta", href: "https://developers.facebook.com/terms/" }, illustration: "environment",
  },
  {
    id: "test-account", number: "06", phase: "meta", title: "Libere a conta de teste", duration: "5–15 min", location: "Meta App Dashboard › Roles/API setup",
    summary: "Enquanto o app estiver em desenvolvimento, apenas contas adicionadas ao app e com as permissões corretas conseguirão concluir o login.",
    tasks: ["Adicione o administrador/desenvolvedor ao app quando necessário.", "Na configuração da Instagram API, adicione a conta profissional que será usada no teste.", "Entre no Instagram com essa conta e aceite qualquer convite pendente do app.", "Garanta que essa pessoa também controla a conta profissional escolhida.", "Mantenha o app em Development enquanto testa sua própria conta."],
    checks: ["Pessoa tem função no app", "Conta profissional adicionada", "Convite aceito"],
    warning: "Standard Access atende contas que você possui ou administra e adicionou ao App Dashboard. Contas de clientes exigem Advanced Access.",
    action: { label: "Abrir funções e contas do aplicativo", href: "https://developers.facebook.com/apps/", external: true },
    reference: { label: "Access Levels — documentação oficial", href: `${META_DOCS}?entity=request-23987686-26e7999c-fc7e-44c8-8f71-ab2de8d35c32` }, illustration: "connect",
  },
  {
    id: "connect-and-test", number: "07", phase: "validate", title: "Conecte e faça o teste controlado", duration: "10–20 min", location: "InstaChat e Instagram",
    summary: "O login concede acesso; o teste confirma o ciclo inteiro: Reel, webhook, correspondência, resposta pública, DM e clique.",
    tasks: ["No InstaChat, abra Integração e clique em Conectar Instagram.", "Na tela do Instagram, escolha a conta profissional e conceda os três escopos solicitados.", "Volte ao InstaChat e confirme status Conectada e Reels sincronizados.", "Crie uma automação de teste com palavra exclusiva e mantenha-a ativa.", "Com uma segunda conta, comente exatamente a palavra no Reel.", "Confira resposta pública, Solicitações do Direct, Histórico do InstaChat e clique rastreado."],
    checks: ["OAuth concluiu", "Reels sincronizados", "Webhook recebido", "Resposta pública e DM confirmadas"],
    warning: "Não teste comentando com a própria conta profissional: comentários próprios são ignorados para impedir loops.",
    action: { label: "Abrir a integração no InstaChat", href: "/settings" },
    reference: { label: "Private Replies — Meta", href: "https://www.postman.com/meta/instagram/request/23987686-189d7215-22b3-403f-b2f5-a46c7e66a514" }, illustration: "test",
  },
  {
    id: "publish", number: "08", phase: "publish", title: "Escolha como disponibilizar", duration: "Variável", location: "Meta App Review e GitHub",
    summary: "Publicar o código no GitHub e operar um SaaS são modelos diferentes. O nível de acesso e a responsabilidade pelos dados mudam.",
    tasks: ["Template GitHub: cada pessoa faz deploy e cria o próprio Meta App; publique apenas .env.example, nunca credenciais.", "Uso próprio: mantenha Standard Access e somente contas administradas por você.", "SaaS: solicite Advanced Access para basic, manage_comments e manage_insights.", "Prepare política de privacidade, exclusão de dados, termos, domínio verificado e screencast mostrando cada permissão em uso.", "Conclua verificação empresarial e Data Use Checkup quando solicitado pela Meta.", "Antes de abrir a terceiros, execute novo threat model, multi-tenancy, cobrança e suporte operacional."],
    checks: ["Modelo de distribuição escolhido", "Documentos públicos revisados", "App Review planejado quando necessário"],
    warning: "Colocar o app em modo Live não substitui Advanced Access. Sem aprovação, pessoas fora das funções/contas autorizadas não conseguirão usar as permissões avançadas.",
    action: { label: "Abrir documentação do App Review", href: "https://developers.facebook.com/docs/app-review/", external: true },
    reference: { label: "App Review — Meta for Developers", href: "https://developers.facebook.com/docs/app-review/" }, illustration: "review",
  },
];

function MetaIllustration({ kind }: { kind: IntegrationGuideStep["illustration"] }) {
  const content = {
    account: { title: "Instagram", icon: AtSign, rows: ["Tipo da conta", "Conta profissional", "Business ou Creator"] },
    app: { title: "Meta App Dashboard", icon: Boxes, rows: ["Criar aplicativo", "Adicionar Instagram API", "Instagram Login"] },
    oauth: { title: "Business Login", icon: KeyRound, rows: ["Valid OAuth Redirect URI", "Deauthorize URL", "Data deletion URL"] },
    webhook: { title: "Webhooks", icon: Webhook, rows: ["Callback URL", "Verify token", "comments ✓"] },
    environment: { title: "Environment", icon: FileKey2, rows: ["META_APP_ID", "META_APP_SECRET •••••", "DEMO_MODE=false"] },
    connect: { title: "App roles", icon: UserRoundCheck, rows: ["Administrador", "Conta profissional", "Standard Access"] },
    test: { title: "Teste ponta a ponta", icon: TestTube2, rows: ["Comentário: GUIA", "Resposta pública ✓", "Private reply ✓"] },
    review: { title: "Distribuição", icon: Rocket, rows: ["Template / Standard", "SaaS / Advanced", "App Review"] },
  }[kind];
  const Icon = content.icon;
  return <figure className={`meta-illustration illustration-${kind}`}><figcaption><span><Icon size={14} /></span>{content.title}<i>Ilustração</i></figcaption><div className="meta-window"><div className="meta-window-nav"><span /><span /><span /></div>{content.rows.map((row, index) => <div className="meta-window-row" key={row}><b>{index + 1}</b><span>{row}</span>{index === content.rows.length - 1 && <CheckCircle2 size={14} />}</div>)}</div></figure>;
}

function MetaAppCreationWalkthrough() {
  return <section className="meta-creation-walkthrough" aria-labelledby="meta-creation-title">
    <header>
      <div><p className="eyebrow">As telas que você verá na Meta</p><h3 id="meta-creation-title">Preencha exatamente nesta ordem</h3><p>Os nomes abaixo correspondem às telas atuais mostradas nos seus prints. A aparência pode mudar um pouco, mas os textos que você deve procurar são estes.</p></div>
      <div className="meta-correct-choice"><CheckCircle2 size={19} /><span><small>Opção correta</small><strong>Gerenciar mensagens e conteúdo no Instagram</strong></span></div>
    </header>
    <div className="meta-creation-screens">
      <article>
        <div className="meta-screen-heading"><span>1</span><div><small>Tela “Detalhes do app”</small><h4>Nome e contato</h4></div></div>
        <dl className="meta-fill-map">
          <div><dt>Nome do app</dt><dd>InstaChat</dd><small>Pode usar o nome da sua instalação ou empresa.</small></div>
          <div><dt>Email de contato do app</dt><dd>seu-email@exemplo.com</dd><small>Use um endereço real que você consulte regularmente.</small></div>
        </dl>
        <p className="meta-screen-next"><MousePointerClick size={15} /><span>Depois clique em <strong>Avançar</strong>.</span></p>
      </article>

      <article className="meta-screen-important">
        <div className="meta-screen-heading"><span>2</span><div><small>Tela “Casos de uso”</small><h4>Escolha Instagram</h4></div></div>
        <ol>
          <li>No filtro à esquerda, clique em <strong>Business Messaging</strong>.</li>
          <li>Marque o cartão <strong>Gerenciar mensagens e conteúdo no Instagram</strong>.</li>
          <li>Confirme que a caixa no canto direito do cartão ficou selecionada.</li>
        </ol>
        <div className="meta-do-dont"><p><Check size={14} /> Escolha Instagram</p><p><AlertTriangle size={14} /> Não escolha Messenger ou WhatsApp</p></div>
        <p className="meta-screen-next"><MousePointerClick size={15} /><span>Clique em <strong>Avançar</strong>.</span></p>
      </article>

      <article>
        <div className="meta-screen-heading"><span>3</span><div><small>Tela “Empresa”</small><h4>Portfólio empresarial</h4></div></div>
        <div className="meta-route-answer"><strong>Para sua própria conta</strong><p>Selecione um portfólio que você controla. Se ainda não tiver nenhum, escolha <em>“Ainda não quero me conectar a um portfólio empresarial”</em>; você poderá adicionar depois.</p></div>
        <div className="meta-route-answer advanced"><strong>Para atender clientes</strong><p>Selecione ou crie o portfólio da empresa que será dona do SaaS. Ele precisará ser verificado antes do Advanced Access.</p></div>
        <p className="meta-screen-next"><MousePointerClick size={15} /><span>Selecione uma opção e clique em <strong>Avançar</strong>.</span></p>
      </article>

      <article>
        <div className="meta-screen-heading"><span>4</span><div><small>Tela “Requisitos”</small><h4>Pode aparecer vazia</h4></div></div>
        <div className="meta-empty-state"><CheckCircle2 size={18} /><p>Se aparecer <strong>“Nenhum requisito identificado”</strong>, está tudo certo. Você não precisa preencher nada nessa tela.</p></div>
        <p className="meta-screen-next"><MousePointerClick size={15} /><span>Clique em <strong>Avançar</strong>.</span></p>
      </article>

      <article>
        <div className="meta-screen-heading"><span>5</span><div><small>Tela “Visão geral”</small><h4>Revise antes de criar</h4></div></div>
        <ul className="meta-review-list">
          <li><Check size={14} /> Nome e e-mail estão corretos.</li>
          <li><Check size={14} /> O caso de uso é “Gerenciar mensagens e conteúdo no Instagram”.</li>
          <li><Check size={14} /> O portfólio escolhido é o seu — ou você decidiu adicionar depois.</li>
        </ul>
        <p className="meta-screen-next"><MousePointerClick size={15} /><span>Clique no botão verde <strong>Criar aplicativo</strong>. A Meta pode pedir sua senha novamente.</span></p>
      </article>

      <article className="meta-screen-finish">
        <div className="meta-screen-heading"><span>6</span><div><small>Primeira tela do novo app</small><h4>Abra a configuração certa</h4></div></div>
        <ol>
          <li>No painel, clique em <strong>Personalizar o caso de uso “Gerenciar mensagens e conteúdo no Instagram”</strong>.</li>
          <li>Abra <strong>API setup with Instagram login</strong>.</li>
          <li>É nessa área que você encontrará o <strong>Instagram App ID</strong> e o <strong>Instagram App Secret</strong>.</li>
        </ol>
        <div className="meta-credential-warning"><AlertTriangle size={17} /><p>Use as credenciais da seção Instagram. <strong>Não use</strong> o App ID e o App Secret genéricos de “Configurações do app › Básico”.</p></div>
      </article>
    </div>
  </section>;
}

function UrlField({ label, value }: { label: string; value: string }) {
  return <div className="guide-url-field"><span>{label}</span><code>{value}</code><CopyValue value={value} /></div>;
}

function PhaseBadge({ phase }: { phase: IntegrationGuideStep["phase"] }) {
  const labels = { prepare: "Pré-requisito", meta: "Na Meta", instachat: "No deploy", validate: "Validação", publish: "Distribuição" };
  return <Badge tone={phase === "meta" ? "accent" : phase === "validate" ? "success" : phase === "publish" ? "warning" : "neutral"}>{labels[phase]}</Badge>;
}

export default async function ConnectionGuidePage() {
  const connection = await getConnection();
  const origin = env.APP_ORIGIN.replace(/\/$/, "");
  const urls = { oauth: `${origin}/api/meta/oauth/callback`, webhook: `${origin}/api/meta/webhook`, deauthorize: `${origin}/api/meta/deauthorize`, deletion: `${origin}/api/meta/data-deletion`, privacy: `${origin}/privacy` };
  const isPublicHttps = origin.startsWith("https://");
  return <div className="page-shell connection-guide-page">
    <header className="guide-hero">
      <div className="guide-hero-copy"><p className="eyebrow">Central de configuração</p><h1>Da conta profissional ao <em>primeiro comentário.</em></h1><p>Um roteiro completo para conectar a API oficial do Instagram com segurança — seja para sua própria conta, um template no GitHub ou um futuro SaaS.</p><div className="guide-hero-pills"><span><Clock3 size={14} /> 45–90 minutos</span><span><ShieldCheck size={14} /> Sem Página do Facebook</span><span><BookOpen size={14} /> 8 etapas verificáveis</span></div></div>
      <div className="guide-status-card"><div className={connection ? "guide-status-icon connected" : "guide-status-icon"}>{connection ? <CheckCircle2 size={24} /> : <AtSign size={24} />}</div><p className="eyebrow">Estado atual</p><h2>{connection ? `@${connection.username}` : "Conta não conectada"}</h2><p>{isDemoMode ? "Você está vendo uma conexão simulada. Siga o guia antes de desativar o modo demo." : connection ? "A conexão está salva. Use o teste controlado para validar os eventos." : "Complete as etapas e volte à Integração para autorizar a conta."}</p><Link href="/settings">Abrir integração <ArrowRight size={14} /></Link></div>
    </header>

    <GuideRouteChoice />

    <section className="guide-how-to" aria-label="Como usar este guia">
      <div><span>1</span><p><strong>Escolha seu caminho</strong>Clique em uma das duas opções acima.</p></div>
      <div><span>2</span><p><strong>Faça uma etapa por vez</strong>Use o botão “Abrir…” de cada etapa para chegar à tela correta.</p></div>
      <div><span>3</span><p><strong>Confirme e avance</strong>Marque a etapa como concluída somente depois de conferir os itens.</p></div>
    </section>

    <GuideProgress stepIds={steps.map(({ id }) => id)} />

    {!isPublicHttps && <Card className="guide-blocker"><AlertTriangle size={20} /><div><strong>O endereço atual ainda é local</strong><p>As URLs abaixo usam <code>{origin}</code>. Faça o deploy em um domínio HTTPS e atualize APP_ORIGIN antes de cadastrá-las na Meta.</p></div></Card>}

    <section className="guide-prerequisites"><div><CheckCircle2 size={17} /><span>Conta <strong>Business ou Creator</strong></span></div><div><Globe2 size={17} /><span>Domínio público com <strong>HTTPS</strong></span></div><div><Code2 size={17} /><span>Acesso ao <strong>deploy e variáveis</strong></span></div><div><LockKeyhole size={17} /><span>Conta Meta com <strong>2FA</strong></span></div></section>

    <section className="guide-timeline" id="guide-start" aria-label="Passo a passo da integração">{steps.map((step) => <article className="guide-step" id={step.id} key={step.id}>
      <aside><span>{step.number}</span><i /></aside>
      <div className="guide-step-main"><header><div><PhaseBadge phase={step.phase} /><h2>{step.title}</h2><p>{step.summary}</p></div><div className="guide-step-meta"><span><Clock3 size={15} /> {step.duration}</span><span><Globe2 size={15} /> Onde: {step.location}</span><a className="guide-step-action" href={step.action.href} target={step.action.external ? "_blank" : undefined} rel={step.action.external ? "noopener noreferrer" : undefined}>{step.action.label}{step.action.external ? <ExternalLink size={15} /> : <ArrowRight size={15} />}</a></div></header>
        <div className="guide-step-grid"><div><h3>O que fazer</h3><ol>{step.tasks.map((task) => <li key={task}><span>{task}</span></li>)}</ol></div><div className="guide-step-side"><MetaIllustration kind={step.illustration} /><div className="guide-verification"><h3>Antes de avançar</h3>{step.checks.map((check) => <p key={check}><Check size={12} /> {check}</p>)}</div></div></div>
        {step.id === "meta-app" && <MetaAppCreationWalkthrough />}
        {step.id === "oauth" && <div className="guide-url-stack"><UrlField label="Valid OAuth Redirect URI" value={urls.oauth} /><UrlField label="Deauthorize Callback URL" value={urls.deauthorize} /><UrlField label="Data Deletion Request URL" value={urls.deletion} /><UrlField label="Privacy Policy URL" value={urls.privacy} /></div>}
        {step.id === "webhook" && <div className="guide-url-stack"><UrlField label="Callback URL" value={urls.webhook} /><div className="guide-token-hint"><KeyRound size={15} /><span>Crie o valor de <code>META_WEBHOOK_VERIFY_TOKEN</code> no seu gerenciador de segredos e cole o mesmo texto na Meta.</span></div></div>}
        {step.id === "environment" && <div className="environment-map"><div><span>Variável</span><span>Origem</span></div>{[["META_APP_ID", "Instagram App ID"], ["META_APP_SECRET", "Instagram App Secret"], ["META_WEBHOOK_VERIFY_TOKEN", "Você cria"], ["META_GRAPH_API_VERSION", "Versão estável do dashboard"], ["APP_ORIGIN", "Seu domínio HTTPS"], ["DEMO_MODE", "false"]].map(([key, source]) => <div key={key}><code>{key}</code><span>{source}</span><CopyValue value={key!} label="Copiar nome" /></div>)}</div>}
        {step.id === "connect-and-test" && <div className="test-flow" aria-label="Fluxo do teste"><span><MessageCircle size={16} /> Segunda conta comenta</span><ChevronRight size={15} /><span><Radio size={16} /> Webhook chega</span><ChevronRight size={15} /><span><AtSign size={16} /> Resposta + DM</span><ChevronRight size={15} /><span><CheckCircle2 size={16} /> Histórico confirma</span></div>}
        <div className="guide-step-footer">{step.warning && <p><AlertTriangle size={14} /><span>{step.warning}</span></p>}<div><a href={step.reference?.href} target="_blank" rel="noopener noreferrer">{step.reference?.label}<ExternalLink size={13} /></a><StepComplete id={step.id} /></div></div>
      </div>
    </article>)}</section>

    <section className="guide-permissions"><div><p className="eyebrow">Privilégio mínimo</p><h2>As três permissões do InstaChat</h2><p>Não peça permissões de publicação ou mensagens gerais: este produto precisa apenas do perfil/Reels, comentários/private replies e Insights.</p></div><div className="permission-list"><article><code>instagram_business_basic</code><span>Perfil e mídias próprias</span></article><article><code>instagram_business_manage_comments</code><span>Comentários, respostas públicas e uma private reply</span></article><article><code>instagram_business_manage_insights</code><span>Métricas do Radar</span></article></div></section>

    <section className="guide-troubleshooting"><div className="section-heading"><div><p className="eyebrow">Diagnóstico rápido</p><h2>Se algo não funcionar</h2></div></div><div>{[
      ["Redirect URI mismatch", "Compare caractere por caractere com a URL cadastrada; revise HTTPS e barra final."],
      ["Permissão não aparece", "Confirme que escolheu Instagram Login e os escopos instagram_business_*, não o fluxo com Facebook Login."],
      ["Conta não aparece no login", "Converta para profissional, adicione-a ao App Dashboard e aceite o convite pendente."],
      ["Webhook verifica, mas não recebe comentários", "Assine comments, reconecte a conta e confirme que o comentário veio de uma segunda conta em um Reel próprio."],
      ["DM não chegou", "Veja a pasta Solicitações. A Meta permite somente uma private reply, em até sete dias do comentário."],
      ["Funciona para mim, não para clientes", "Standard Access é restrito a contas próprias/gerenciadas. Solicite Advanced Access e App Review."],
    ].map(([title, answer]) => <details key={title}><summary><CircleHelp size={15} />{title}<ChevronRight size={14} /></summary><p>{answer}</p></details>)}</div></section>

    <footer className="guide-final-cta"><div><p className="eyebrow">Próximo passo</p><h2>Terminou o checklist?</h2><p>Abra a integração, autorize a conta profissional e execute o teste com uma segunda conta.</p></div><Link className="button button-primary" href="/settings">Ir para Integração <ArrowRight size={15} /></Link></footer>
  </div>;
}
