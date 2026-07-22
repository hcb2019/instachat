"use client";

import { Check, Copy, RotateCcw } from "lucide-react";
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
