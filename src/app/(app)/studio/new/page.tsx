import { ContentProjectForm } from "@/features/content-studio/project-form";
import { env, isDemoMode } from "@/lib/env";
import { hasValidOpenAIKeyShape } from "@/lib/openai-error";
import { getCreatorProfile } from "@/server/content-studio/data";

export const metadata = { title: "Criar conteúdo" };

export default async function NewStudioProjectPage({ searchParams }: { searchParams: Promise<{ insight?: string; title?: string; topic?: string }> }) {
  const [profile, query] = await Promise.all([getCreatorProfile(), searchParams]);
  const hasKey = hasValidOpenAIKeyShape(env.OPENAI_API_KEY);
  return <div className="page-shell"><header className="page-header compact"><div><p className="eyebrow">Nova campanha</p><h1>Vamos encontrar o melhor ângulo.</h1><p>Você traz a situação. O InstaChat cria três caminhos com hook, material e chamada conectados.</p></div></header>{!isDemoMode && !hasKey && <p className="form-alert">{env.OPENAI_API_KEY ? "A OPENAI_API_KEY configurada não tem o formato de uma chave API válida. Substitua o valor na Vercel por uma chave criada na plataforma da OpenAI e faça um novo deploy." : "O Estúdio está usando a geração local, baseada somente neste briefing. Configure OPENAI_API_KEY no servidor para liberar a redação completa por IA."}</p>}<ContentProjectForm profile={profile} seed={{ title: query.title, topic: query.topic, sourceInsightId: query.insight }} /></div>;
}
