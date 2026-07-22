"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { deleteAutomation } from "@/features/automations/actions";

export function DeleteAutomationButton({ id }: { id: string }) {
  return (
    <form
      action={deleteAutomation}
      onSubmit={(event) => {
        if (!window.confirm("Excluir esta automação? O histórico será preservado.")) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button variant="danger"><Trash2 size={15} /> Excluir</Button>
    </form>
  );
}
