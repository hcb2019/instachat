import { describe, expect, it, vi } from "vitest";
import { MEDIA_AUTO_SYNC_STALE_MS, isMediaSyncStale } from "@/server/instagram/media-sync";

describe("Instagram media sync throttling", () => {
  it("detecta sincronização vencida e preserva sincronização recente", () => {
    vi.useFakeTimers();
    const now = new Date("2026-10-18T19:00:00.000Z");
    vi.setSystemTime(now);
    expect(isMediaSyncStale(null)).toBe(true);
    expect(isMediaSyncStale(new Date(now.getTime() - MEDIA_AUTO_SYNC_STALE_MS - 1).toISOString())).toBe(true);
    expect(isMediaSyncStale(new Date(now.getTime() - MEDIA_AUTO_SYNC_STALE_MS + 1).toISOString())).toBe(false);
    vi.useRealTimers();
  });
});
