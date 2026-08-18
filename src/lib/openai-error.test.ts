import { describe, expect, it } from "vitest";
import { getOpenAIErrorDetails, getStudioGenerationError, hasValidOpenAIKeyShape } from "@/lib/openai-error";

describe("OpenAI diagnostics", () => {
  it("detects placeholder values before sending a request", () => {
    expect(hasValidOpenAIKeyShape("sua-chave")).toBe(false);
    expect(hasValidOpenAIKeyShape("sk-proj-abcdefghijklmnopqrstuvwxyz")).toBe(true);
  });

  it("returns an actionable message for an invalid key", () => {
    expect(getStudioGenerationError({ status: 401, code: "invalid_api_key" })).toContain("OPENAI_API_KEY");
  });

  it("does not include the provider message or a secret in safe details", () => {
    const details = getOpenAIErrorDetails({
      status: 401,
      code: "invalid_api_key",
      type: "invalid_request_error",
      message: "Incorrect API key: sk-secret-value",
    });
    expect(details).toEqual({ status: 401, code: "invalid_api_key", type: "invalid_request_error", name: null });
    expect(JSON.stringify(details)).not.toContain("sk-secret-value");
  });
});
