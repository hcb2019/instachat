import { describe, expect, it } from "vitest";
import { ensureDatabaseWrite } from "@/lib/persistence";

describe("ensureDatabaseWrite", () => {
  it("stops the content flow when Supabase rejects an essential write", () => {
    expect(() => ensureDatabaseWrite({ message: "permission denied" }, "salvar o pacote")).toThrow("Não foi possível salvar o pacote.");
  });

  it("allows the flow when Supabase confirms the write", () => {
    expect(() => ensureDatabaseWrite(null, "salvar o pacote")).not.toThrow();
  });
});
