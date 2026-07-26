import "server-only";
import { env } from "@/lib/env";
import type { InstagramGateway, InstagramTokenResult } from "@/server/instagram/types";
import { normalizeMetaPagingPath } from "@/server/instagram/pagination";

export class MetaApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string, readonly retryAfter?: number, readonly ambiguous = false) { super(message); }
  get transient() { return this.status === 429 || this.status >= 500; }
}

function safeMetaMessage(message?: string) {
  if (!message) return "A Meta rejeitou a solicitação.";
  return message
    .replace(/access[_ -]?token[=: ]+\S+/gi, "access token [oculto]")
    .replace(/[A-Za-z0-9_-]{80,}/g, "[dado oculto]")
    .slice(0, 300);
}

type MetaFetchOptions = RequestInit & { accessToken?: string; unversioned?: boolean };

async function metaFetch<T>(path: string, options: MetaFetchOptions, attempt = 1): Promise<T> {
  const { accessToken, unversioned = false, ...init } = options;
  const endpoint = unversioned
    ? `https://graph.instagram.com${path}`
    : `https://graph.instagram.com/${env.META_GRAPH_API_VERSION}${path}`;
  const response = await fetch(endpoint, {
    ...init,
    redirect: "error",
    signal: AbortSignal.timeout(12_000),
    headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...init.headers },
  }).catch((cause) => { throw new MetaApiError(cause instanceof Error && cause.name === "TimeoutError" ? "Tempo limite da Meta excedido." : "Meta indisponível.", 0, "NETWORK", undefined, true); });
  if (response.ok) return await response.json() as T;
  const retryAfter = Number(response.headers.get("retry-after") ?? 0) || undefined;
  const body = await response.json().catch(() => ({})) as { error?: { message?: string; code?: number } };
  const error = new MetaApiError(safeMetaMessage(body.error?.message), response.status, String(body.error?.code ?? "HTTP_ERROR"), retryAfter);
  if (error.transient && attempt < 3) {
    const delay = Math.min((retryAfter ?? 2 ** attempt) * 1000 + Math.random() * 250, 10_000);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return metaFetch<T>(path, options, attempt + 1);
  }
  throw error;
}

function isUnsupportedMediaEdge(error: unknown) {
  return error instanceof MetaApiError
    && error.code === "2500"
    && error.message.toLowerCase().includes("path components")
    && error.message.toLowerCase().includes("/media");
}

type MetaMediaItem = {
  id: string;
  caption?: string;
  media_product_type?: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
};

function mapReels(data: MetaMediaItem[]) {
  return data
    .filter((item) => item.media_product_type === "REELS")
    .map((item) => ({
      externalId: item.id,
      caption: item.caption ?? "Reel sem legenda",
      permalink: item.permalink,
      thumbnailUrl: item.thumbnail_url ?? null,
      publishedAt: item.timestamp,
    }));
}

async function listReelsFromExpandedProfile(accessToken: string) {
  const mediaFields = "id,caption,media_product_type,media_type,permalink,thumbnail_url,timestamp";
  const fields = encodeURIComponent(`media.limit(50){${mediaFields}}`);
  let data: { media?: { data?: MetaMediaItem[] } };
  try {
    data = await metaFetch(`/me?fields=${fields}`, { accessToken });
  } catch (error) {
    if (!isUnsupportedMediaEdge(error)) throw error;
    data = await metaFetch(`/me?fields=${fields}`, { accessToken, unversioned: true });
  }
  return mapReels(data.media?.data ?? []);
}

export class MetaInstagramGateway implements InstagramGateway {
  async exchangeCode(code: string, redirectUri: string): Promise<InstagramTokenResult> {
    if (!env.META_APP_ID || !env.META_APP_SECRET) throw new Error("Meta não configurada.");
    const body = new URLSearchParams({ client_id: env.META_APP_ID, client_secret: env.META_APP_SECRET, grant_type: "authorization_code", redirect_uri: redirectUri, code });
    const response = await fetch("https://api.instagram.com/oauth/access_token", { method: "POST", body, redirect: "error", signal: AbortSignal.timeout(12_000) });
    if (!response.ok) throw new MetaApiError("Não foi possível concluir o OAuth.", response.status);
    const data = await response.json() as { access_token: string; user_id: number; expires_in?: number; permissions?: string[] };
    return {
      accessToken: data.access_token,
      userId: String(data.user_id),
      expiresIn: data.expires_in ?? null,
      permissions: Array.isArray(data.permissions) ? data.permissions : null,
    };
  }

  getProfile(accessToken: string) {
    return metaFetch<{ id: string; username: string }>("/me?fields=id,username", { accessToken }).then((data) => ({ userId: data.id, username: data.username }));
  }

  async subscribeToComments(userId: string, accessToken: string) {
    await metaFetch(`/${encodeURIComponent(userId)}/subscribed_apps?subscribed_fields=comments`, { method: "POST", accessToken });
  }

  async hasCommentSubscription(userId: string, accessToken: string) {
    const result = await metaFetch<{ data?: Array<{ subscribed_fields?: string[] }> }>(
      `/${encodeURIComponent(userId)}/subscribed_apps`,
      { method: "GET", accessToken },
    );
    return (result.data ?? []).some((subscription) => subscription.subscribed_fields?.includes("comments"));
  }

  async listReels(_userId: string, accessToken: string) {
    const items: Array<{ externalId: string; caption: string; permalink: string; thumbnailUrl: string | null; publishedAt: string }> = [];
    // Instagram Login resolves the authenticated professional account through
    // "me". An explicit account ID on graph.instagram.com can be interpreted as
    // an object without the media edge and returns Meta error 2500.
    let path: string | null = "/me/media?fields=id,caption,media_product_type,media_type,permalink,thumbnail_url,timestamp&limit=50";
    let unversioned = false;
    while (path && items.length < 250) {
      let data: { data: MetaMediaItem[]; paging?: { next?: string } };
      try {
        data = await metaFetch(path, { accessToken, unversioned });
      } catch (error) {
        if (unversioned || items.length > 0 || !isUnsupportedMediaEdge(error)) throw error;
        unversioned = true;
        try {
          data = await metaFetch(path, { accessToken, unversioned: true });
        } catch (fallbackError) {
          if (!isUnsupportedMediaEdge(fallbackError)) throw fallbackError;
          return listReelsFromExpandedProfile(accessToken);
        }
      }
      items.push(...mapReels(data.data));
      path = data.paging?.next ? normalizeMetaPagingPath(data.paging.next, env.META_GRAPH_API_VERSION) : null;
    }
    return items;
  }

  async listComments(mediaId: string, accessToken: string, since: Date, limit: number) {
    const items: Array<{ commentId: string; commenterScopedId: string; commenterUsername: string; text: string; publishedAt: string }> = [];
    // Keep this field list identical to Meta's documented request for
    // Instagram API with Instagram Login. The comment ID is returned
    // automatically and some Graph API versions reject extra requested fields.
    let path: string | null = `/${encodeURIComponent(mediaId)}/comments?fields=from%2Ctext&limit=100`;
    while (path && items.length < limit) {
      const data: {
        data: Array<{
          id: string;
          from?: { id?: string; username?: string };
          username?: string;
          text?: string;
          timestamp?: string;
        }>;
        paging?: { next?: string };
      } = await metaFetch(path, { accessToken });
      let accepted = 0;
      for (const item of data.data) {
        const publishedAt = item.timestamp ?? new Date().toISOString();
        if (new Date(publishedAt) < since) return items;
        if (!item.text) continue;

        // Depending on the Instagram Login response and app access level, Meta
        // may omit the commenter's scoped ID while still returning the username.
        // Keep a stable, non-secret deduplication key instead of silently
        // discarding an otherwise valid comment.
        const commenterUsername = item.from?.username?.trim() || item.username?.trim() || "instagram_user";
        const normalizedUsername = commenterUsername.normalize("NFKC").toLocaleLowerCase("en-US");
        const commenterScopedId = item.from?.id
          ?? (normalizedUsername !== "instagram_user" ? `username:${normalizedUsername}` : `comment:${item.id}`);

        items.push({
          commentId: item.id,
          commenterScopedId,
          commenterUsername,
          text: item.text,
          publishedAt,
        });
        accepted += 1;
        if (items.length >= limit) break;
      }
      console.info("Instagram comments page read", {
        received: data.data.length,
        accepted,
      });
      path = data.paging?.next ? normalizeMetaPagingPath(data.paging.next, env.META_GRAPH_API_VERSION) : null;
    }
    return items;
  }

  async getMediaInsights(mediaId: string, accessToken: string) {
    const names = ["comments", "views", "reach", "shares", "saved", "total_interactions"] as const;
    const read = async (metrics: string) => {
      const path = `/${encodeURIComponent(mediaId)}/insights?metric=${metrics}`;
      const data: { data: Array<{ name: string; values?: Array<{ value?: number }>; total_value?: { value?: number } }> } = await metaFetch(path, { accessToken });
      return Object.fromEntries(data.data.map((metric) => [metric.name, Number(metric.total_value?.value ?? metric.values?.[0]?.value ?? 0)]));
    };
    let raw: Record<string, number>;
    try {
      raw = await read(names.join(","));
    } catch (error) {
      if (!(error instanceof MetaApiError) || error.transient) throw error;
      const results = await Promise.allSettled(names.map(async (name) => [name, (await read(name))[name] ?? 0] as const));
      raw = Object.fromEntries(results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []));
    }
    return { comments: raw.comments ?? 0, views: raw.views ?? 0, reach: raw.reach ?? 0, shares: raw.shares ?? 0, saved: raw.saved ?? 0, totalInteractions: raw.total_interactions ?? 0, raw };
  }

  replyToComment(commentId: string, message: string, accessToken: string) {
    return metaFetch<{ id: string }>(`/${encodeURIComponent(commentId)}/replies`, { method: "POST", accessToken, body: JSON.stringify({ message }) });
  }

  sendPrivateReply(userId: string, commentId: string, message: string, accessToken: string) {
    return metaFetch<{ recipient_id: string; message_id: string }>(`/${encodeURIComponent(userId)}/messages`, { method: "POST", accessToken, body: JSON.stringify({ recipient: { comment_id: commentId }, message: { text: message } }) }).then((data) => ({ recipientId: data.recipient_id, messageId: data.message_id }));
  }
}
