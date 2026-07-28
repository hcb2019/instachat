"use client";

import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import { Check, ExternalLink, Film, Lightbulb, LoaderCircle, MessageCircle, Search, Send, Sparkles, UserCheck } from "lucide-react";
import {
  saveAutomation,
  suggestAutomationMessages,
  type AutomationActionState,
} from "@/features/automations/actions";
import { Button, Card } from "@/components/ui";
import type { AutomationMessageSuggestion } from "@/lib/automation-suggestions";
import { DEFAULT_FOLLOW_GATE_MESSAGE, DEFAULT_NOT_FOLLOWING_MESSAGE } from "@/lib/domain";
import type { Automation, InstagramMedia } from "@/types/domain";

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.[0] ? <span className="field-error">{messages[0]}</span> : null;
}

export function AutomationForm({ automation, media }: { automation?: Automation; media: InstagramMedia[] }) {
  const [state, action, pending] = useActionState<AutomationActionState, FormData>(saveAutomation, {});
  const [suggestionPending, startSuggestionTransition] = useTransition();
  const [publicReply, setPublicReply] = useState(automation?.publicReply ?? "");
  const [dm, setDm] = useState(automation?.dmMessage ?? "");
  const [destination, setDestination] = useState(automation?.destinationUrl ?? "");
  const [requireFollow, setRequireFollow] = useState(automation?.requireFollow ?? false);
  const [followGateMessage, setFollowGateMessage] = useState(automation?.followGateMessage || DEFAULT_FOLLOW_GATE_MESSAGE);
  const [notFollowingMessage, setNotFollowingMessage] = useState(automation?.notFollowingMessage || DEFAULT_NOT_FOLLOWING_MESSAGE);
  const [selectedMediaId, setSelectedMediaId] = useState(automation?.mediaId ?? "");
  const [reelQuery, setReelQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AutomationMessageSuggestion[]>([]);
  const [suggestionError, setSuggestionError] = useState("");
  const normalizedQuery = reelQuery.trim().toLocaleLowerCase("pt-BR");
  const visibleMedia = normalizedQuery
    ? media.filter((item) => item.caption.toLocaleLowerCase("pt-BR").includes(normalizedQuery))
    : media;
  const selectedMedia = media.find((item) => item.id === selectedMediaId);

  function selectMedia(id: string) {
    setSelectedMediaId(id);
    setSuggestions([]);
    setSuggestionError("");
  }

  function generateSuggestions() {
    if (!selectedMediaId) return;
    setSuggestionError("");
    startSuggestionTransition(async () => {
      const result = await suggestAutomationMessages(selectedMediaId);
      if ("error" in result) {
        setSuggestions([]);
        setSuggestionError(result.error);
        return;
      }
      setSuggestions(result.suggestions);
    });
  }

  function applySuggestion(suggestion: AutomationMessageSuggestion) {
    setPublicReply(suggestion.publicReply);
    setDm(suggestion.dmMessage);
  }

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
                <input type="radio" name="mediaId" value={item.id} checked={selected} onChange={() => selectMedia(item.id)} />
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
        <div className="message-suggestion-box">
          <div className="message-suggestion-intro">
            <span className="suggestion-icon"><Lightbulb size={18} /></span>
            <div>
              <strong>Sugestões para este conteúdo</strong>
              <p>{selectedMedia ? "Analisamos a legenda do Reel e preparamos mensagens que você pode revisar e usar." : "Escolha um Reel para gerar respostas relacionadas ao conteúdo."}</p>
            </div>
            <button type="button" className="button button-secondary" onClick={generateSuggestions} disabled={!selectedMediaId || suggestionPending}>
              {suggestionPending ? <LoaderCircle className="spin" size={15} /> : <Sparkles size={15} />}
              {suggestionPending ? "Analisando…" : suggestions.length ? "Gerar novamente" : "Gerar sugestões"}
            </button>
          </div>
          {suggestionError && <p className="suggestion-error" role="alert">{suggestionError}</p>}
          {suggestions.length > 0 && <div className="suggestion-grid" aria-live="polite">
            {suggestions.map((suggestion) => <article className="suggestion-card" key={suggestion.label}>
              <div className="suggestion-card-head"><strong>{suggestion.label}</strong><button type="button" onClick={() => applySuggestion(suggestion)}>Usar conjunto</button></div>
              <span>Público</span><p>{suggestion.publicReply}</p>
              <span>Direct</span><p>{suggestion.dmMessage}</p>
              <small>{suggestion.rationale}</small>
            </article>)}
          </div>}
        </div>
        <label><span>Resposta pública</span><textarea name="publicReply" value={publicReply} onChange={(event) => setPublicReply(event.target.value)} placeholder="Enviei para você. Confira seu direct." maxLength={500} rows={3} /><FieldError messages={state.fields?.publicReply} /></label>
        <label><span>Mensagem privada</span><textarea name="dmMessage" value={dm} onChange={(event) => setDm(event.target.value)} placeholder="Aqui está o material que prometi:" maxLength={900} rows={5} /><FieldError messages={state.fields?.dmMessage} /></label>
        <label><span>URL de destino</span><input name="destinationUrl" type="url" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="https://seusite.com/produto" maxLength={2048} /><FieldError messages={state.fields?.destinationUrl} /></label>
        <div className={`follow-gate${requireFollow ? " enabled" : ""}`}>
          <label className="follow-gate-switch">
            <span className="follow-gate-icon"><UserCheck size={19} /></span>
            <span className="follow-gate-copy">
              <strong>Liberar conteúdo somente para seguidores</strong>
              <small>O Instagram só permite confirmar depois que a pessoa responder à primeira mensagem.</small>
            </span>
            <input
              type="checkbox"
              name="requireFollow"
              checked={requireFollow}
              onChange={(event) => setRequireFollow(event.target.checked)}
            />
            <span className="switch-control" aria-hidden="true" />
          </label>
          {requireFollow && <div className="follow-gate-fields">
            <div className="follow-gate-flow" aria-label="Fluxo da confirmação">
              <span>1 · Comentou</span><span>2 · Respondeu PRONTO</span><span>3 · Seguimento confirmado</span><span>4 · Link liberado</span>
            </div>
            <label>
              <span>Primeira mensagem</span>
              <textarea name="followGateMessage" value={followGateMessage} onChange={(event) => setFollowGateMessage(event.target.value)} maxLength={900} rows={4} />
              <small>Enviada no lugar do link. A pessoa deve responder para autorizar a verificação.</small>
              <FieldError messages={state.fields?.followGateMessage} />
            </label>
            <label>
              <span>Se a pessoa ainda não seguir</span>
              <textarea name="notFollowingMessage" value={notFollowingMessage} onChange={(event) => setNotFollowingMessage(event.target.value)} maxLength={900} rows={4} />
              <FieldError messages={state.fields?.notFollowingMessage} />
            </label>
          </div>}
          {!requireFollow && <>
            <input type="hidden" name="followGateMessage" value={followGateMessage} />
            <input type="hidden" name="notFollowingMessage" value={notFollowingMessage} />
          </>}
        </div>
      </Card>
      <div className="form-actions"><Button name="intent" value="draft" variant="secondary" disabled={pending}>Salvar rascunho</Button><Button name="intent" value="active" disabled={pending}>{pending ? "Salvando…" : automation?.status === "active" ? "Salvar e manter ativa" : "Salvar e ativar"}</Button></div>
    </section>
    <aside className="preview-column"><div className="preview-label"><Sparkles size={15} /> Prévia do direct</div><div className="phone"><div className="phone-top"><span className="preview-avatar">I</span><div><strong>instachat.demo</strong><small>Instagram</small></div></div>{requireFollow && <><div className="message-bubble"><p>{followGateMessage}</p></div><div className="message-bubble message-bubble-user"><p>PRONTO</p></div></>}<div className="message-bubble"><p>{dm || "Sua mensagem aparecerá aqui."}</p>{destination && <span className="preview-link"><ExternalLink size={13} /> Abrir material</span>}</div><div className="phone-hint"><MessageCircle size={14} /> {requireFollow ? "Link liberado após confirmar o seguidor" : "Resposta privada ao comentário"}</div><div className="phone-input"><span>Mensagem…</span><Send size={15} /></div></div></aside>
  </form>;
}
