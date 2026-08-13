"use client";

import { useActionState } from "react";
import { ArrowRight, Clapperboard, FileCheck2, MessageSquareText, Sparkles, Target } from "lucide-react";
import { createContentProject, type StudioActionState } from "@/features/content-studio/actions";
import type { CreatorProfile } from "@/types/content-studio";

export function ContentProjectForm({ profile, seed }: { profile: CreatorProfile; seed?: { title?: string; topic?: string; sourceInsightId?: string } }) {
  const [state, action, pending] = useActionState<StudioActionState, FormData>(createContentProject, {});
  return <form action={action} className="studio-create-form">
    {seed?.sourceInsightId && <input type="hidden" name="sourceInsightId" value={seed.sourceInsightId} />}
    {state.error && <p className="form-alert" role="alert">{state.error}</p>}
    <section className="studio-format-card">
      <div className="studio-format-visual"><span>7–10s</span><strong>Texto fixo<br />na tela</strong><small>Sem fala obrigatória</small></div>
      <div><p className="eyebrow">Formato inicial</p><h2>Reel curto com hook e legenda conectados</h2><p>Uma cena simples ao fundo. O texto prende a atenção e a legenda entrega a explicação, o material e a chamada para comentar.</p></div>
      <span className="studio-selected-format"><Clapperboard size={16} /> Selecionado</span>
    </section>
    <div className="studio-form-grid">
      <section className="card studio-form-section"><div className="studio-step-head"><MessageSquareText /><div><span>01</span><h2>Qual é a ideia?</h2></div></div>
        <label><span>Nome interno</span><input name="title" defaultValue={seed?.title ?? ""} placeholder="Ex.: IA para responder clientes" maxLength={120} /><small>Só você verá esse nome.</small>{state.fields?.title?.[0] && <em>{state.fields.title[0]}</em>}</label>
        <label><span>Assunto do Reel</span><textarea name="topic" defaultValue={seed?.topic ?? ""} placeholder="Explique a situação, o problema e o que você quer ensinar." rows={6} maxLength={500} /><small>Quanto mais concreto, melhor. Ex.: usar IA para responder pedidos de orçamento sem parecer robô.</small>{state.fields?.topic?.[0] && <em>{state.fields.topic[0]}</em>}</label>
        <label><span>Observação opcional</span><textarea name="notes" placeholder="Algo que precisa aparecer ou ser evitado?" rows={3} maxLength={1500} /></label>
      </section>
      <section className="card studio-form-section"><div className="studio-step-head"><Target /><div><span>02</span><h2>Para quem e para quê?</h2></div></div>
        <label><span>Pilar</span><select name="pillar" defaultValue="ai_business"><option value="ai_business">IA para negócios</option><option value="automation_productivity">Automação e produtividade</option><option value="content_sales">Conteúdo e vendas</option></select></label>
        <label><span>Objetivo principal</span><select name="primaryGoal" defaultValue="leads"><option value="leads">Gerar comentários e leads</option><option value="followers">Ganhar seguidores</option><option value="saves">Gerar salvamentos</option><option value="shares">Gerar compartilhamentos</option><option value="education">Educar a audiência</option><option value="offer">Apresentar uma oferta</option></select></label>
        <label><span>Objetivo secundário</span><select name="secondaryGoal" defaultValue="saves"><option value="">Nenhum</option><option value="leads">Gerar comentários e leads</option><option value="followers">Ganhar seguidores</option><option value="saves">Gerar salvamentos</option><option value="shares">Gerar compartilhamentos</option><option value="education">Educar a audiência</option><option value="offer">Apresentar uma oferta</option></select></label>
        <div className="studio-profile-note"><strong>Perfil usado na geração</strong><p>{profile.audience}</p><small>{profile.voice}</small></div>
      </section>
      <section className="card studio-form-section"><div className="studio-step-head"><Sparkles /><div><span>03</span><h2>Qual é a pegada?</h2></div></div>
        <fieldset><legend>Intensidade do hook</legend><div className="studio-radio-cards">
          <label><input type="radio" name="hookIntensity" value="safe" /><span><strong>Educativo</strong><small>Direto e seguro</small></span></label>
          <label><input type="radio" name="hookIntensity" value="provocative" defaultChecked /><span><strong>Provocativo</strong><small>Cria tensão sem exagerar</small></span></label>
          <label><input type="radio" name="hookIntensity" value="strong" /><span><strong>Forte</strong><small>Mais confronto e urgência</small></span></label>
        </div></fieldset>
      </section>
      <section className="card studio-form-section"><div className="studio-step-head"><FileCheck2 /><div><span>04</span><h2>O que será entregue?</h2></div></div>
        <fieldset><legend>Material para enviar no direct</legend><div className="studio-radio-cards deliverable">
          <label><input type="radio" name="deliverableType" value="prompt" defaultChecked /><span><strong>Prompt</strong><small>Pronto para copiar</small></span></label>
          <label><input type="radio" name="deliverableType" value="checklist" /><span><strong>Checklist</strong><small>Passos rápidos</small></span></label>
          <label><input type="radio" name="deliverableType" value="guide" /><span><strong>Guia</strong><small>Explicação completa</small></span></label>
          <label><input type="radio" name="deliverableType" value="page" /><span><strong>Página</strong><small>Conteúdo prático online</small></span></label>
        </div></fieldset>
      </section>
    </div>
    <footer className="studio-create-footer"><div><Sparkles size={18} /><span>O InstaChat vai criar três caminhos diferentes. Você escolhe um antes de gerar o pacote completo.</span></div><button className="button button-primary" disabled={pending}>{pending ? "Pensando nas ideias…" : "Gerar 3 ideias"}<ArrowRight size={16} /></button></footer>
  </form>;
}
