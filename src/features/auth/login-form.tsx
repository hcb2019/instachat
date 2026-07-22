"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { requestMagicLink, type AuthActionState } from "@/features/auth/actions";
import { Button } from "@/components/ui";

export function LoginForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, action, pending] = useActionState<AuthActionState, FormData>(requestMagicLink, {});
  return <form action={action} className="login-form"><label><span>E-mail do proprietário</span><input type="email" name="email" defaultValue={defaultEmail} required autoComplete="email" /></label>{state.error && <p className="form-alert" role="alert">{state.error}</p>}{state.message && <p className="form-success" role="status">{state.message}</p>}<Button disabled={pending}>{pending ? "Enviando…" : "Receber link seguro"}<ArrowRight size={16} /></Button></form>;
}
