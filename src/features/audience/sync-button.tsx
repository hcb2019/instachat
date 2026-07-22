"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

export function SyncAudienceButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function sync() {
    setState("loading");
    try {
      const response = await fetch("/api/meta/audience/sync", { method: "POST" });
      if (!response.ok) throw new Error("sync_failed");
      setState("done");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  return <div className="radar-sync">
    <Button variant="secondary" onClick={sync} disabled={state === "loading"}>
      <RefreshCw size={15} className={state === "loading" ? "spin" : ""} />
      {state === "loading" ? "Atualizando…" : "Atualizar dados"}
    </Button>
    <span aria-live="polite">{state === "done" ? "Dados atualizados." : state === "error" ? "Não foi possível atualizar." : ""}</span>
  </div>;
}
