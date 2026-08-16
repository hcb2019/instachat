"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bot, Check, CheckCircle2, ClipboardCheck, ClipboardPaste, Copy, PlayCircle, RotateCcw, Target } from "lucide-react";
import type { DeliverableExecutionStep, DeliverableSection, DeliverableTemplate } from "@/types/content-studio";

export function MaterialQuickFlow({ flow, resultPrompt, resultPlaceholder, finalApplication, storageKey }: { flow: DeliverableExecutionStep[]; resultPrompt: string; resultPlaceholder: string; finalApplication: string; storageKey: string }) {
  const [copied, setCopied] = useState<number | null>(null);
  const [result, setResult] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(() => new Set());
  const [ready, setReady] = useState(false);
  const actionLabel = { prepare: "PREPARE", copy: "COPIE", use: "USE NA IA", apply: "APLIQUE" } as const;
  const finished = activeStep >= flow.length;
  const progress = flow.length ? Math.round((completed.size / flow.length) * 100) : 0;

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setResult(localStorage.getItem(storageKey) ?? "");
      try {
        const saved = JSON.parse(localStorage.getItem(`${storageKey}-progress`) ?? "null") as { activeStep?: number; completed?: number[] } | null;
        if (typeof saved?.activeStep === "number") setActiveStep(Math.min(Math.max(saved.activeStep, 0), flow.length));
        if (saved?.completed) setCompleted(new Set(saved.completed.filter((index) => index >= 0 && index < flow.length)));
      } catch { /* An invalid local draft must not block the guide. */ }
      setReady(true);
    });
    return () => { active = false; };
  }, [flow.length, storageKey]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(storageKey, result);
    localStorage.setItem(`${storageKey}-progress`, JSON.stringify({ activeStep, completed: [...completed] }));
  }, [activeStep, completed, ready, result, storageKey]);

  async function copyStep(content: string, index: number) {
    await navigator.clipboard.writeText(content);
    setCopied(index);
    window.setTimeout(() => setCopied(null), 1400);
  }

  function completeAndContinue() {
    setCompleted((current) => new Set(current).add(activeStep));
    setActiveStep((current) => Math.min(current + 1, flow.length));
  }

  function restart() {
    setActiveStep(0);
    setCompleted(new Set());
  }

  const step = flow[activeStep];

  return <section className="material-quick-flow">
    <header><div><p>EXECUÇÃO GUIADA</p><h2>{finished ? "Seu material está pronto para aplicar" : `Passo ${activeStep + 1} de ${flow.length}`}</h2><span>{finished ? "Cole o resultado abaixo e siga a última orientação." : "Faça somente esta ação agora. Depois, avance."}</span></div><strong>{progress}%</strong></header>
    <progress className="quick-progress" max={flow.length || 1} value={completed.size}>{progress}%</progress>
    <ol className="quick-roadmap" aria-label="Progresso das etapas">{flow.map((item, index) => <li className={completed.has(index) ? "completed" : index === activeStep ? "active" : ""} key={item.title}><button type="button" onClick={() => setActiveStep(index)} aria-label={`Abrir passo ${index + 1}: ${item.title}`}><span>{completed.has(index) ? <Check size={13}/> : index + 1}</span><small>{item.title}</small></button></li>)}</ol>
    {!finished && step && <article className={`quick-step action-${step.action}`} id={`passo-${activeStep+1}`}><div className="quick-step-number"><span>{activeStep+1}</span><small>{actionLabel[step.action]}</small></div><div className="quick-step-body"><h3>{step.title}</h3><p>{step.instruction}</p>{step.customization.length>0&&<div className="quick-customize"><strong>Altere antes de usar:</strong><ul>{step.customization.map((item)=><li key={item}>{item}</li>)}</ul></div>}{step.copyableContent&&<div className="quick-copy"><pre>{step.copyableContent}</pre><button type="button" onClick={()=>copyStep(step.copyableContent,activeStep)}><Copy size={15}/>{copied===activeStep?"Copiado. Agora cole na IA":"Copiar este prompt"}</button></div>}<footer><CheckCircle2 size={15}/><span><small>Você concluiu quando</small>{step.expectedResult}</span></footer><div className="quick-navigation">{activeStep > 0 && <button className="quick-back" type="button" onClick={() => setActiveStep((current) => current - 1)}><ArrowLeft size={15}/>Voltar</button>}<button className="quick-next" type="button" onClick={completeAndContinue}>Concluir e continuar<ArrowRight size={15}/></button></div></div></article>}
    {finished && <div className="material-result-box"><header><ClipboardPaste size={20}/><div><small>ÚLTIMA ETAPA</small><h3>{resultPrompt}</h3></div></header><textarea value={result} onChange={(event)=>setResult(event.target.value)} placeholder={resultPlaceholder}/><span>O texto fica salvo neste navegador.</span><div><Bot size={17}/><p><strong>Agora aplique:</strong> {finalApplication}</p></div><button className="quick-restart" type="button" onClick={restart}><RotateCcw size={15}/>Rever o passo a passo</button></div>}
  </section>;
}

export function MaterialChecklist({ sections, storageKey }: { sections: DeliverableSection[]; storageKey: string }) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [copiedPlan, setCopiedPlan] = useState(false);
  const taskTotal = useMemo(() => sections.reduce((sum, section) => sum + section.items.length, 0), [sections]);
  const answerTotal = sections.filter((section) => section.responsePrompt).length;
  const answerCount = sections.filter((_, index) => answers[String(index)]?.trim()).length;
  const total = taskTotal + answerTotal;
  const completed = checked.size + answerCount;
  const percentage = total ? Math.round((completed / total) * 100) : 0;

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as { checked?: string[]; answers?: Record<string, string> } | null;
        if (saved?.checked) setChecked(new Set(saved.checked));
        if (saved?.answers) setAnswers(saved.answers);
      } catch { /* A corrupted local draft should never block the material. */ }
      setReady(true);
    });
    return () => { active = false; };
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(storageKey, JSON.stringify({ checked: [...checked], answers }));
  }, [answers, checked, ready, storageKey]);

  function toggle(key: string) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function copyPlan() {
    const content = sections.map((section, index) => `${index + 1}. ${section.heading}\n${section.responsePrompt ?? "Registro"}\n${answers[String(index)]?.trim() || "[Ainda não preenchido]"}`).join("\n\n");
    await navigator.clipboard.writeText(content);
    setCopiedPlan(true);
    window.setTimeout(() => setCopiedPlan(false), 1400);
  }

  return (
    <>
      <div className="material-progress" aria-label={`${percentage}% do material concluído`}>
        <div><strong>Seu progresso</strong><span>{completed} de {total} ações e registros</span></div>
        <progress max={total || 1} value={completed}>{percentage}%</progress>
      </div>
      {sections.map((section, sectionIndex) => (
        <section className="material-step" id={`etapa-${sectionIndex + 1}`} key={`${sectionIndex}-${section.heading}`}>
          <header><span>{String(sectionIndex + 1).padStart(2, "0")}</span><div><small>ETAPA</small><h2>{section.heading}</h2></div></header>
          <p>{section.body}</p>
          {(section.objective || section.action) && <div className="material-step-direction">
            {section.objective && <div><Target size={17}/><span><small>POR QUE VOCÊ ESTÁ FAZENDO ISSO</small><strong>{section.objective}</strong></span></div>}
            {section.action && <div><PlayCircle size={17}/><span><small>FAÇA AGORA</small><strong>{section.action}</strong></span></div>}
          </div>}
          {section.example && <div className="material-step-example"><small>EXEMPLO DE RESPOSTA</small><p>{section.example}</p></div>}
          <div className="material-task-list">
            {section.items.map((item, itemIndex) => {
              const key = `${sectionIndex}-${itemIndex}`;
              return <label className={checked.has(key) ? "checked" : ""} key={key}><input suppressHydrationWarning type="checkbox" checked={checked.has(key)} onChange={() => toggle(key)} /><span><Check size={14}/></span><strong>{item}</strong></label>;
            })}
          </div>
          {section.responsePrompt && <div className="material-workspace"><label htmlFor={`resposta-${sectionIndex}`}><ClipboardCheck size={17}/><span><small>SEU REGISTRO DESTA ETAPA</small><strong>{section.responsePrompt}</strong></span></label><textarea id={`resposta-${sectionIndex}`} value={answers[String(sectionIndex)] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [String(sectionIndex)]: event.target.value }))} placeholder={section.responsePlaceholder}/><div><span>Salvo automaticamente neste navegador.</span>{section.completionCriterion && <p><Check size={14}/><strong>Está pronto quando:</strong> {section.completionCriterion}</p>}</div></div>}
          {section.practicalTip && <aside className="material-tip"><strong>Na prática</strong><p>{section.practicalTip}</p></aside>}
        </section>
      ))}
      {answerTotal > 0 && <section className="material-plan-export"><ClipboardCheck size={22}/><div><small>SEU PLANO PREENCHIDO</small><h2>Leve suas respostas com você</h2><p>O botão reúne os registros das etapas na ordem certa. Campos ainda vazios continuam marcados para você completar depois.</p></div><button type="button" onClick={copyPlan}><Copy size={15}/>{copiedPlan ? "Plano copiado" : "Copiar plano completo"}</button></section>}
    </>
  );
}

export function MaterialTemplateCard({ template, index }: { template: DeliverableTemplate; index: number }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(template.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }
  return <article className="material-template-card"><header><div><span>MODELO {String(index + 1).padStart(2, "0")}</span><h3>{template.title}</h3></div><button type="button" onClick={copy}><Copy size={15}/>{copied ? "Copiado" : "Copiar modelo"}</button></header><p>{template.description}</p><pre>{template.content}</pre></article>;
}
