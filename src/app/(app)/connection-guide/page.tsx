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
    id: "instagram-api-setup", number: "03", phase: "meta", title: "Abra a configuração correta da API", duration: "5–10 min", location: "Casos de uso › Personalizar › API do Instagram",
    summary: "A tela correta mostra Instagram App ID, Instagram App Secret e quatro blocos numerados. Use essa área — não o Auxiliar de integração e não a configuração com Facebook Login.",
    tasks: ["No painel do app, clique em Personalizar o caso de uso.", "No menu da API do Instagram, abra a opção de configuração com login do Instagram.", "Confirme que aparecem as permissões instagram_business_* e o domínio graph.instagram.com.", "Clique em Add all required permissions.", "Em Permissões e recursos, adicione também instagram_business_manage_insights para habilitar o Radar.", "Copie o Instagram App ID; revele o Instagram App Secret somente quando for configurar a Vercel."],
    checks: ["Tela com credenciais do Instagram aberta", "Permissões obrigatórias adicionadas", "manage_insights disponível"],
    warning: "Se a tela mostrar instagram_basic, pages_read_engagement ou pages_show_list, você abriu o fluxo com Facebook Login. Volte e escolha a outra opção.",
    action: { label: "Abrir o painel de aplicativos da Meta", href: "https://developers.facebook.com/apps/", external: true },
    reference: { label: "Instagram API with Instagram Login — Meta", href: "https://www.postman.com/meta/instagram/folder/23987686-98bfade9-3736-4738-8b4a-f56d6534f6de" }, illustration: "oauth",
  },
  {
    id: "test-account", number: "04", phase: "meta", title: "Adicione sua conta como testadora", duration: "5–15 min", location: "Funções do app e API setup",
    summary: "Enquanto o app usa Standard Access, a conta profissional precisa estar associada ao app. A própria tela da Meta pede que a função de Testador do Instagram seja atribuída antes de clicar em Adicionar conta.",
    tasks: ["Abra Funções do app › Funções e adicione a pessoa administradora quando necessário.", "Adicione o perfil profissional como Testador do Instagram.", "Entre no Instagram com esse perfil, abra Apps e sites › Convites de teste e aceite o convite.", "Volte para Configuração da API com login do Instagram.", "No bloco 2, Gerar tokens de acesso, clique em Adicionar conta e conclua o login.", "Se gerar um token manual, use-o somente para testes na Meta; o InstaChat obterá e armazenará seu próprio token pelo OAuth."],
    checks: ["Função de testador adicionada", "Convite aceito no Instagram", "Conta aparece no bloco Gerar tokens"],
    warning: "Não cole o token manual em código, GitHub ou variáveis públicas. Para o uso normal, o botão Conectar Instagram do InstaChat fará a autorização.",
    action: { label: "Abrir funções e contas do aplicativo", href: "https://developers.facebook.com/apps/", external: true },
    reference: { label: "Access Levels — documentação oficial", href: `${META_DOCS}?entity=request-23987686-26e7999c-fc7e-44c8-8f71-ab2de8d35c32` }, illustration: "connect",
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
    id: "callbacks", number: "06", phase: "meta", title: "Configure webhook e login do Instagram", duration: "10–15 min", location: "API setup with Instagram login › blocos 3 e 4",
    summary: "No bloco 3 ficam a URL do webhook e o Verify Token. No bloco 4, o botão Configurar abre as URLs do login da empresa no Instagram.",
    tasks: ["No bloco 3, Configurar webhooks, cole a Callback URL abaixo.", "Em Verificar token, cole exatamente o valor de META_WEBHOOK_VERIFY_TOKEN salvo na Vercel.", "Deixe desativada a opção de certificado de cliente e clique em Verificar e salvar.", "Assine o campo comments; live_comments é opcional.", "No bloco 4, Configurar o login da empresa no Instagram, clique em Configurar.", "Cadastre as URLs de OAuth, desautorização e exclusão de dados mostradas abaixo."],
    checks: ["Webhook verificado", "Campo comments assinado", "URLs do Instagram Business Login salvas"],
    warning: "A própria Meta informa que o app precisa estar Publicado para receber webhooks reais. Você pode cadastrar os endereços agora, mas os eventos só serão validados ponta a ponta após a etapa 7.",
    action: { label: "Abrir a configuração da API do Instagram", href: "https://developers.facebook.com/apps/", external: true },
    reference: { label: "Comentários e webhooks — Meta", href: `${META_DOCS}?entity=request-23987686-5216d45b-1e24-4bff-bdc8-e1bf15358477` }, illustration: "webhook",
  },
  {
    id: "publish", number: "07", phase: "publish", title: "Publique o app no nível certo", duration: "Variável", location: "Meta App Dashboard › Publicar",
    summary: "O status Publicado libera webhooks reais. Standard Access atende somente suas contas e testadores; contas de clientes continuam exigindo Advanced Access e App Review.",
    tasks: ["Revise nome, ícone, domínio, política de privacidade, exclusão de dados e e-mail de contato.", "Para uso próprio ou template, mantenha Standard Access e somente contas que você administra/adicionou ao app.", "Abra Publicar no menu lateral e resolva qualquer requisito indicado pela Meta.", "Altere o status para Publicado.", "Para SaaS, não abra a terceiros ainda: prepare verificação empresarial, App Review e Advanced Access para basic, manage_comments e manage_insights."],
    checks: ["Documentos públicos acessíveis", "Status Publicado", "Nível de acesso entendido"],
    warning: "Publicado não significa aprovado para qualquer cliente. Sem Advanced Access, apenas contas próprias, administradas ou associadas ao app poderão autorizar.",
    action: { label: "Abrir o painel de publicação da Meta", href: "https://developers.facebook.com/apps/", external: true },
    reference: { label: "App Review — Meta for Developers", href: "https://developers.facebook.com/docs/app-review/" }, illustration: "review",
  },
  {
    id: "connect-and-test", number: "08", phase: "validate", title: "Conecte e faça o teste controlado", duration: "10–20 min", location: "InstaChat e Instagram",
    summary: "O login concede acesso; o teste confirma o ciclo inteiro: Reel, webhook, correspondência, resposta pública, DM e clique.",
    tasks: ["No InstaChat, abra Integração e clique em Conectar Instagram.", "Na tela oficial do Instagram, escolha a conta profissional e conceda os três escopos solicitados.", "Volte ao InstaChat e confirme status Conectada e Reels sincronizados.", "Crie uma automação de teste com palavra exclusiva e mantenha-a ativa.", "Com uma segunda conta, comente exatamente a palavra no Reel.", "Confira resposta pública, Solicitações do Direct, Histórico do InstaChat e clique rastreado."],
    checks: ["OAuth concluiu", "Reels sincronizados", "Webhook recebido", "Resposta pública e DM confirmadas"],
    warning: "Não teste comentando com a própria conta profissional: comentários próprios são ignorados para impedir loops.",
    action: { label: "Abrir a integração no InstaChat", href: "/settings" },
    reference: { label: "Private Replies — Meta", href: "https://www.postman.com/meta/instagram/request/23987686-189d7215-22b3-403f-b2f5-a46c7e66a514" }, illustration: "test",
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

function InstagramApiSetupWalkthrough() {
  return <section className="instagram-setup-map" aria-labelledby="instagram-setup-title">
    <header>
      <div><p className="eyebrow">Como reconhecer a tela certa</p><h3 id="instagram-setup-title">Procure estes quatro blocos numerados</h3><p>O menu da Meta corta o final dos nomes. Em vez de adivinhar pelo menu, confirme pelo conteúdo exibido à direita.</p></div>
      <div className="instagram-setup-proof"><CheckCircle2 size={18} /><span><strong>Você está no lugar certo quando vê:</strong><code>Instagram App ID</code><code>instagram_business_basic</code><code>graph.instagram.com</code></span></div>
    </header>
    <div className="instagram-menu-guide">
      <article className="correct"><span><Check size={16} /></span><div><small>Use esta opção</small><strong>Configuração da API com login do Instagram</strong><p>Mostra as credenciais específicas do Instagram e os blocos Permissões, Tokens, Webhooks e Login da empresa.</p></div></article>
      <article><span><AlertTriangle size={16} /></span><div><small>Pule esta opção</small><strong>Auxiliar de integração de API</strong><p>Serve apenas para testar manualmente chamadas com um access token. O InstaChat não precisa dessa tela.</p></div></article>
      <article><span><AlertTriangle size={16} /></span><div><small>Não use neste projeto</small><strong>Configuração com Facebook Login</strong><p>Mostra permissões <code>instagram_basic</code> e <code>pages_*</code>, exige uma Página do Facebook e usa outro OAuth.</p></div></article>
    </div>
    <div className="instagram-setup-sequence">
      <article><span>1</span><div><strong>Permissões obrigatórias</strong><p>Clique em <b>Add all required permissions</b>. A Meta pode incluir <code>instagram_business_manage_messages</code> nesse pacote, mas o InstaChat não solicita mensagens gerais no login. Depois, adicione <code>instagram_business_manage_insights</code> para o Radar.</p></div></article>
      <article><span>2</span><div><strong>Gerar tokens de acesso</strong><p>Primeiro adicione e aceite a função de Testador do Instagram. Depois clique em <b>Adicionar conta</b>. O token manual é apenas para testes.</p></div></article>
      <article><span>3</span><div><strong>Configurar webhooks</strong><p>Informe a URL de callback, o Verify Token e deixe o certificado de cliente desligado. Assine o campo <code>comments</code>.</p></div></article>
      <article><span>4</span><div><strong>Login da empresa no Instagram</strong><p>Clique em <b>Configurar</b> e cadastre as URLs de OAuth, desautorização e exclusão de dados do InstaChat.</p></div></article>
    </div>
    <div className="instagram-credential-map">
      <AlertTriangle size={18} />
      <div><strong>Copie as credenciais do topo desta tela</strong><p>O valor exibido como <b>ID do app do Instagram</b> vai em <code>META_APP_ID</code>. A <b>Chave secreta do app do Instagram</b> vai em <code>META_APP_SECRET</code>. Nunca publique nem envie a chave secreta em prints.</p></div>
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
        {step.id === "instagram-api-setup" && <InstagramApiSetupWalkthrough />}
        {step.id === "callbacks" && <><div className="guide-url-stack"><UrlField label="URL de callback do webhook" value={urls.webhook} /><div className="guide-token-hint"><KeyRound size={15} /><span>Em <strong>Verificar token</strong>, cole exatamente o valor de <code>META_WEBHOOK_VERIFY_TOKEN</code> salvo na Vercel. Deixe o certificado de cliente desligado.</span></div></div><div className="guide-url-stack"><UrlField label="Valid OAuth Redirect URI" value={urls.oauth} /><UrlField label="Deauthorize Callback URL" value={urls.deauthorize} /><UrlField label="Data Deletion Request URL" value={urls.deletion} /><UrlField label="Privacy Policy URL" value={urls.privacy} /></div></>}
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
