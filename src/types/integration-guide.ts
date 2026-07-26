import type { LucideIcon } from "lucide-react";

export interface IntegrationGuideStep {
  id: string;
  number: string;
  phase: "prepare" | "meta" | "instachat" | "validate" | "publish";
  title: string;
  summary: string;
  duration: string;
  location: string;
  tasks: string[];
  checks: string[];
  warning?: string;
  action: { label: string; href: string; external?: boolean };
  reference?: { label: string; href: string };
  illustration: "account" | "app" | "oauth" | "webhook" | "environment" | "connect" | "test" | "review";
}

export interface GuideRequirement {
  label: string;
  detail: string;
  icon: LucideIcon;
}
