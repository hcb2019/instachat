import { Badge } from "@/components/ui";
import type { AutomationStatus, ConnectionStatus, RunStatus, StepStatus } from "@/types/domain";

const labels: Record<AutomationStatus | ConnectionStatus | RunStatus | StepStatus, string> = {
  disconnected: "Desconectada", connected: "Conectada", expiring: "Expirando", expired: "Expirada", error: "Erro",
  draft: "Rascunho", active: "Ativa", paused: "Pausada", deleted: "Excluída",
  queued: "Na fila", processing: "Processando", succeeded: "Concluída", partial: "Parcial", failed: "Falhou", ambiguous: "A confirmar",
  pending: "Pendente", skipped: "Ignorada",
};

export function StatusBadge({ status }: { status: keyof typeof labels }) {
  const tone = ["connected", "active", "succeeded"].includes(status) ? "success" : ["expiring", "paused", "partial", "ambiguous", "pending", "queued", "processing"].includes(status) ? "warning" : ["error", "expired", "failed"].includes(status) ? "danger" : "neutral";
  return <Badge tone={tone}>{labels[status]}</Badge>;
}
