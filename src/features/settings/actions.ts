"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPipelineApiKeySecret } from "@/server/pipeline";

export interface PipelineApiKeyActionState {
  error?: string;
  secret?: string;
  prefix?: string;
}

function hashApiKey(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

export async function createPipelineApiKey(_state: PipelineApiKeyActionState, formData: FormData): Promise<PipelineApiKeyActionState> {
  const owner = await requireOwner();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 80) return { error: "Informe um nome entre 2 e 80 caracteres." };
  const secret = createPipelineApiKeySecret();
  const prefix = secret.slice(0, 12);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("pipeline_api_keys").insert({
    owner_id: owner.id,
    name,
    key_hash: hashApiKey(secret),
    prefix,
  });
  if (error) return { error: "Não foi possível criar a chave. Rode a migration do pipeline antes de usar este recurso." };
  revalidatePath("/settings");
  return { secret, prefix };
}

export async function revokePipelineApiKey(formData: FormData) {
  await requireOwner();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("pipeline_api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/settings");
}
