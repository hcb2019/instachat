import "server-only";
import { requireOwner } from "@/lib/auth";
import { contentPackageSchema, parseStoredContentConcepts } from "@/lib/content-studio";
import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { demoStore } from "@/server/demo-store";
import type { ContentProject, CreatorProfile } from "@/types/content-studio";

export const DEFAULT_CREATOR_PROFILE: CreatorProfile = {
  instagramHandle: "@hernando.ia",
  niche: "Inteligência artificial aplicada a negócios e à vida cotidiana",
  audience: "Pequenos empresários, profissionais autônomos e criadores que querem começar a usar IA",
  voice: "Direto, conversado, informal e específico",
  preferredTerms: [], avoidedTerms: [],
  defaultCta: "Comente a palavra-chave para receber o material no direct.",
};

function mapProfile(row: Record<string, unknown> | null): CreatorProfile {
  if (!row) return DEFAULT_CREATOR_PROFILE;
  return { instagramHandle: String(row.instagram_handle), niche: String(row.niche), audience: String(row.audience), voice: String(row.voice), preferredTerms: (row.preferred_terms as string[]) ?? [], avoidedTerms: (row.avoided_terms as string[]) ?? [], defaultCta: String(row.default_cta) };
}

function mapProject(row: Record<string, unknown>, slug: string | null = null): ContentProject {
  const concepts = parseStoredContentConcepts(row.concepts);
  const contentPackage = contentPackageSchema.safeParse(row.content_package);
  return {
    id: String(row.id), ownerId: String(row.owner_id), sourceInsightId: row.source_insight_id ? String(row.source_insight_id) : null,
    title: String(row.title), topic: String(row.topic), pillar: row.pillar as ContentProject["pillar"], primaryGoal: row.primary_goal as ContentProject["primaryGoal"], secondaryGoal: row.secondary_goal as ContentProject["secondaryGoal"], hookIntensity: row.hook_intensity as ContentProject["hookIntensity"], deliverableType: row.deliverable_type as ContentProject["deliverableType"], notes: String(row.notes ?? ""), status: row.status as ContentProject["status"], concepts, selectedConceptIndex: row.selected_concept_index === null ? null : Number(row.selected_concept_index), contentPackage: contentPackage.success ? contentPackage.data : null, mediaId: row.media_id ? String(row.media_id) : null, automationId: row.automation_id ? String(row.automation_id) : null, deliverableSlug: slug, createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

function getDeliverableSlug(relation: unknown): string | null {
  const item = Array.isArray(relation) ? relation[0] : relation;
  if (!item || typeof item !== "object" || !("public_slug" in item)) return null;
  const slug = (item as { public_slug?: unknown }).public_slug;
  return typeof slug === "string" ? slug : null;
}

export async function getCreatorProfile() {
  const owner = await requireOwner();
  if (isDemoMode) return demoStore().creatorProfile;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("creator_profiles").select("*").eq("owner_id", owner.id).maybeSingle();
  return mapProfile(data);
}

export async function listContentProjects(): Promise<ContentProject[]> {
  const owner = await requireOwner();
  if (isDemoMode) return demoStore().contentProjects;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("content_projects").select("*,deliverables(public_slug)").eq("owner_id", owner.id).order("updated_at", { ascending: false });
  return (data ?? []).map((row) => mapProject(row, getDeliverableSlug(row.deliverables)));
}

export async function getContentProject(id: string): Promise<ContentProject | null> {
  const owner = await requireOwner();
  if (isDemoMode) return demoStore().contentProjects.find((item) => item.id === id) ?? null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("content_projects").select("*,deliverables(public_slug)").eq("id", id).eq("owner_id", owner.id).maybeSingle();
  return data ? mapProject(data, getDeliverableSlug(data.deliverables)) : null;
}
