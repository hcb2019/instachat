import Link from "next/link";
import { ArrowRight, AtSign, BookOpenCheck, CheckCircle2, Clock3, RefreshCw, ShieldCheck } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { StatusBadge } from "@/components/status";
import { formatDate } from "@/lib/domain";
import { getConnection, listMedia } from "@/server/data";
import { isDemoMode } from "@/lib/env";

export const metadata = { title: "Integração" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ sync?: string; count?: string }> }) {
  const query = await searchParams;
  const [connection, media] = await Promise.all([getConnection(), listMedia()]);
  return <div className="page-shell"><header className="page-header compact"><div><p className="eyebrow">Integração</p><h1>Conta do Instagram</h1><p>Estado da conexão, permissões e sincronização dos seus Reels.</p></div><Link className="button button-secondary" href="/connection-guide"><BookOpenCheck size={15} /> Ver guia completo <ArrowRight size={14} /></Link></header>
    {query.sync === "success" && <p className="form-success" role="status">Sincronização concluída. {Number(query.count ?? 0)} Reel(is) encontrado(s).</p>}
    {query.sync === "error" && <p className="form-alert" role="alert">A sincronização não foi concluída. Veja o motivo abaixo e tente novamente.</p>}
    {connection ? <Card className="connection-card"><div className="connection-main"><div className="instagram-avatar"><AtSign size={24} /></div><div><div className="title-line"><h2>@{connection.username}</h2><StatusBadge status={connection.status} /></div><p>Conta profissional · Instagram API with Instagram Login</p></div></div><div className="connection-stats"><div><Clock3 size={16} /><span>Última sincronização<strong>{formatDate(connection.lastSyncAt)}</strong></span></div><div><CheckCircle2 size={16} /><span>Reels disponíveis<strong>{media.length}</strong></span></div><div><ShieldCheck size={16} /><span>Token válido até<strong>{formatDate(connection.tokenExpiresAt)}</strong></span></div></div><form action="/api/meta/media/sync" method="post"><Button variant="secondary" disabled={isDemoMode}><RefreshCw size={15} /> {isDemoMode ? "Simulação ativa" : "Sincronizar Reels"}</Button></form></Card> : <Card className="empty-state"><AtSign size={28} /><h2>Conecte sua conta profissional</h2><p>O InstaChat solicitará acesso ao perfil, comentários e métricas de conteúdo.</p><a className="button button-primary" href="/api/meta/oauth/start">Conectar Instagram</a></Card>}
    {connection?.lastError && <Card><p className="eyebrow">Diagnóstico da última tentativa</p><h2>O que impediu a sincronização</h2><p>{connection.lastError}</p><p>Se a Meta mencionar permissão ou token, reautorize a conta pelo botão de conexão. Nenhum segredo é exibido nesta mensagem.</p></Card>}
    <Card className="permissions-card"><p className="eyebrow">Privilégio mínimo</p><h2>Permissões utilizadas</h2><div><code>instagram_business_basic</code><span>Identifica a conta e lista os Reels.</span></div><div><code>instagram_business_manage_comments</code><span>Recebe, responde comentários e envia a resposta privada permitida.</span></div><div><code>instagram_business_manage_insights</code><span>Lê métricas dos Reels para contextualizar os sinais da audiência.</span></div></Card>
  </div>;
}
