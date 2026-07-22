"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return <html lang="pt-BR"><body><main className="empty-state"><h1>Algo saiu do fluxo.</h1><p>O erro foi registrado sem expor dados pessoais.</p><button className="button button-primary" onClick={reset}>Tentar novamente</button></main></body></html>;
}
