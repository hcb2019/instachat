import Link from "next/link";
import { ArrowRight, Bolt, CheckCircle2, MessageCircle, MousePointerClick, Radar, TriangleAlert, UsersRound } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { StatusBadge } from "@/components/status";
import { categoryLabel } from "@/lib/audience";
import { formatDate, formatPercent } from "@/lib/domain";
import { getAudienceRadarData } from "@/server/audience/data";
import { getDashboardMetrics, listAutomations, listRuns } from "@/server/data";

export const metadata = { title: "Visão geral" };

export default async function DashboardPage() {
  const [metrics, automations, runs, radar] = await Promise.all([getDashboardMetrics(), listAutomations(), listRuns(), getAudienceRadarData({ periodDays: 7, mediaId: null })]);
  const topOpportunity = radar.insights.find(({ status }) => status !== "dismissed");
  const cards = [
    { label: "Automações ativas", value: metrics.activeAutomations, icon: Bolt },
    { label: "Comentários", value: metrics.matchedComments, icon: MessageCircle },
    { label: "DMs confirmadas", value: metrics.sentDms, icon: CheckCircle2 },
    { label: "Cliques únicos", value: metrics.uniqueClicks, icon: MousePointerClick },
  ];
  return <div className="page-shell">
    <header className="page-header"><div><p className="eyebrow">Visão geral</p><h1>Comentários que viram <em>conversas.</em></h1><p>Acompanhe o caminho do interesse até o clique, sem trabalho manual.</p></div><Link className="button button-primary" href="/automations/new">Nova automação <ArrowRight size={16} /></Link></header>
    <section className="metric-grid">{cards.map(({ label, value, icon: Icon }, index) => <Card key={label} className={index === 0 ? "metric-card metric-featured" : "metric-card"}><div className="metric-icon"><Icon size={18} /></div><span>{label}</span><strong>{value}</strong>{index === 2 && <small>{formatPercent(metrics.sentDms, metrics.eligibleRecipients)} dos elegíveis</small>}{index === 3 && <small>{formatPercent(metrics.uniqueClicks, metrics.sentDms)} das DMs</small>}</Card>)}</section>
    <Card className="dashboard-radar"><div className="dashboard-radar-mark"><Radar size={20} /></div><div className="dashboard-radar-copy"><p className="eyebrow">Radar · esta semana</p>{topOpportunity ? <><div className="dashboard-radar-title"><h2>{topOpportunity.title}</h2><Badge tone="accent">{categoryLabel(topOpportunity.category)}</Badge></div><p>{topOpportunity.summary}</p></> : <><h2>Pronto para ouvir sua audiência</h2><p>Analise os comentários para descobrir a principal oportunidade da semana.</p></>}</div><div className="dashboard-radar-stats"><span><strong>{radar.metrics.analyzedComments}</strong> analisados</span><span><strong>{radar.metrics.openQuestions}</strong> perguntas</span><span><strong>{radar.metrics.contentRequests}</strong> ideias</span></div><Link className="button button-secondary" href="/radar">Abrir Radar <ArrowRight size={15} /></Link></Card>
    <section className="dashboard-columns">
      <Card className="panel"><div className="panel-head"><div><p className="eyebrow">Operação</p><h2>Automações</h2></div><Link href="/automations">Ver todas</Link></div><div className="list-stack">{automations.slice(0, 4).map((item) => <Link className="automation-row" href={`/automations/${item.id}`} key={item.id}><div className="reel-mark"><Bolt size={17} /></div><div><strong>{item.name}</strong><span>“{item.keyword}” · atualização {formatDate(item.updatedAt)}</span></div><StatusBadge status={item.status} /></Link>)}</div></Card>
      <Card className="panel"><div className="panel-head"><div><p className="eyebrow">Agora</p><h2>Últimas execuções</h2></div><Link href="/history">Histórico</Link></div><div className="timeline">{runs.slice(0, 5).map((run) => <div className="timeline-item" key={run.id}><span className={`timeline-dot timeline-${run.status}`} /><div><strong>@{run.commenterUsername}</strong><span>{run.automationName}</span></div><StatusBadge status={run.status} /></div>)}</div></Card>
    </section>
    <section className="health-strip"><div><UsersRound size={18} /><span><strong>{metrics.eligibleRecipients}</strong> destinatários elegíveis</span></div><div><TriangleAlert size={18} /><span><strong>{metrics.failures}</strong> execuções pedem atenção</span></div><div><span className="pulse" /><span>Último evento: <strong>{formatDate(metrics.lastRunAt)}</strong></span></div></section>
  </div>;
}
