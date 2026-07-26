"use client";

import { ArrowRight, Check, Copy, KeyRound, RefreshCw, RotateCcw } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "instachat:connection-guide:v1";
const PROGRESS_EVENT = "instachat-guide-progress";

function subscribeProgress(callback: () => void) {
  window.addEventListener(PROGRESS_EVENT, callback);
  return () => window.removeEventListener(PROGRESS_EVENT, callback);
}

function useCompletedSteps() {
  const raw = useSyncExternalStore(subscribeProgress, () => localStorage.getItem(STORAGE_KEY) ?? "[]", () => "[]");
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

export function CopyValue({ value, label = "Copiar" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return <button className="guide-copy" type="button" onClick={copy} aria-label={`${label}: ${value}`}><span>{copied ? "Copiado" : label}</span>{copied ? <Check size={13} /> : <Copy size={13} />}</button>;
}

export function WebhookTokenSetup() {
  const [token, setToken] = useState("");

  function generate() {
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    setToken(Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(""));
  }

  return <section className="webhook-token-setup" aria-labelledby="webhook-token-title">
    <header>
      <div className="webhook-token-icon"><KeyRound size={21} /></div>
      <div><p className="eyebrow">Senha de verificação do webhook</p><h3 id="webhook-token-title">Crie seu META_WEBHOOK_VERIFY_TOKEN aqui</h3><p>Ele não é fornecido pela Meta. O InstaChat gera uma senha aleatória no seu navegador; depois você cola o mesmo valor na Vercel e na Meta.</p></div>
      <span>Não é salvo pelo InstaChat</span>
    </header>

    <div className="webhook-token-flow">
      <article>
        <b>1</b>
        <div><small>Gere e copie</small><strong>Crie a senha aleatória</strong><p>Clique no botão abaixo. O valor terá 64 caracteres e poderá ser usado somente nesta instalação.</p></div>
      </article>
      <ArrowRight aria-hidden="true" />
      <article>
        <b>2</b>
        <div><small>Salve na Vercel</small><strong>Environment Variables</strong><p>Em <em>Name</em>, escreva <code>META_WEBHOOK_VERIFY_TOKEN</code>. Em <em>Value</em>, cole a senha. Marque Production, Preview e Development, salve e faça um novo deploy.</p></div>
      </article>
      <ArrowRight aria-hidden="true" />
      <article>
        <b>3</b>
        <div><small>Cole na Meta</small><strong>Campo “Verificar token”</strong><p>Na seção <em>Configurar webhooks</em>, cole exatamente a mesma senha e clique em <em>Verificar e salvar</em>.</p></div>
      </article>
    </div>

    <div className={token ? "webhook-token-generator generated" : "webhook-token-generator"}>
      <div>
        <span>{token ? "Seu token foi criado" : "Pronto para gerar"}</span>
        <code>{token || "Clique em “Gerar token seguro”"}</code>
      </div>
      {token && <CopyValue value={token} label="Copiar token" />}
      <button type="button" className="webhook-token-generate" onClick={generate}>
        <RefreshCw size={14} /> {token ? "Gerar outro" : "Gerar token seguro"}
      </button>
    </div>

    <p className="webhook-token-warning"><strong>Importante:</strong> não use o App Secret, a senha do Instagram ou a chave da Supabase nesse campo. Se gerar outro token depois, será necessário atualizar os dois lugares.</p>
  </section>;
}

type GuideRoute = "standard" | "saas";

export function GuideRouteChoice() {
  const [route, setRoute] = useState<GuideRoute | null>(null);

  function choose(nextRoute: GuideRoute) {
    setRoute(nextRoute);
  }

  function start() {
    document.getElementById("guide-start")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return <section className="guide-route-choice" aria-labelledby="route-title">
    <div className="guide-route-intro">
      <p className="eyebrow">Passo zero — escolha uma opção</p>
      <h2 id="route-title">Como você pretende usar o InstaChat?</h2>
      <p>Clique em uma das opções abaixo. Para conectar somente a sua conta, escolha a primeira.</p>
    </div>
    <button type="button" className={route === "standard" ? "guide-route-card selected" : "guide-route-card"} onClick={() => choose("standard")} aria-pressed={route === "standard"}>
      <span className="guide-route-number">01</span>
      <span className="guide-route-content"><span className="guide-route-badge recommended">Recomendado para começar</span><strong>Minha própria conta</strong><small>Também serve para quem vai disponibilizar o código como template. Você seguirá as 8 etapas usando Standard Access.</small><span className="guide-route-select">{route === "standard" ? <><Check size={16} /> Opção escolhida</> : <>Escolher este caminho <ArrowRight size={16} /></>}</span></span>
    </button>
    <button type="button" className={route === "saas" ? "guide-route-card selected" : "guide-route-card"} onClick={() => choose("saas")} aria-pressed={route === "saas"}>
      <span className="guide-route-number">02</span>
      <span className="guide-route-content"><span className="guide-route-badge advanced">Para uma fase futura</span><strong>Contas de clientes</strong><small>Escolha apenas se você já vai operar como SaaS. Além das 8 etapas, haverá App Review, Advanced Access e verificação empresarial.</small><span className="guide-route-select">{route === "saas" ? <><Check size={16} /> Opção escolhida</> : <>Escolher este caminho <ArrowRight size={16} /></>}</span></span>
    </button>
    {route && <div className="guide-route-confirmation" role="status">
      <div><Check size={17} /><span><strong>Caminho selecionado:</strong> {route === "standard" ? "minha própria conta." : "contas de clientes."} {route === "standard" ? "Siga as etapas em ordem e marque cada uma ao terminar." : "Siga todas as etapas e dê atenção especial à etapa 8."}</span></div>
      <button type="button" onClick={start}>Começar pela etapa 1 <ArrowRight size={15} /></button>
    </div>}
  </section>;
}

export function GuideProgress({ stepIds }: { stepIds: string[] }) {
  const completed = useCompletedSteps();

  function toggle(id: string) {
    const next = completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  }

  const count = stepIds.filter((id) => completed.includes(id)).length;
  const percentage = Math.round((count / stepIds.length) * 100);

  return <>
    <div className="guide-progress-card" aria-live="polite">
      <div className="guide-progress-ring"><strong>{percentage}%</strong><span>concluído</span></div>
      <div><p className="eyebrow">Seu progresso</p><h2>{count === stepIds.length ? "Pronto para conectar" : `${count} de ${stepIds.length} etapas`}</h2><p>O progresso fica apenas neste navegador e não contém credenciais.</p></div>
      {count > 0 && <button className="guide-reset" type="button" onClick={reset}><RotateCcw size={13} /> Reiniciar</button>}
    </div>
    <div className="guide-checks" aria-label="Checklist de etapas">{stepIds.map((id, index) => <label key={id} className={completed.includes(id) ? "complete" : ""}><input type="checkbox" checked={completed.includes(id)} onChange={() => toggle(id)} /><span><Check size={12} /></span><b>{String(index + 1).padStart(2, "0")}</b></label>)}</div>
  </>;
}

export function StepComplete({ id }: { id: string }) {
  const completed = useCompletedSteps();
  const checked = completed.includes(id);
  function toggle() {
    let current: string[] = [];
    try { current = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[]; } catch { current = []; }
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  }
  return <button type="button" className={checked ? "step-complete complete" : "step-complete"} onClick={toggle}><span><Check size={14} /></span>{checked ? "Etapa concluída" : "Marcar como concluída"}</button>;
}
