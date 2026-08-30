import { describe, expect, it } from "vitest";
import { CODE_CATALOG, filterCodeCatalog } from "./code-catalog";

describe("filterCodeCatalog", () => {
  it("keeps the researched catalogue complete", () => {
    expect(CODE_CATALOG).toHaveLength(281);
  });

  it("keeps a distinct, code-specific explanation for every entry", () => {
    const descriptions = CODE_CATALOG.map((item) => item.description);
    expect(new Set(descriptions).size).toBe(CODE_CATALOG.length);
    expect(descriptions).not.toContain("Cria uma variação visual ou transformação criativa.");
    expect(descriptions).not.toContain("Cria ou muda fundo, ambiente e cenário.");
    expect(descriptions).not.toContain("Melhora a qualidade, nitidez ou realismo.");
  });

  it("finds a code whether the slash is present or not", () => {
    expect(filterCodeCatalog(CODE_CATALOG, { query: "hdreal", category: "Todos" }).map((item) => item.code)).toContain("/HDREAL");
    expect(filterCodeCatalog(CODE_CATALOG, { query: "/HDREAL", category: "Todos" }).map((item) => item.code)).toContain("/HDREAL");
  });

  it("searches the concise Portuguese description", () => {
    expect(filterCodeCatalog(CODE_CATALOG, { query: "definição", category: "Todos" }).map((item) => item.code)).toContain("/HDREAL");
  });

  it("limits results to the selected category", () => {
    const results = filterCodeCatalog(CODE_CATALOG, { query: "", category: "Fundos e cenários" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.category === "Fundos e cenários")).toBe(true);
  });

  it("returns no result for an unknown search", () => {
    expect(filterCodeCatalog(CODE_CATALOG, { query: "naoexistecodigo", category: "Todos" })).toEqual([]);
  });
});
