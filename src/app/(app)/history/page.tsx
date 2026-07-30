import { Search, Send } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { StatusBadge } from "@/components/status";
import { formatDate } from "@/lib/domain";
import { listRuns } from "@/server/data";

export const metadata = { title: "Histórico" };

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ status?: string; retryDm?: string }> }) {
  const { status, retryDm } = await searchParams;
  const runs = (await listRuns()).filter((run) => !status || run.status === status);
  return <div className="page-shell"><header className="page-header compact"><div><p className="eyebrow">Auditoria</p><h1>Histórico de execuções</h1><p>Cada comentário, tentativa e resultado em uma trilha verificável.</p></div></header>
    {retryDm === "success" && <p className="form-success" role="status">Mensagem privada enviada com sucesso, sem repetir a resposta pública.</p>}
    {retryDm === "error" && <p className="form-alert" role="alert">A mensagem privada não foi enviada. Consulte o novo diagnóstico na execução abaixo.</p>}
    <Card className="filter-bar">
      <div className="filter-label"><Search size={16} /><span>Filtrar por resultado</span></div>
      <nav className="filter-options" aria-label="Filtrar histórico por resultado"><a className={!status ? "active" : ""} href="/history">Todos</a><a className={status === "succeeded" ? "active" : ""} href="/history?status=succeeded">Concluídos</a><a className={status === "partial" ? "active" : ""} href="/history?status=partial">Parciais</a><a className={status === "failed" ? "active" : ""} href="/history?status=failed">Falhas</a></nav>
    </Card>
    <div className="history-table"><div className="history-head"><span>Pessoa e comentário</span><span>Automação</span><span>Resposta pública</span><span>DM</span><span>Resultado</span><span>Data</span><span>Ação</span></div>{runs.map((run) => <article className="history-row" key={run.id}>
      <div className="history-person"><strong>@{run.commenterUsername}</strong><small>“{run.commentText}”</small></div>
      <div className="history-cell history-automation" data-label="Automação"><span>{run.automationName}</span></div>
      <div className="history-cell history-public" data-label="Resposta pública"><StatusBadge status={run.publicReplyStatus} /></div>
      <div className="history-cell history-dm" data-label="Mensagem privada"><StatusBadge status={run.dmStatus} />{run.requireFollow && <small className="run-follow-status"><StatusBadge status={run.followStatus} /></small>}</div>
      <div className="history-cell history-result" data-label="Resultado"><StatusBadge status={run.status} />{run.contentDeliveredAt && <small>Conteúdo entregue {formatDate(run.contentDeliveredAt)}</small>}{run.errorMessage && <small className="error-copy">{run.errorMessage}</small>}</div>
      <div className="history-cell history-date" data-label="Data"><span>{formatDate(run.createdAt)}</span></div>
      <div className="history-action">{run.dmStatus === "failed" && <form action={`/api/meta/runs/${run.id}/retry-dm`} method="post"><Button variant="secondary" type="submit"><Send size={14} /> Reenviar DM</Button></form>}</div>
    </article>)}</div>
  </div>;
}
