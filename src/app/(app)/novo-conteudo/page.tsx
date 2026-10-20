import { NewContentForm } from "@/features/pipeline/new-content-form";
import { getConnection } from "@/server/data";
import { isDemoMode } from "@/lib/env";

export const metadata = { title: "Novo conteúdo" };

export default async function NewContentPage() {
  const connection = await getConnection();
  const canPublish = Boolean(connection) && !isDemoMode;
  return <div className="page-shell">
    <header className="page-header compact"><div><p className="eyebrow">Novo conteúdo</p><h1>Publique o Reel e ligue a automação.</h1><p>Envie o vídeo para a Meta, defina a palavra-chave e deixe o Vortex criar o fluxo comentário → direct automaticamente.</p></div></header>
    <NewContentForm canPublish={canPublish} />
  </div>;
}
