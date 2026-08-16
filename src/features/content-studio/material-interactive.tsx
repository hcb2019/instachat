"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ClipboardCheck, Copy, PlayCircle, Target } from "lucide-react";
import type { DeliverableSection, DeliverableTemplate } from "@/types/content-studio";

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
