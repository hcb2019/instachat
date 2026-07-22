import { AutomationForm } from "@/features/automations/automation-form";
import { listMedia } from "@/server/data";

export const metadata = { title: "Nova automação" };

export default async function NewAutomationPage() {
  const media = await listMedia();
  return <div className="page-shell"><header className="page-header compact"><div><p className="eyebrow">Nova automação</p><h1>Do comentário ao direct.</h1><p>Configure um fluxo linear, previsível e fácil de medir.</p></div></header><AutomationForm media={media} /></div>;
}
