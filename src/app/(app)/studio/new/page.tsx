import { ContentProjectForm } from "@/features/content-studio/project-form";
import { getCreatorProfile } from "@/server/content-studio/data";

export const metadata = { title: "Criar conteúdo" };

export default async function NewStudioProjectPage({ searchParams }: { searchParams: Promise<{ insight?: string; title?: string; topic?: string }> }) {
  const [profile, query] = await Promise.all([getCreatorProfile(), searchParams]);
  return <div className="page-shell"><header className="page-header compact"><div><p className="eyebrow">Nova campanha</p><h1>Vamos encontrar o melhor ângulo.</h1><p>Você traz a situação. O InstaChat cria três caminhos com hook, material e chamada conectados.</p></div></header><ContentProjectForm profile={profile} seed={{ title: query.title, topic: query.topic, sourceInsightId: query.insight }} /></div>;
}
