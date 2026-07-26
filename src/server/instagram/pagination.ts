export function normalizeMetaPagingPath(next: string, apiVersion: string) {
  const url = new URL(next);
  if (url.protocol !== "https:" || url.hostname !== "graph.instagram.com") {
    throw new Error("URL de paginação da Meta inválida.");
  }

  const versionPrefix = `/${apiVersion}`;
  const pathname = url.pathname === versionPrefix
    ? "/"
    : url.pathname.startsWith(`${versionPrefix}/`)
      ? url.pathname.slice(versionPrefix.length)
      : url.pathname;

  return `${pathname}${url.search}`;
}
