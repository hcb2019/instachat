"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { ArrowRight, Clapperboard, Sparkles } from "lucide-react";
import { createContentProject, suggestStudioIdeas, type StudioActionState } from "@/features/content-studio/actions";
import type { StudioIdea } from "@/lib/studio-ideas";
import type { ContentGoal, ContentPillar, CreatorProfile, DeliverableType, HookIntensity } from "@/types/content-studio";

interface FormSeed {
  title?: string;
  topic?: string;
  sourceInsightId?: string;
  pillar?: ContentPillar;
  primaryGoal?: ContentGoal;
  hookIntensity?: HookIntensity;
  deliverableType?: DeliverableType;
}

const sourceLabel: Record<StudioIdea["source"], string> = {
  own_reel: "Seus Reels",
  audience: "Radar",
  ai_pattern: "Padrão em alta",
};

export function ContentProjectForm({ profile, seed, initialMode = "write" }: { profile: CreatorProfile; seed?: FormSeed; initialMode?: "write" | "ideas" }) {
  const [state, action, pending] = useActionState<StudioActionState, FormData>(createContentProject, {});
  const [ideaState, ideaAction, ideaPending] = useActionState<StudioActionState, FormData>(suggestStudioIdeas, {});
  const [mode, setMode] = useState<"write" | "ideas">(initialMode);
  const [draft, setDraft] = useState({
    title: seed?.title ?? "",
    topic: seed?.topic ?? "",
    pillar: seed?.pillar ?? "ai_business",
    primaryGoal: seed?.primaryGoal ?? "leads",
    hookIntensity: seed?.hookIntensity ?? "provocative",
    deliverableType: seed?.deliverableType ?? "prompt",
  });
  const [formKey, setFormKey] = useState(0);
  const requestedIdeas = useRef(false);

  useEffect(() => {
    if (mode !== "ideas" || requestedIdeas.current) return;
    requestedIdeas.current = true;
    startTransition(() => {
      ideaAction(new FormData());
    });
  }, [mode, ideaAction]);

  function pickIdea(idea: StudioIdea) {
    setDraft({
      title: idea.title,
      topic: idea.topic,
      pillar: idea.suggestedPillar,
      primaryGoal: idea.suggestedGoal,
      hookIntensity: "provocative",
      deliverableType: idea.suggestedDeliverable,
    });
    setFormKey((current) => current + 1);
    setMode("write");
  }

  return <div className="studio-create">
    <ol className="studio-flow-rail" aria-label="Fluxo do Estúdio">
      <li className="active"><span>1</span>Tema</li>
      <li><span>2</span>3 caminhos</li>
      <li><span>3</span>Pacote</li>
    </ol>
    <div className="studio-mode-switch" role="tablist" aria-label="Como começar">
      <button type="button" role="tab" aria-selected={mode === "write"} className={mode === "write" ? "active" : ""} onClick={() => setMode("write")}>Eu tenho o tema</button>
      <button type="button" role="tab" aria-selected={mode === "ideas"} className={mode === "ideas" ? "active" : ""} onClick={() => { setMode("ideas"); if (!requestedIdeas.current) { requestedIdeas.current = true; startTransition(() => { ideaAction(new FormData()); }); } }}>Ideias automáticas</button>
    </div>

    {mode === "ideas" && <section className="studio-idea-board" aria-live="polite">
      <header>
        <p className="eyebrow">A partir dos seus Reels e de padrões de IA</p>
        <h2>Escolhe uma ideia pra virar campanha</h2>
        <p>{ideaState.limitNote ?? "A API do Instagram não entrega Reels de terceiros. A gente aproxima com o que a sua conta e o Radar já têm."}</p>
        {ideaState.connected === false && <p className="form-alert">Instagram desconectado: as ideias usam padrões de IA, sem métrica da conta.</p>}
      </header>
      {ideaState.error && <p className="form-alert" role="alert">{ideaState.error}</p>}
      {ideaPending && !ideaState.ideas ? <p className="studio-idea-loading">Lendo seus Reels e montando ideias…</p> : null}
      <div className="studio-idea-grid">
        {(ideaState.ideas ?? []).map((idea) => <button type="button" className="card studio-idea-card" key={idea.title} onClick={() => pickIdea(idea)}>
          <span>{sourceLabel[idea.source]}</span>
          <strong>{idea.hook}</strong>
          <p>{idea.angle}</p>
          <small>{idea.reason}</small>
        </button>)}
      </div>
      {ideaState.ideas && <form action={ideaAction}><button className="button button-ghost" disabled={ideaPending}>{ideaPending ? "Atualizando…" : "Gerar outras ideias"}</button></form>}
    </section>}

    <form action={action} className="studio-create-form" key={formKey}>
      {seed?.sourceInsightId && <input type="hidden" name="sourceInsightId" value={seed.sourceInsightId} />}
      {state.error && <p className="form-alert" role="alert">{state.error}</p>}
      <p className="studio-format-chip"><Clapperboard size={15} /> Reel de 7–10s · texto fixo na tela · sem fala obrigatória</p>
      <section className="card studio-form-section studio-form-main">
        <label><span>Nome interno</span><input name="title" defaultValue={draft.title} placeholder="Ex.: IA pra responder cliente" maxLength={120} /><small>Só você vê esse nome.</small>{state.fields?.title?.[0] && <em>{state.fields.title[0]}</em>}</label>
        <label><span>Assunto do Reel</span><textarea name="topic" defaultValue={draft.topic} placeholder="A cena, o problema e o que a pessoa leva embora." rows={5} maxLength={500} /><small>Quanto mais concreto, melhor. Ex.: usar IA pra responder orçamento sem parecer robô, sem inventar prazo.</small>{state.fields?.topic?.[0] && <em>{state.fields.topic[0]}</em>}</label>
        <fieldset>
          <legend>O que vai no direct</legend>
          <div className="studio-radio-cards deliverable">
            <label><input type="radio" name="deliverableType" value="prompt" defaultChecked={draft.deliverableType === "prompt"} /><span><strong>Prompt</strong><small>Pra colar na IA</small></span></label>
            <label><input type="radio" name="deliverableType" value="checklist" defaultChecked={draft.deliverableType === "checklist"} /><span><strong>Checklist</strong><small>Ações rápidas</small></span></label>
            <label><input type="radio" name="deliverableType" value="guide" defaultChecked={draft.deliverableType === "guide"} /><span><strong>Guia</strong><small>Decisão + método</small></span></label>
            <label><input type="radio" name="deliverableType" value="page" defaultChecked={draft.deliverableType === "page"} /><span><strong>Página</strong><small>Ferramenta prática</small></span></label>
          </div>
        </fieldset>
      </section>
      <details className="card studio-advanced">
        <summary>Ajustes opcionais</summary>
        <div className="studio-advanced-grid">
          <label><span>Pilar</span><select name="pillar" defaultValue={draft.pillar}><option value="ai_business">IA para negócios</option><option value="automation_productivity">Automação e produtividade</option><option value="content_sales">Conteúdo e vendas</option></select></label>
          <label><span>Objetivo principal</span><select name="primaryGoal" defaultValue={draft.primaryGoal}><option value="leads">Gerar comentários e leads</option><option value="followers">Ganhar seguidores</option><option value="saves">Gerar salvamentos</option><option value="shares">Gerar compartilhamentos</option><option value="education">Educar a audiência</option><option value="offer">Apresentar uma oferta</option></select></label>
          <label><span>Objetivo secundário</span><select name="secondaryGoal" defaultValue="saves"><option value="">Nenhum</option><option value="leads">Gerar comentários e leads</option><option value="followers">Ganhar seguidores</option><option value="saves">Gerar salvamentos</option><option value="shares">Gerar compartilhamentos</option><option value="education">Educar a audiência</option><option value="offer">Apresentar uma oferta</option></select></label>
          <label><span>Observação</span><textarea name="notes" placeholder="Algo que precisa aparecer ou ser evitado?" rows={3} maxLength={1500} /></label>
        </div>
        <fieldset>
          <legend>Intensidade do hook</legend>
          <div className="studio-radio-cards">
            <label><input type="radio" name="hookIntensity" value="safe" defaultChecked={draft.hookIntensity === "safe"} /><span><strong>Educativo</strong><small>Direto e seguro</small></span></label>
            <label><input type="radio" name="hookIntensity" value="provocative" defaultChecked={draft.hookIntensity === "provocative"} /><span><strong>Provocativo</strong><small>Tensão sem exagero</small></span></label>
            <label><input type="radio" name="hookIntensity" value="strong" defaultChecked={draft.hookIntensity === "strong"} /><span><strong>Forte</strong><small>Mais confronto</small></span></label>
          </div>
        </fieldset>
        <p className="studio-profile-note"><strong>Voz usada</strong> {profile.voice}</p>
      </details>
      <footer className="studio-create-footer"><div><Sparkles size={18} /><span>O Vortex cria três caminhos. Você escolhe um e revisa o pacote antes de publicar.</span></div><button className="button button-primary" disabled={pending}>{pending ? "Pensando nas ideias…" : "Gerar 3 ideias"}<ArrowRight size={16} /></button></footer>
    </form>
  </div>;
}
