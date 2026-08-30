"use client";

import { Check, Copy, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { CODE_CATEGORIES, CODE_CATALOG, filterCodeCatalog, type CodeCategory } from "./code-catalog";

const PAGE_SIZE = 24;

export function CodeDirectory({ writeToClipboard = (code: string) => window.navigator.clipboard.writeText(code) }: { writeToClipboard?: (code: string) => Promise<void> | void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CodeCategory>("Todos");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const results = useMemo(() => filterCodeCatalog(CODE_CATALOG, { query, category }), [category, query]);
  const visibleResults = results.slice(0, visibleCount);

  function chooseCategory(nextCategory: CodeCategory) {
    setCategory(nextCategory);
    setVisibleCount(PAGE_SIZE);
  }

  function changeQuery(nextQuery: string) {
    setQuery(nextQuery);
    setVisibleCount(PAGE_SIZE);
  }

  async function copyCode(code: string) {
    try {
      await writeToClipboard(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode((current) => (current === code ? null : current)), 1800);
    } catch {
      setCopiedCode(null);
    }
  }

  return (
    <main className="code-library">
      <section className="code-library-hero" aria-labelledby="code-library-title">
        <div className="code-library-hero-mark" aria-hidden="true">/</div>
        <p className="eyebrow">Biblioteca gratuita de criação visual</p>
        <h1 id="code-library-title">Seu próximo resultado começa com <em>/</em></h1>
        <p className="code-library-intro">Encontre códigos curtos para melhorar fotos, mudar estilos, criar cenários e transformar ideias em visuais.</p>
        <dl className="code-library-stats">
          <div><dt>{CODE_CATALOG.length}</dt><dd>códigos</dd></div>
          <div><dt>{CODE_CATEGORIES.length - 1}</dt><dd>categorias</dd></div>
          <div><dt>1 clique</dt><dd>para copiar</dd></div>
        </dl>
      </section>

      <section className="code-library-how" aria-label="Como usar">
        <article><span>01</span><div><strong>Escolha</strong><p>Encontre o resultado visual que você quer.</p></div></article>
        <article><span>02</span><div><strong>Copie</strong><p>Leve somente o código que precisa.</p></div></article>
        <article><span>03</span><div><strong>Crie</strong><p>Use o código junto da sua ideia ou imagem.</p></div></article>
      </section>

      <section className="code-library-directory" aria-labelledby="directory-title">
        <div className="code-library-search-wrap">
          <Search aria-hidden="true" size={19} />
          <label className="sr-only" htmlFor="code-search">Buscar códigos</label>
          <input id="code-search" type="search" value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="Buscar por código ou pelo que você quer criar" />
        </div>
        <div className="code-library-filters" aria-label="Filtrar por categoria">
          {CODE_CATEGORIES.map((item) => <button type="button" key={item} onClick={() => chooseCategory(item)} className={category === item ? "is-active" : ""} aria-pressed={category === item}>{item}</button>)}
        </div>
        <div className="code-library-results-head">
          <div><p className="eyebrow">Diretório completo</p><h2 id="directory-title">{results.length} códigos</h2></div>
          <p>{category === "Todos" ? "Todos os resultados" : category}</p>
        </div>

        {results.length ? <>
          <div className="code-library-grid" role="list">
            {visibleResults.map((item) => <article className="code-library-card" role="listitem" key={item.code}>
              <header><code>{item.code}</code><span>{item.category}</span></header>
              <p>{item.description}</p>
              <button type="button" onClick={() => copyCode(item.code)} aria-label={`Copiar ${item.code}`}>
                {copiedCode === item.code ? <><Check size={14} aria-hidden="true" /> Código copiado</> : <><Copy size={14} aria-hidden="true" /> Copiar {item.code}</>}
              </button>
            </article>)}
          </div>
          {visibleCount < results.length && <button type="button" className="code-library-more" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}><Sparkles size={16} aria-hidden="true" /> Mostrar mais códigos</button>}
        </> : <section className="code-library-empty" aria-live="polite"><Sparkles size={26} aria-hidden="true" /><h2>Nenhum código encontrado</h2><p>Tente outro termo ou volte para todas as categorias.</p><button type="button" onClick={() => { setQuery(""); chooseCategory("Todos"); }}>Limpar filtros</button></section>}
      </section>
    </main>
  );
}
