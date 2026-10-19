"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { ArrowRight, CheckCircle2, ExternalLink, LoaderCircle, Plus, Send, Sparkles, Trash2, UploadCloud } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { buildDefaultPipelineFlow, pipelineDeliverableTypes, type PipelineDeliverableType } from "@/lib/pipeline";
import type { AutomationFlowButton, AutomationFlowStep } from "@/types/domain";

interface PipelineResponse {
  id?: string;
  status?: string;
  automationId?: string | null;
  instagramMediaId?: string | null;
  error?: string;
  fields?: Record<string, string[]>;
}

const deliverableLabels: Record<PipelineDeliverableType, string> = {
  prompt: "Prompt",
  sistema: "Sistema",
  app: "App",
  repositorio: "Repositório",
};

function createDefaultSteps(deliverableUrl: string) {
  return buildDefaultPipelineFlow(deliverableUrl || "https://example.com/material").steps;
}

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.[0] ? <span className="field-error">{messages[0]}</span> : null;
}

export function NewContentForm({ canPublish }: { canPublish: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [isReviewing, setIsReviewing] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState(["", "", "", "", ""]);
  const [keyword, setKeyword] = useState("");
  const [deliverableType, setDeliverableType] = useState<PipelineDeliverableType>("prompt");
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [flowSteps, setFlowSteps] = useState<AutomationFlowStep[]>(() => createDefaultSteps(""));
  const [result, setResult] = useState<PipelineResponse | null>(null);
  const visibleHashtags = hashtags.map((item) => item.trim()).filter(Boolean);
  const primaryError = result?.error;
  const finalButtons = useMemo(
    () => flowSteps.flatMap((step) => step.buttons.filter((button) => button.url)),
    [flowSteps],
  );

  function updateFlowStep(index: number, patch: Partial<AutomationFlowStep>) {
    setFlowSteps((current) => current.map((step, stepIndex) => stepIndex === index ? { ...step, ...patch } : step));
  }

  function addFlowStep() {
    setFlowSteps((current) => [...current, { id: `passo-${current.length + 1}`, text: "", buttons: [{ id: "resposta-1", label: "", nextStepId: null, url: null }] }]);
  }

  function removeFlowStep(index: number) {
    setFlowSteps((current) => current.filter((_, stepIndex) => stepIndex !== index));
  }

  function updateFlowButton(stepIndex: number, buttonIndex: number, patch: Partial<AutomationFlowButton>) {
    setFlowSteps((current) => current.map((step, index) => index === stepIndex ? { ...step, buttons: step.buttons.map((button, nestedIndex) => nestedIndex === buttonIndex ? { ...button, ...patch } : button) } : step));
  }

  function addFlowButton(stepIndex: number) {
    setFlowSteps((current) => current.map((step, index) => index === stepIndex ? { ...step, buttons: [...step.buttons, { id: `resposta-${step.buttons.length + 1}`, label: "", nextStepId: null, url: null }] } : step));
  }

  function removeFlowButton(stepIndex: number, buttonIndex: number) {
    setFlowSteps((current) => current.map((step, index) => index === stepIndex ? { ...step, buttons: step.buttons.filter((_, nestedIndex) => nestedIndex !== buttonIndex) } : step));
  }

  function syncDeliverableUrlIntoFlow(nextUrl: string) {
    setDeliverableUrl(nextUrl);
    setFlowSteps((current) => current.map((step) => ({
      ...step,
      buttons: step.buttons.map((button) => button.url && (!deliverableUrl || button.url === deliverableUrl || button.url === "https://example.com/material") ? { ...button, url: nextUrl } : button),
    })));
  }

  function submitPipeline() {
    setResult(null);
    const formData = new FormData();
    if (videoFile) formData.set("videoFile", videoFile);
    formData.set("caption", caption);
    for (const hashtag of visibleHashtags) formData.append("hashtags", hashtag);
    formData.set("keyword", keyword);
    formData.set("deliverableType", deliverableType);
    formData.set("deliverableUrl", deliverableUrl);
    formData.set("conversationFlow", JSON.stringify({ steps: flowSteps }));
    if (scheduledAt) formData.set("scheduledAt", scheduledAt);
    startTransition(async () => {
      const response = await fetch("/api/pipeline/posts", { method: "POST", body: formData });
      const payload = await response.json() as PipelineResponse;
      setResult(payload);
      if (response.ok) setIsReviewing(false);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isReviewing) {
      setResult(null);
      setIsReviewing(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    submitPipeline();
  }

  return <form className="pipeline-form" onSubmit={handleSubmit}>
    {!canPublish && <p className="form-alert" role="alert">Conecte e reautorize o Instagram com permissão de publicação antes de usar o Novo conteúdo.</p>}
    {primaryError && <p className="form-alert" role="alert">{primaryError}</p>}
    {result?.status && !result.error && <Card className="pipeline-result">
      <CheckCircle2 size={22} />
      <div><strong>{result.status === "automation_created" ? "Reel publicado e automação ativa." : "Pipeline criado."}</strong><p>Status: {result.status}. {result.automationId ? "A automação já foi criada." : "Se a Meta ainda estiver processando o vídeo, o cron continuará tentando."}</p></div>
      {result.automationId && <Link className="button button-secondary" href={`/automations/${result.automationId}`}>Abrir automação <ArrowRight size={14} /></Link>}
    </Card>}
    {isReviewing && <Card className="pipeline-review">
      <p className="eyebrow">Revisão antes de publicar</p>
      <h2>Confira o pacote que será enviado à Meta</h2>
      <dl>
        <div><dt>Vídeo</dt><dd>{videoFile?.name ?? "Nenhum arquivo selecionado"}</dd></div>
        <div><dt>Legenda</dt><dd>{caption}</dd></div>
        <div><dt>Hashtags</dt><dd>{visibleHashtags.map((item) => `#${item.replace(/^#+/u, "")}`).join(" ") || "Sem hashtags"}</dd></div>
        <div><dt>Palavra-chave</dt><dd>{keyword || "Não informada"}</dd></div>
        <div><dt>Material</dt><dd>{deliverableLabels[deliverableType]} · {deliverableUrl || "URL não informada"}</dd></div>
        <div><dt>Fluxo</dt><dd>{flowSteps.length} passo(s), {finalButtons.length} botão(ões) finais</dd></div>
      </dl>
    </Card>}
    <div className="studio-form-grid">
      <Card className="studio-form-section"><div className="studio-step-head"><UploadCloud /><div><span>01</span><h2>Vídeo e legenda</h2></div></div>
        <label><span>Arquivo do Reel</span><input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)} disabled={!canPublish} /><small>O Vortex armazena no Supabase Storage e gera uma URL temporária para a Meta.</small></label>
        <label><span>Legenda</span><textarea value={caption} onChange={(event) => setCaption(event.target.value)} rows={7} maxLength={2200} placeholder="Escreva a legenda do Reel." /><FieldError messages={result?.fields?.caption} /></label>
        <div className="pipeline-hashtags"><span>Hashtags ({visibleHashtags.length}/5)</span>{hashtags.map((item, index) => <input key={index} value={item} onChange={(event) => setHashtags((current) => current.map((value, valueIndex) => valueIndex === index ? event.target.value : value))} placeholder={index === 0 ? "#ia" : "#negocios"} maxLength={60} />)}<FieldError messages={result?.fields?.hashtags} /></div>
      </Card>
      <Card className="studio-form-section"><div className="studio-step-head"><Sparkles /><div><span>02</span><h2>Automação criada após publicar</h2></div></div>
        <label><span>Palavra-chave do comentário</span><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="GUIA" maxLength={80} /><FieldError messages={result?.fields?.keyword} /></label>
        <label><span>Tipo do material</span><select value={deliverableType} onChange={(event) => setDeliverableType(event.target.value as PipelineDeliverableType)}>{pipelineDeliverableTypes.map((type) => <option key={type} value={type}>{deliverableLabels[type]}</option>)}</select></label>
        <label><span>URL do material</span><input type="url" value={deliverableUrl} onChange={(event) => syncDeliverableUrlIntoFlow(event.target.value)} placeholder="https://seusite.com/material" maxLength={2048} /><small>Botões finais recebem UTM automaticamente na automação.</small><FieldError messages={result?.fields?.deliverableUrl} /></label>
        <label><span>Agendar publicação (opcional)</span><input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} /><small>Se estiver no futuro, o cron do Vortex publica quando chegar a hora.</small><FieldError messages={result?.fields?.scheduledAt} /></label>
      </Card>
    </div>
    <Card className="pipeline-flow-card">
      <div className="reply-variations-head"><div><strong>Fluxo de DM</strong><small>Cada resposta rápida leva a outro passo ou a uma mensagem final com botão de URL.</small></div><span>{flowSteps.length}/10 passos</span></div>
      <div className="link-button-list">
        {flowSteps.map((step, stepIndex) => <article className="flow-step-editor" key={`${step.id}-${stepIndex}`}>
          <div className="flow-step-head"><strong>Passo {stepIndex + 1}</strong>{flowSteps.length > 1 && <button type="button" onClick={() => removeFlowStep(stepIndex)}>Remover</button>}</div>
          <label><span>ID</span><input value={step.id} onChange={(event) => updateFlowStep(stepIndex, { id: event.target.value })} maxLength={48} /></label>
          <label><span>Mensagem</span><textarea value={step.text} onChange={(event) => updateFlowStep(stepIndex, { text: event.target.value })} maxLength={900} rows={3} /></label>
          {step.buttons.map((button, buttonIndex) => {
            const action = button.url ? "url" : "next";
            return <div className="flow-button-row" key={`${button.id}-${buttonIndex}`}>
              <label><span>Botão</span><input value={button.label} onChange={(event) => updateFlowButton(stepIndex, buttonIndex, { label: event.target.value })} maxLength={20} /></label>
              <label><span>Ação</span><select value={action} onChange={(event) => updateFlowButton(stepIndex, buttonIndex, event.target.value === "url" ? { url: deliverableUrl, nextStepId: null } : { nextStepId: flowSteps[stepIndex + 1]?.id ?? "", url: null })}><option value="next">Ir para passo</option><option value="url">Entregar URL</option></select></label>
              {action === "next" ? <label><span>Próximo</span><select value={button.nextStepId ?? ""} onChange={(event) => updateFlowButton(stepIndex, buttonIndex, { nextStepId: event.target.value || null, url: null })}><option value="">Selecione</option>{flowSteps.filter((target) => target.id !== step.id).map((target) => <option key={target.id} value={target.id}>{target.id}</option>)}</select></label> : <label><span>URL</span><input type="url" value={button.url ?? ""} onChange={(event) => updateFlowButton(stepIndex, buttonIndex, { url: event.target.value, nextStepId: null })} /></label>}
              <button type="button" className="icon-button" onClick={() => removeFlowButton(stepIndex, buttonIndex)} aria-label={`Remover botão ${buttonIndex + 1}`}><Trash2 size={15} /></button>
            </div>;
          })}
          {step.buttons.length < 13 && <button type="button" className="add-reply-variation" onClick={() => addFlowButton(stepIndex)}><Plus size={15} /> Adicionar botão</button>}
        </article>)}
      </div>
      {flowSteps.length < 10 && <button type="button" className="add-reply-variation" onClick={addFlowStep}><Plus size={15} /> Adicionar passo</button>}
      <FieldError messages={result?.fields?.conversationFlow} />
    </Card>
    <footer className="studio-create-footer"><div><Send size={18} /><span>{isReviewing ? "Tudo certo? O próximo clique envia para a Meta e ativa a automação ao concluir." : "Revise antes de publicar. Nada é enviado à Meta nesta primeira etapa."}</span></div><Button disabled={!canPublish || isPending}>{isPending ? <LoaderCircle className="spin" size={16} /> : isReviewing ? <ExternalLink size={16} /> : <ArrowRight size={16} />}{isPending ? "Publicando…" : isReviewing ? "Publicar Reel e automação" : "Revisar publicação"}</Button></footer>
  </form>;
}
