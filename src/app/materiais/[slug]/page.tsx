import { notFound } from "next/navigation";
import { BookOpenCheck, Check } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/env";
import { demoStore } from "@/server/demo-store";
import type { GeneratedDeliverable } from "@/types/content-studio";
import { MaterialActions } from "@/features/content-studio/material-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Material · InstaChat", robots: { index: false, follow: false } };

export default async function PublicMaterialPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params; let material: GeneratedDeliverable|null=null;
  if(isDemoMode){material=demoStore().contentProjects.find((item)=>item.deliverableSlug===slug)?.contentPackage?.deliverable??null;}
  else {const supabase=createSupabaseAdminClient(); const {data}=await supabase.rpc("get_public_deliverable",{slug_value:slug}); const row=data?.[0]; material=(row?.content as GeneratedDeliverable|undefined)??null;}
  if(!material) notFound();
  return <main className="material-page"><MaterialActions/><article className="material-document"><header><div className="material-brand"><span><BookOpenCheck size={20}/></span> InstaChat</div><p>Material prático</p><h1>{material.title}</h1><strong>{material.summary}</strong></header><p className="material-intro">{material.introduction}</p>{material.sections.map((section,index)=><section key={section.heading}><span>0{index+1}</span><h2>{section.heading}</h2>{section.body&&<p>{section.body}</p>}{section.items.length>0&&<ul>{section.items.map((item)=><li key={item}><Check size={15}/><span>{item}</span></li>)}</ul>}</section>)}<footer><p>{material.closing}</p><small>Criado com InstaChat</small></footer></article></main>;
}
