import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { requireOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireOwner();
  return <AppShell>{children}</AppShell>;
}
