import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "@/lib/env";
import { MetaInstagramGateway } from "@/server/instagram/meta-gateway";

const originalAppId = env.META_APP_ID;
const originalAppSecret = env.META_APP_SECRET;

afterEach(() => {
  env.META_APP_ID = originalAppId;
  env.META_APP_SECRET = originalAppSecret;
  vi.unstubAllGlobals();
});

describe("MetaInstagramGateway token lifecycle", () => {
  it("troca o token curto por um token de longa duração no OAuth", async () => {
    env.META_APP_ID = "instagram-app-id";
    env.META_APP_SECRET = "instagram-app-secret";
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        access_token: "short-lived-token",
        user_id: 123,
        permissions: ["instagram_business_basic"],
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        access_token: "long-lived-token",
        token_type: "bearer",
        expires_in: 5_184_000,
      }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new MetaInstagramGateway().exchangeCode(
      "oauth-code",
      "https://example.com/api/meta/oauth/callback",
    );

    expect(result.accessToken).toBe("long-lived-token");
    expect(result.expiresIn).toBe(5_184_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const exchangeUrl = fetchMock.mock.calls[1]?.[0] as URL;
    expect(exchangeUrl.origin + exchangeUrl.pathname).toBe("https://graph.instagram.com/access_token");
    expect(exchangeUrl.searchParams.get("grant_type")).toBe("ig_exchange_token");
    expect(exchangeUrl.searchParams.get("access_token")).toBe("short-lived-token");
  });

  it("renova o token de longa duração antes do vencimento", async () => {
    env.META_APP_SECRET = "instagram-app-secret";
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      access_token: "renewed-token",
      expires_in: 5_184_000,
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new MetaInstagramGateway().renewAccessToken("current-long-token");

    expect(result).toEqual({ accessToken: "renewed-token", expiresIn: 5_184_000 });
    const refreshUrl = fetchMock.mock.calls[0]?.[0] as URL;
    expect(refreshUrl.origin + refreshUrl.pathname).toBe("https://graph.instagram.com/refresh_access_token");
    expect(refreshUrl.searchParams.get("grant_type")).toBe("ig_refresh_token");
    expect(refreshUrl.searchParams.get("access_token")).toBe("current-long-token");
  });
});
