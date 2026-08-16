import { notFound } from "next/navigation";
import { ArrowRight, BookOpenCheck, CheckCircle2, Clock3, Gauge, Lightbulb, ListChecks, PlayCircle, ShieldAlert, Sparkles, UserRound } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/env";
import { demoStore } from "@/server/demo-store";
import type { GeneratedDeliverable } from "@/types/content-studio";
import { MaterialActions } from "@/features/content-studio/material-actions";
import { MaterialChecklist, MaterialQuickFlow, MaterialTemplateCard } from "@/features/content-studio/material-interactive";

export const dynamic = "force-dynamic";
export const metadata = { title: "Material · InstaChat", robots: { index: false, follow: false } };

export default async function PublicMaterialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let material: GeneratedDeliverable | null = null;
  if (isDemoMode) material = demoStore().contentProjects.find((item) => item.deliverableSlug === slug)?.contentPackage?.deliverable ?? null;
  else {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.rpc("get_public_deliverable", { slug_value: slug });
    material = (data?.[0]?.content as GeneratedDeliverable | undefined) ?? null;
  }
  if (!material) notFound();

  const outcome = material.outcome ?? material.summary;
  const startHere = material.startHere;
  const finalArtifact = material.finalArtifact ?? outcome;
  const completionCriteria = material.completionCriteria ?? [];
  const estimated = material.estimatedMinutes ?? 10;
  const difficulty = material.difficulty === "intermediate" ? "Intermediário" : "Iniciante";
  const prerequisites = material.prerequisites ?? [];
  const examples = material.examples ?? [];
  const templates = material.templates ?? [];
  const pitfalls = material.pitfalls ?? [];
  const nextSteps = material.nextSteps ?? [];
  const flow = material.executionFlow ?? [];

  const detailedGuide = <>
    <section className="material-opening material-opening-detailed"><p>{material.introduction}</p>
      {startHere && <div className="material-start"><PlayCircle/><div><small>COMECE POR AQUI · PRIMEIROS 5 MINUTOS</small><strong>{startHere}</strong></div></div>}
      <div className="material-outcome"><Lightbulb/><div><small>O QUE VOCÊ VAI CONSTRUIR</small><strong>{finalArtifact}</strong></div></div>
      {prerequisites.length > 0 && <div className="material-prerequisites"><strong>Separe antes de começar</strong><ul>{prerequisites.map((item) => <li key={item}>{item}</li>)}</ul></div>}
      {completionCriteria.length > 0 && <div className="material-completion"><strong><CheckCircle2/>No final, confira estes pontos</strong><ul>{completionCriteria.map((item) => <li key={item}>{item}</li>)}</ul></div>}
    </section>
    <MaterialChecklist sections={material.sections} storageKey={`instachat-material-${slug}`}/>
    {examples.length > 0 && <section className="material-examples" id="exemplos"><header><p>EXEMPLO PREENCHIDO</p><h2>Veja a aplicação antes de fazer a sua</h2></header>{examples.map((example) => <article key={example.title}><h3>{example.title}</h3><dl><div><dt>Cenário</dt><dd>{example.scenario}</dd></div><div><dt>Aplicação</dt><dd>{example.application}</dd></div><div><dt>Como validar</dt><dd>{example.result}</dd></div></dl></article>)}</section>}
    {templates.length > 0 && <section className="material-templates" id="modelos"><header><p>OUTROS MODELOS</p><h2>Use se precisar aprofundar</h2><span>As quebras de linha são mantidas ao copiar.</span></header>{templates.map((template, index) => <MaterialTemplateCard template={template} index={index} key={template.title}/>)}</section>}
    {pitfalls.length > 0 && <section className="material-pitfalls"><header><ShieldAlert/><div><p>EVITE ESTES ATALHOS</p><h2>Erros que enfraquecem o resultado</h2></div></header><div>{pitfalls.map((pitfall) => <article key={pitfall.mistake}><strong>{pitfall.mistake}</strong><p>{pitfall.correction}</p></article>)}</div></section>}
    {nextSteps.length > 0 && <section className="material-next"><p>SEU PRÓXIMO PASSO</p><h2>O que fazer depois do teste</h2><ol>{nextSteps.map((step, index) => <li key={step}><span>{index + 1}</span><strong>{step}</strong><ArrowRight size={16}/></li>)}</ol></section>}
  </>;

  return <main className="material-page"><MaterialActions/><article className="material-document">
    <header className="material-hero"><div className="material-brand"><span><BookOpenCheck size={20}/></span><div><strong>{material.authorHandle ?? "InstaChat"}</strong><small>Material criado para aplicar</small></div></div><p>GUIA PRÁTICO</p><h1>{material.title}</h1><strong>{material.summary}</strong><div className="material-meta"><div><Clock3/><span><small>Tempo estimado</small><b>{estimated} minutos</b></span></div><div><Gauge/><span><small>Nível</small><b>{difficulty}</b></span></div><div><ListChecks/><span><small>Execução</small><b>{flow.length || material.sections.length} passos</b></span></div></div></header>
    <div className="material-layout"><aside className="material-toc"><strong>Faça nesta ordem</strong><nav aria-label="Passos do material">{flow.length ? flow.map((step, index) => <span className="material-toc-item" key={step.title}><b>{String(index + 1).padStart(2, "0")}</b>{step.title}</span>) : material.sections.map((section, index) => <a href={`#etapa-${index + 1}`} key={section.heading}><span>{String(index + 1).padStart(2, "0")}</span>{section.heading}</a>)}</nav><div><Sparkles size={17}/><span><small>O que ficará pronto</small><strong>{finalArtifact}</strong></span></div></aside>
      <div className="material-content">{flow.length > 0 && material.resultPrompt && material.resultPlaceholder && material.finalApplication ? <>
        <section className="material-fast-opening"><small>VOCÊ SÓ PRECISA SEGUIR A ORDEM</small><h2>{finalArtifact}</h2><p>{startHere ?? "Comece pelo primeiro cartão e avance somente depois de concluir a ação."}</p></section>
        <MaterialQuickFlow flow={flow} resultPrompt={material.resultPrompt} resultPlaceholder={material.resultPlaceholder} finalApplication={material.finalApplication} storageKey={`instachat-result-${slug}`}/>
      </> : detailedGuide}</div>
    </div><footer><UserRound size={24}/><div><p>{material.closing}</p><small>Criado por {material.authorHandle ?? "InstaChat"} com o Estúdio do InstaChat</small></div></footer>
  </article></main>;
}
