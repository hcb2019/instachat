import { describe, expect, it } from "vitest";
import { dynamic } from "./page";

describe("CommandsPage delivery mode", () => {
  it("renders dynamically so Next can attach the request CSP nonce to client scripts", () => {
    expect(dynamic).toBe("force-dynamic");
  });
});
