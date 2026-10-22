import Link from "next/link";
import { ArrowRight, Clapperboard, Plus, Sparkles } from "lucide-react";
import { Badge, EmptyState } from "@/components/ui";
import { CreatorProfileForm } from "@/features/content-studio/profile-form";
import { deliverableLabel, pillarLabel } from "@/lib/content-studio";
import { getCreatorProfile, listContentProjects } from "@/server/content-studio/data";

export const metadata = { title: "Estúdio de conteúdo" };
const statusLabel: Record<string, string> = { idea: "Escolher ideia", producing: "Gerando", ready: "Pronto", awaiting_publication: "Aguardando publicação", awaiting_media: "Vincular Reel", automation_draft: "Automação em rascunho", active: "Ativo", archived: "Arquivado" };

export default async function StudioPage() {
  const [projects, profile] = await Promise.all([listContentProjects(), getCreatorProfile()]);
  return <div className="page-shell studio-home">
    <header className="page-header">
      <div>
        <p className="eyebrow">Estúdio de conteúdo</p>
        <h1>Da ideia ao <em>Reel pronto.</em></h1>
        <p>Tema ou ideia automática, três caminhos, um pacote. Você revisa hook, legenda e material antes de publicar.</p>
      </div>
      <div className="studio-home-actions">
        <Link className="button button-secondary" href="/studio/new?mode=ideas"><Sparkles size={16} /> Ideias automáticas</Link>
        <Link className="button button-primary" href="/studio/new"><Plus size={16} /> Escrever tema</Link>
      </div>
    </header>
    <section className="studio-home-intro">
      <div><Sparkles /><span>Ideia</span><small>você escreve ou o Estúdio sugere</small></div>
      <div><Clapperboard /><span>3 caminhos</span><small>educativo, provocativo e forte</small></div>
      <div><ArrowRight /><span>Pacote</span><small>hook, legenda, material e DM</small></div>
    </section>
    {projects.length ? <section className="studio-project-list"><header><div><p className="eyebrow">Seus projetos</p><h2>Continue de onde parou</h2></div><span>{projects.length} projeto{projects.length === 1 ? "" : "s"}</span></header><div className="studio-project-grid">{projects.map((project) => <Link href={`/studio/${project.id}`} className="card studio-project-card" key={project.id}><div className="studio-project-top"><Badge tone={project.status === "ready" ? "success" : "accent"}>{statusLabel[project.status]}</Badge><span>{deliverableLabel(project.deliverableType)}</span></div><h3>{project.title}</h3><p>{project.topic}</p><footer><span>{pillarLabel(project.pillar)}</span><strong>Abrir projeto <ArrowRight size={14} /></strong></footer></Link>)}</div></section> : <EmptyState title="Sua próxima campanha começa aqui" body="Pede ideias automáticas ou explica uma cena em poucas palavras. O Estúdio cria três caminhos e conecta o escolhido a um material e uma automação." action={<Link className="button button-primary" href="/studio/new">Criar primeiro conteúdo</Link>} />}
    <details className="studio-profile-wrap">
      <summary>Como o conteúdo deve soar</summary>
      <CreatorProfileForm profile={profile} />
    </details>
  </div>;
}
