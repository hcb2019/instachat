import Link from "next/link";
import { AtSign, BarChart3, Bolt, BookOpenCheck, Clapperboard, History, Radar, Settings2 } from "lucide-react";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { isDemoMode } from "@/lib/env";

const nav = [
  { href: "/dashboard", label: "Visão geral", icon: BarChart3 },
  { href: "/radar", label: "Radar", icon: Radar },
  { href: "/studio", label: "Estúdio", icon: Clapperboard },
  { href: "/connection-guide", label: "Guia de conexão", icon: BookOpenCheck },
  { href: "/automations", label: "Automações", icon: Bolt },
  { href: "/history", label: "Histórico", icon: History },
  { href: "/settings", label: "Integração", icon: Settings2 },
];

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="app-shell">
    <aside className="sidebar">
      <BrandLogo />
      <nav aria-label="Navegação principal">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href}><Icon size={18} /><span>{label}</span></Link>)}</nav>
      <div className="sidebar-foot"><div className="account-avatar"><AtSign size={16} /></div><div><strong>{isDemoMode ? "instachat.demo" : "Instagram"}</strong><span>{isDemoMode ? "Modo demonstração" : "Conta profissional"}</span></div></div>
    </aside>
    <main className="main-content">{isDemoMode && <div className="demo-banner"><span>Modo demonstração</span><p>Dados simulados — nenhuma mensagem será enviada.</p></div>}{children}</main>
  </div>;
}
