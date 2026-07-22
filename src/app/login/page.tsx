import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "@/features/auth/login-form";
import { env, isDemoMode } from "@/lib/env";

export const metadata = { title: "Entrar" };

export default function LoginPage() {
  return <main className="login-page"><section className="login-story"><BrandLogo href="/" inverse /><div><p className="eyebrow">Comentário → conversa</p><h1>Menos tarefas repetidas. Mais gente chegando ao lugar certo.</h1><p>Uma ferramenta focada para responder comentários e entregar seu produto no direct.</p></div><blockquote>“A automação deve parecer uma boa conversa — só que no instante certo.”</blockquote></section><section className="login-panel"><div><p className="eyebrow">Acesso privado</p><h2>Entre no seu painel</h2><p>Você receberá um magic link. Não usamos senha.</p><LoginForm defaultEmail={isDemoMode ? env.OWNER_EMAIL : ""} />{isDemoMode && <Link href="/dashboard" className="demo-login">Continuar no modo demonstração</Link>}</div></section></main>;
}
