import "server-only";
import { isDemoMode } from "@/lib/env";
import { MetaInstagramGateway } from "@/server/instagram/meta-gateway";
import { MockInstagramGateway } from "@/server/instagram/mock-gateway";

export function instagramGateway() {
  return isDemoMode ? new MockInstagramGateway() : new MetaInstagramGateway();
}
