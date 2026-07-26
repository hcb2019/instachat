"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { Check, ExternalLink, Film, MessageCircle, Search, Send, Sparkles } from "lucide-react";
import { saveAutomation, type AutomationActionState } from "@/features/automations/actions";
import { Button, Card } from "@/components/ui";
import type { Automation, InstagramMedia } from "@/types/domain";

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.[0] ? <span className="field-error">{messages[0]}</span> : null;
}

export function AutomationForm({ automation, media }: { automation?: Automation; media: InstagramMedia[] }) {
  const [state, action, pending] = useActionState<AutomationActionState, FormData>(saveAutomation, {});
  const [dm, setDm] = useState(automation?.dmMessage ?? "");
  const [destination, setDestination] = useState(automation?.destinationUrl ?? "");
  const [selectedMediaId, setSelectedMediaId] = useState(automation?.mediaId ?? "");
  const [reelQuery, setReelQuery] = useState("");
  const normalizedQuery = reelQuery.trim().toLocaleLowerCase("pt-BR");
  const visibleMedia = normalizedQuery
    ? media.filter((item) => item.caption.toLocaleLowerCase("pt-BR").includes(normalizedQuery))
    : media;
  return <form action={action} className="automation-layout">
    {automation && <input type="hidden" name="id" value={automation.id} />}
    <section className="form-stack">
      {state.error && <div className="form-alert" role="alert">{state.error}</div>}
      <Card className="form-section"><div className="section-kicker">01 · Identidade</div><h2>O que esta automação faz?</h2>
        <label><span>Nome interno</span><input name="name" defaultValue={automation?.name} placeholder="Ex.: Reel — Guia de lançamento" maxLength={80} /><FieldError messages={state.fields?.name} /></label>
        <fieldset className="reel-picker">
          <legend>Reel vinculado</legend>
          <div className="reel-picker-toolbar">
            <div className="reel-search"><Search size={15} aria-hidden="true" /><input value={reelQuery} onChange={(event) => setReelQuery(event.target.value)} placeholder="Buscar pela legenda…" aria-label="Buscar Reel pela legenda" /></div>
            <span>{visibleMedia.length} de {media.length} Reels</span>
          </div>
          <div className="reel-grid" role="radiogroup" aria-label="Escolha o Reel da automação">
            {visibleMedia.map((item) => {
              const selected = selectedMediaId === item.id;
              return <label className={`reel-option${selected ? " selected" : ""}`} key={item.id}>
                <input type="radio" name="mediaId" value={item.id} checked={selected} onChange={() => setSelectedMediaId(item.id)} />
                <span className="reel-cover">
                  {item.thumbnailUrl
                    ? <Image src={item.thumbnailUrl} alt="" fill sizes="(max-width: 470px) 42vw, (max-width: 760px) 28vw, 180px" unoptimized />
                    : <span className="reel-cover-fallback"><Film size={28} /><small>Sem capa</small></span>}
                  <span className="reel-selected-mark"><Check size={14} /></span>
                </span>
                <span className="reel-option-copy">
                  <strong>{item.caption || "Reel sem legenda"}</strong>
                  <small>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" }).format(new Date(item.publishedAt))}</small>
                </span>
              </label>;
            })}
          </div>
          {!visibleMedia.length && <div className="reel-empty"><Film size={22} /><span>Nenhum Reel encontrado para essa busca.</span></div>}
          <FieldError messages={state.fields?.mediaId} />
        </fieldset>
      </Card>
      <Card className="form-section"><div className="section-kicker">02 · Gatilho</div><h2>Qual comentário inicia o fluxo?</h2>
        <label><span>Palavra-chave</span><input name="keyword" defaultValue={automation?.keyword} placeholder="1991" maxLength={80} /><small>Correspondência exata, sem diferenciar maiúsculas e espaços extras. Pontuação conta.</small><FieldError messages={state.fields?.keyword} /></label>
      </Card>
      <Card className="form-section"><div className="section-kicker">03 · Respostas</div><h2>O que a pessoa recebe?</h2>
        <label><span>Resposta pública</span><textarea name="publicReply" defaultValue={automation?.publicReply} placeholder="Enviei para você. Confira seu direct." maxLength={500} rows={3} /><FieldError messages={state.fields?.publicReply} /></label>
        <label><span>Mensagem privada</span><textarea name="dmMessage" value={dm} onChange={(event) => setDm(event.target.value)} placeholder="Aqui está o material que prometi:" maxLength={900} rows={5} /><FieldError messages={state.fields?.dmMessage} /></label>
        <label><span>URL de destino</span><input name="destinationUrl" type="url" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="https://seusite.com/produto" maxLength={2048} /><FieldError messages={state.fields?.destinationUrl} /></label>
      </Card>
      <div className="form-actions"><Button name="intent" value="draft" variant="secondary" disabled={pending}>Salvar rascunho</Button><Button name="intent" value="active" disabled={pending}>{pending ? "Salvando…" : automation?.status === "active" ? "Salvar e manter ativa" : "Salvar e ativar"}</Button></div>
    </section>
    <aside className="preview-column"><div className="preview-label"><Sparkles size={15} /> Prévia do direct</div><div className="phone"><div className="phone-top"><span className="preview-avatar">I</span><div><strong>instachat.demo</strong><small>Instagram</small></div></div><div className="message-bubble"><p>{dm || "Sua mensagem aparecerá aqui."}</p>{destination && <span className="preview-link"><ExternalLink size={13} /> Abrir material</span>}</div><div className="phone-hint"><MessageCircle size={14} /> Resposta privada ao comentário</div><div className="phone-input"><span>Mensagem…</span><Send size={15} /></div></div></aside>
  </form>;
}
