import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Film, PackageCheck, RefreshCw, Sparkles } from "lucide-react";
import { Badge, EmptyState } from "@/components/ui";
import { generateContentPackage, regenerateContentConcepts } from "@/features/content-studio/actions";
import { CopyButton } from "@/features/content-studio/copy-button";
import { PackageEditor } from "@/features/content-studio/package-editor";
import { goalLabel, pillarLabel } from "@/lib/content-studio";
import { env } from "@/lib/env";
import { getContentProject } from "@/server/content-studio/data";
import { listMedia } from "@/server/data";

const studioErrorMessages: Record<string, string> = {
  package_invalid_api_key: "A chave da OpenAI configurada no servidor é inválida. Atualize a OPENAI_API_KEY e faça um novo deploy.",
  package_insufficient_quota: "A conta da OpenAI está sem saldo ou sem faturamento ativo. Confira a cobrança do projeto da API e tente novamente.",
  package_model_not_found: "O modelo configurado não está disponível para este projeto da OpenAI. Confira OPENAI_AUDIENCE_MODEL na Vercel.",
  package_rate_limited: "A OpenAI atingiu um limite temporário de uso. Aguarde um instante e tente novamente.",
  package_connection_failed: "A OpenAI demorou para responder. Seu texto foi mantido; tente gerar novamente em instantes.",
  package_invalid_request: "A OpenAI recusou a configuração desta geração. Confira o modelo configurado ou tente novamente após atualizar o aplicativo.",
  package_generation_failed: "Não foi possível gerar o pacote agora. Seus campos foram mantidos para você tentar novamente.",
  concepts: "Não foi possível gerar as ideias novamente. Tente em instantes.",
  deliverable: "O material não está disponível para criar a automação.",
  connection: "Conecte o Instagram antes de criar a automação.",
  automation: "Não foi possível criar a automação. Tente novamente.",
};

function studioErrorMessage(error: string | undefined) {
  return error ? studioErrorMessages[error] ?? "Não foi possível concluir essa etapa. Tente novamente." : null;
}

export default async function StudioProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ generated?: string; error?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [project, media] = await Promise.all([getContentProject(id), listMedia()]);
  const errorMessage = studioErrorMessage(query.error);
  if (!project) notFound();

  return <div className="page-shell studio-detail">
    <header className="page-header compact"><div><p className="eyebrow">Projeto de conteúdo</p><h1>{project.title}</h1><p>{project.topic}</p></div><div className="studio-detail-meta"><Badge tone={project.contentPackage ? "success" : "accent"}>{project.contentPackage ? "Pacote pronto" : "Escolha uma ideia"}</Badge><span>{pillarLabel(project.pillar)}</span><span>{goalLabel(project.primaryGoal)}</span></div></header>
    {errorMessage && <p className="form-alert" role="alert">{errorMessage}</p>}
    {!project.contentPackage ? project.concepts.length > 0 ? <>
      <section className="studio-choice-intro"><Sparkles size={21}/><div><strong>Escolha o caminho que mais parece com você</strong><p>As ideias atacam o mesmo assunto de jeitos diferentes. Nada é definitivo: depois você poderá editar cada linha.</p></div></section>
      <div className="studio-concept-grid">{project.concepts.map((concept, index) => <article className={`card studio-concept-card concept-${concept.style}`} key={`${index}-${concept.title}`}>
        <header><span>IDEIA 0{index + 1}</span><Badge tone={concept.style === "safe" ? "success" : concept.style === "strong" ? "danger" : "accent"}>{concept.style === "safe" ? "Educativa" : concept.style === "strong" ? "Forte" : "Provocativa"}</Badge></header>
        <div className="studio-copy-row"><h2>{concept.hook}</h2><CopyButton value={concept.hook}/></div>
        <p>{concept.angle}</p>
        <dl><div><dt>Dor</dt><dd>{concept.audiencePain}</dd></div><div><dt>Promessa</dt><dd>{concept.promise}</dd></div><div><dt>CTA sugerida</dt><dd><span>{concept.cta}</span><CopyButton value={concept.cta}/></dd></div><div><dt>Gravação</dt><dd>{concept.visualDirection}</dd></div></dl>
        <div className="studio-concept-delivery"><PackageCheck size={17}/><span>{concept.deliverableIdea}</span></div>
        <div className="studio-concept-keywords">{concept.keywords.map((keyword) => <span key={keyword}><code>{keyword}</code><CopyButton value={keyword}/></span>)}</div>
        <form action={generateContentPackage}><input type="hidden" name="id" value={project.id}/><input type="hidden" name="conceptIndex" value={index}/><button className="button button-primary">Escolher e gerar pacote <ArrowRight size={15}/></button></form>
      </article>)}</div>
    </> : <section className="card studio-concepts-empty"><EmptyState title="As ideias não apareceram" body="Seu projeto foi salvo, mas a geração não trouxe ideias válidas. Tente novamente sem precisar preencher tudo outra vez." action={<form action={regenerateContentConcepts}><input type="hidden" name="id" value={project.id}/><button className="button button-primary"><RefreshCw size={15}/>Gerar as ideias novamente</button></form>}/></section> : <>
      <section className="studio-ready-strip"><CheckCircle2/><div><strong>Campanha pronta para revisar</strong><span>Hook, três legendas, entregável e automação já falam da mesma promessa.</span></div><div><Film size={16}/> {project.mediaId ? "Reel vinculado" : "Reel ainda não vinculado"}</div></section>
      <PackageEditor project={project} media={media} publicUrl={`${env.APP_ORIGIN}/materiais/${project.deliverableSlug}`}/>
    </>}
  </div>;
}
