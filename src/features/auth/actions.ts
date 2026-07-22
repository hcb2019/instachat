"use server";

import { headers } from "next/headers";
import { env, isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthActionState { message?: string; error?: string }

export async function requestMagicLink(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLocaleLowerCase();
  if (email !== env.OWNER_EMAIL.toLocaleLowerCase()) return { error: "Este acesso é restrito ao proprietário." };
  if (isDemoMode) return { message: "Modo demonstração ativo. Acesse o painel diretamente." };
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  if (origin !== env.APP_ORIGIN) return { error: "Origem da solicitação inválida." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${env.APP_ORIGIN}/auth/callback` } });
  return error ? { error: "Não foi possível enviar o link agora." } : { message: "Enviamos um link seguro para o seu e-mail." };
}
