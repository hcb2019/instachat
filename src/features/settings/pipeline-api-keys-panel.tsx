"use client";

import { useActionState } from "react";
import { Copy, KeyRound, Trash2 } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { createPipelineApiKey, revokePipelineApiKey, type PipelineApiKeyActionState } from "@/features/settings/actions";
import type { PipelineApiKeySummary } from "@/server/pipeline-api-keys";

function formatDate(value: string | null) {
  if (!value) return "Nunca usada";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

export function PipelineApiKeysPanel({ keys }: { keys: PipelineApiKeySummary[] }) {
  const [state, action, pending] = useActionState<PipelineApiKeyActionState, FormData>(createPipelineApiKey, {});
  return <Card className="settings-info-card api-key-card">
    <p className="eyebrow">Agentes externos</p>
    <h2>API keys do pipeline</h2>
    <p>Use uma chave por agente para enviar vídeos, legenda, palavra-chave, fluxo de DM e material para o endpoint <code>POST /api/pipeline/posts</code>.</p>
    <form action={action} className="api-key-create-form">
      <label><span>Nome da chave</span><input name="name" placeholder="Ex.: agente de vídeos" maxLength={80} /></label>
      <Button variant="secondary" disabled={pending}><KeyRound size={15} /> {pending ? "Criando…" : "Criar chave"}</Button>
    </form>
    {state.error && <p className="form-alert" role="alert">{state.error}</p>}
    {state.secret && <div className="api-key-secret" role="status">
      <strong>Copie agora. Esta chave não será exibida novamente.</strong>
      <code>{state.secret}</code>
      <button type="button" onClick={() => navigator.clipboard.writeText(state.secret ?? "")}><Copy size={14} /> Copiar</button>
    </div>}
    <div className="api-key-list">
      {keys.map((key) => <div className="api-key-row" key={key.id}>
        <div><strong>{key.name}</strong><span>{key.prefix}… · criada em {formatDate(key.createdAt)} · {key.revokedAt ? `revogada em ${formatDate(key.revokedAt)}` : `último uso: ${formatDate(key.lastUsedAt)}`}</span></div>
        {!key.revokedAt && <form action={revokePipelineApiKey}><input type="hidden" name="id" value={key.id} /><button className="icon-button" aria-label={`Revogar ${key.name}`}><Trash2 size={15} /></button></form>}
      </div>)}
      {!keys.length && <p className="api-key-empty">Nenhuma chave criada ainda.</p>}
    </div>
  </Card>;
}
