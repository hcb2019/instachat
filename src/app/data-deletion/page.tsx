import Link from "next/link";
import { ArrowLeft, CheckCircle2, Trash2 } from "lucide-react";

export const metadata = { title: "Exclusão de dados — InstaChat" };

export default async function DataDeletionPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  const validCode = typeof code === "string" && /^[0-9a-f]{32}$/.test(code);
  return <main className="legal-page deletion-page"><div className="legal-document"><Link href="/" className="back-link"><ArrowLeft size={14} /> Voltar ao InstaChat</Link><div className={validCode ? "deletion-mark complete" : "deletion-mark"}>{validCode ? <CheckCircle2 size={30} /> : <Trash2 size={30} />}</div><p className="eyebrow">Controle de dados</p><h1>{validCode ? "Exclusão concluída" : "Exclusão de dados"}</h1>{validCode ? <><p>Os dados derivados da conexão com o Instagram foram removidos. Guarde o código abaixo como referência da solicitação.</p><code className="confirmation-code">{code}</code></> : <><p>Para remover os dados, revogue o acesso do InstaChat nas configurações do Instagram/Meta ou use o fluxo de exclusão oferecido pelo aplicativo conectado. A Meta enviará uma solicitação autenticada ao nosso servidor.</p><ol><li>Abra as configurações do Instagram e acesse permissões de sites/aplicativos.</li><li>Localize o aplicativo usado por este deploy do InstaChat.</li><li>Remova o acesso ou solicite a exclusão.</li><li>Os Reels, comentários, execuções, insights e tokens associados serão removidos.</li></ol></>}</div></main>;
}
