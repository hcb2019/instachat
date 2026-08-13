"use client";
import { useActionState } from "react";
import { saveCreatorProfile, type StudioActionState } from "@/features/content-studio/actions";
import type { CreatorProfile } from "@/types/content-studio";

export function CreatorProfileForm({ profile }: { profile: CreatorProfile }) {
  const [state, action, pending] = useActionState<StudioActionState, FormData>(saveCreatorProfile, {});
  return <form action={action} className="card studio-profile-form"><div><p className="eyebrow">Sua voz</p><h2>Como o conteúdo deve soar</h2><p>O Humanizer usa essas referências para escrever do seu jeito, sem cara de legenda pronta.</p></div>
    {state.error && <p className="form-alert">{state.error}</p>}
    <div className="studio-profile-grid"><label><span>Seu @</span><input name="instagramHandle" defaultValue={profile.instagramHandle} /></label><label><span>Nicho</span><input name="niche" defaultValue={profile.niche} /></label><label className="wide"><span>Público</span><textarea name="audience" defaultValue={profile.audience} rows={3} /></label><label className="wide"><span>Tom de voz</span><textarea name="voice" defaultValue={profile.voice} rows={3} /></label><label><span>Expressões que você usa</span><input name="preferredTerms" defaultValue={profile.preferredTerms.join(", ")} placeholder="na prática, testa isso" /></label><label><span>Palavras que você evita</span><input name="avoidedTerms" defaultValue={profile.avoidedTerms.join(", ")} placeholder="revolucionário, jornada" /></label><label className="wide"><span>CTA padrão</span><input name="defaultCta" defaultValue={profile.defaultCta} /></label></div>
    <button className="button button-secondary" disabled={pending}>{pending ? "Salvando…" : "Salvar minha voz"}</button>
  </form>;
}
