import "server-only";
import { redirect } from "next/navigation";
import { env, isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface Owner {
  id: string;
  email: string;
}

export async function getOwner(): Promise<Owner | null> {
  if (isDemoMode) return { id: "00000000-0000-4000-8000-000000000001", email: env.OWNER_EMAIL };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || data.user.email?.toLocaleLowerCase() !== env.OWNER_EMAIL.toLocaleLowerCase()) return null;
  return { id: data.user.id, email: data.user.email };
}

export async function requireOwner() {
  const owner = await getOwner();
  if (!owner) redirect("/login");
  return owner;
}
