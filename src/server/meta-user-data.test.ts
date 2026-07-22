import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyMetaSignedRequest } from "@/server/meta-user-data";

function base64Url(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function signedRequest(payload: Record<string, unknown>, secret = "demo-meta-secret") {
  const encoded = base64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", secret).update(encoded).digest();
  return `${base64Url(signature)}.${encoded}`;
}

describe("solicitações assinadas da Meta", () => {
  it("aceita somente HMAC-SHA256 válido com user_id", () => {
    expect(verifyMetaSignedRequest(signedRequest({ algorithm: "HMAC-SHA256", user_id: "17841400001", issued_at: 1_789_000_000 }))).toMatchObject({ user_id: "17841400001" });
  });

  it("rejeita assinatura, algoritmo e payload inválidos", () => {
    expect(verifyMetaSignedRequest(signedRequest({ algorithm: "HMAC-SHA256", user_id: "17841400001" }, "wrong-secret"))).toBeNull();
    expect(verifyMetaSignedRequest(signedRequest({ algorithm: "none", user_id: "17841400001" }))).toBeNull();
    expect(verifyMetaSignedRequest("invalid")).toBeNull();
  });
});
