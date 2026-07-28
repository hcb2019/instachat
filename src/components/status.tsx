import { Badge } from "@/components/ui";
import type { AutomationStatus, ConnectionStatus, FollowGateStatus, RunStatus, StepStatus } from "@/types/domain";

const labels: Record<AutomationStatus | ConnectionStatus | FollowGateStatus | RunStatus | StepStatus, string> = {
  disconnected: "Desconectada", connected: "Conectada", expiring: "Expirando", expired: "Expirada", error: "Erro",
  draft: "Rascunho", active: "Ativa", paused: "Pausada", deleted: "Excluída",
  queued: "Na fila", processing: "Processando", succeeded: "Concluída", partial: "Parcial", failed: "Falhou", ambiguous: "A confirmar",
  pending: "Pendente", skipped: "Ignorada",
  not_required: "Sem confirmação", awaiting_reply: "Aguardando PRONTO", not_following: "Ainda não segue", verified: "Seguidor confirmado",
};

export function StatusBadge({ status }: { status: keyof typeof labels }) {
  const tone = ["connected", "active", "succeeded", "verified"].includes(status) ? "success" : ["expiring", "paused", "partial", "ambiguous", "pending", "queued", "processing", "awaiting_reply", "not_following"].includes(status) ? "warning" : ["error", "expired", "failed"].includes(status) ? "danger" : "neutral";
  return <Badge tone={tone}>{labels[status]}</Badge>;
}
