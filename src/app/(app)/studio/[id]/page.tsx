import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Film, PackageCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui";
import { generateContentPackage } from "@/features/content-studio/actions";
import { CopyButton } from "@/features/content-studio/copy-button";
import { PackageEditor } from "@/features/content-studio/package-editor";
import { goalLabel, pillarLabel } from "@/lib/content-studio";
import { env } from "@/lib/env";
import { getContentProject } from "@/server/content-studio/data";
import { listMedia } from "@/server/data";

export default async function StudioProjectPage({ params, searchParams }: { params: Promise<{id:string}>; searchParams: Promise<{generated?:string;error?:string}> }) {
  const [{id},query] = await Promise.all([params,searchParams]); const [project,media]=await Promise.all([getContentProject(id),listMedia()]); if(!project) notFound();
  return <div className="page-shell studio-detail"><header className="page-header compact"><div><p className="eyebrow">Projeto de conteúdo</p><h1>{project.title}</h1><p>{project.topic}</p></div><div className="studio-detail-meta"><Badge tone={project.contentPackage?"success":"accent"}>{project.contentPackage?"Pacote pronto":"Escolha uma ideia"}</Badge><span>{pillarLabel(project.pillar)}</span><span>{goalLabel(project.primaryGoal)}</span></div></header>
    {query.error && <p className="form-alert">Não foi possível concluir essa etapa. Tente novamente.</p>}
    {!project.contentPackage ? <><section className="studio-choice-intro"><Sparkles size={21}/><div><strong>Escolha o caminho que mais parece com você</strong><p>As três ideias atacam o mesmo assunto de jeitos diferentes. Nada é definitivo: depois você poderá editar cada linha.</p></div></section><div className="studio-concept-grid">{project.concepts.map((concept,index)=><article className={`card studio-concept-card concept-${concept.style}`} key={`${index}-${concept.title}`}><header><span>IDEIA 0{index+1}</span><Badge tone={concept.style==="safe"?"success":concept.style==="strong"?"danger":"accent"}>{concept.style==="safe"?"Educativa":concept.style==="strong"?"Forte":"Provocativa"}</Badge></header><div className="studio-copy-row"><h2>{concept.hook}</h2><CopyButton value={concept.hook}/></div><p>{concept.angle}</p><dl><div><dt>Dor</dt><dd>{concept.audiencePain}</dd></div><div><dt>Promessa</dt><dd>{concept.promise}</dd></div><div><dt>CTA sugerida</dt><dd><span>{concept.cta}</span><CopyButton value={concept.cta}/></dd></div><div><dt>Gravação</dt><dd>{concept.visualDirection}</dd></div></dl><div className="studio-concept-delivery"><PackageCheck size={17}/><span>{concept.deliverableIdea}</span></div><div className="studio-concept-keywords">{concept.keywords.map((keyword)=><span key={keyword}><code>{keyword}</code><CopyButton value={keyword}/></span>)}</div><form action={generateContentPackage}><input type="hidden" name="id" value={project.id}/><input type="hidden" name="conceptIndex" value={index}/><button className="button button-primary">Escolher e gerar pacote <ArrowRight size={15}/></button></form></article>)}</div></> : <><section className="studio-ready-strip"><CheckCircle2/><div><strong>Campanha pronta para revisar</strong><span>Hook, três legendas, entregável e automação já falam da mesma promessa.</span></div><div><Film size={16}/> {project.mediaId?"Reel vinculado":"Reel ainda não vinculado"}</div></section><PackageEditor project={project} media={media} publicUrl={`${env.APP_ORIGIN}/materiais/${project.deliverableSlug}`}/></>}
  </div>;
}
