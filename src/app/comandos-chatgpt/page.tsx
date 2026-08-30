import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand-logo";
import { CodeDirectory } from "@/features/ai-codes/code-directory";

export const metadata: Metadata = {
  title: "Códigos de IA com /",
  description: "Biblioteca gratuita de códigos curtos para melhorar fotos, criar estilos, mudar cenários e transformar ideias em visuais.",
};

// The proxy generates a per-request CSP nonce. This route contains interactive
// client controls, so it cannot be statically prerendered without that nonce.
export const dynamic = "force-dynamic";

export default function CommandsPage() {
  return (
    <div className="code-library-page">
      <header className="code-library-nav">
        <BrandLogo href="/comandos-chatgpt" />
        <span>Material gratuito para criar melhor</span>
      </header>
      <CodeDirectory />
      <footer className="code-library-footer">
        <BrandLogo href="/comandos-chatgpt" />
        <p>InstaChat não é afiliado à OpenAI.</p>
      </footer>
    </div>
  );
}
