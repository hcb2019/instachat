"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { DeliverableSection, DeliverableTemplate } from "@/types/content-studio";

export function MaterialChecklist({ sections }: { sections: DeliverableSection[] }) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const total = useMemo(() => sections.reduce((sum, section) => sum + section.items.length, 0), [sections]);
  const percentage = total ? Math.round((checked.size / total) * 100) : 0;

  function toggle(key: string) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <>
      <div className="material-progress" aria-label={`${percentage}% do material concluído`}>
        <div><strong>Seu progresso</strong><span>{checked.size} de {total} ações</span></div>
        <progress max={total || 1} value={checked.size}>{percentage}%</progress>
      </div>
      {sections.map((section, sectionIndex) => (
        <section className="material-step" id={`etapa-${sectionIndex + 1}`} key={`${sectionIndex}-${section.heading}`}>
          <header><span>{String(sectionIndex + 1).padStart(2, "0")}</span><div><small>ETAPA</small><h2>{section.heading}</h2></div></header>
          <p>{section.body}</p>
          <div className="material-task-list">
            {section.items.map((item, itemIndex) => {
              const key = `${sectionIndex}-${itemIndex}`;
              return <label className={checked.has(key) ? "checked" : ""} key={key}><input suppressHydrationWarning type="checkbox" checked={checked.has(key)} onChange={() => toggle(key)} /><span><Check size={14}/></span><strong>{item}</strong></label>;
            })}
          </div>
          {section.practicalTip && <aside className="material-tip"><strong>Na prática</strong><p>{section.practicalTip}</p></aside>}
        </section>
      ))}
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
