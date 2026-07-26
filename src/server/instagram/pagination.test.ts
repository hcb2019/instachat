import { describe, expect, it } from "vitest";
import { normalizeMetaPagingPath } from "./pagination";

describe("normalizeMetaPagingPath", () => {
  it("remove a versão já presente antes da próxima chamada", () => {
    expect(normalizeMetaPagingPath(
      "https://graph.instagram.com/v25.0/17841400000000000/media?after=cursor",
      "v25.0",
    )).toBe("/17841400000000000/media?after=cursor");
  });

  it("preserva URLs de paginação sem a versão no caminho", () => {
    expect(normalizeMetaPagingPath(
      "https://graph.instagram.com/17841400000000000/comments?after=cursor",
      "v25.0",
    )).toBe("/17841400000000000/comments?after=cursor");
  });

  it("rejeita paginação enviada por outro domínio", () => {
    expect(() => normalizeMetaPagingPath(
      "https://example.com/v25.0/17841400000000000/media?access_token=secret",
      "v25.0",
    )).toThrow("URL de paginação da Meta inválida.");
  });
});
