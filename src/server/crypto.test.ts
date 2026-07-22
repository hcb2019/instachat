import { describe, expect, it } from "vitest";
import { createTrackingToken, decryptSecret, encryptSecret, hashTrackingToken } from "@/server/crypto";

describe("secret encryption", () => {
  it("round-trips with authenticated encryption", () => {
    const encrypted = encryptSecret("access-token-sensitive");
    expect(encrypted.ciphertext).not.toContain("access-token-sensitive");
    expect(decryptSecret(encrypted)).toBe("access-token-sensitive");
  });

  it("rejects tampered ciphertext", () => {
    const encrypted = encryptSecret("secret");
    expect(() => decryptSecret({ ...encrypted, tag: Buffer.alloc(16).toString("base64") })).toThrow();
  });

  it("creates opaque one-way tracking tokens", () => {
    const value = createTrackingToken();
    expect(value.token).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(value.hash).toBe(hashTrackingToken(value.token));
    expect(value.hash).toHaveLength(64);
  });
});
