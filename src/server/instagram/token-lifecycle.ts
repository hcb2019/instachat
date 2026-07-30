import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { decryptSecret, encryptSecret } from "@/server/crypto";
import { instagramGateway } from "@/server/instagram";
import { MetaApiError } from "@/server/instagram/meta-gateway";

const REFRESH_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

type ConnectionTokenRow = {
  id: string;
  token_ciphertext: string;
  token_iv: string;
  token_tag: string;
  token_expires_at: string | null;
  status: string;
};

function needsRefresh(connection: ConnectionTokenRow, force: boolean) {
  if (force || !connection.token_expires_at) return true;
  return new Date(connection.token_expires_at).getTime() <= Date.now() + REFRESH_WINDOW_MS;
}

function renewalDiagnostic(error: unknown) {
  if (error instanceof MetaApiError) {
    return `Renovação do token: Meta (${error.code ?? error.status}): ${error.message}`.slice(0, 400);
  }
  return "Não foi possível renovar a conexão automaticamente.".slice(0, 400);
}

export async function renewInstagramConnectionToken(
  connection: ConnectionTokenRow,
  options: { force?: boolean } = {},
) {
  if (!needsRefresh(connection, options.force ?? false)) {
    return { renewed: false, expiresAt: connection.token_expires_at };
  }

  const currentToken = decryptSecret({
    ciphertext: connection.token_ciphertext,
    iv: connection.token_iv,
    tag: connection.token_tag,
  });
  const renewed = await instagramGateway().renewAccessToken(currentToken);
  const encrypted = encryptSecret(renewed.accessToken);
  const refreshedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + renewed.expiresIn * 1000).toISOString();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("instagram_connections")
    .update({
      token_ciphertext: encrypted.ciphertext,
      token_iv: encrypted.iv,
      token_tag: encrypted.tag,
      token_expires_at: expiresAt,
      token_refreshed_at: refreshedAt,
      status: "connected",
      last_error: null,
    })
    .eq("id", connection.id);
  if (error) throw new Error("Não foi possível salvar o token renovado.");
  return { renewed: true, expiresAt };
}

export async function renewExpiringInstagramTokens() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("instagram_connections")
    .select("id,token_ciphertext,token_iv,token_tag,token_expires_at,status")
    .in("status", ["connected", "expiring"]);
  if (error) throw new Error("Não foi possível consultar as conexões.");

  let renewed = 0;
  let skipped = 0;
  let failed = 0;
  for (const connection of data ?? []) {
    try {
      const result = await renewInstagramConnectionToken(connection);
      if (result.renewed) renewed += 1;
      else skipped += 1;
    } catch (renewError) {
      failed += 1;
      const expired = connection.token_expires_at
        ? new Date(connection.token_expires_at).getTime() <= Date.now()
        : renewError instanceof MetaApiError && renewError.code === "190";
      await supabase
        .from("instagram_connections")
        .update({
          status: expired ? "expired" : connection.status,
          last_error: renewalDiagnostic(renewError),
        })
        .eq("id", connection.id);
    }
  }
  return { checked: (data ?? []).length, renewed, skipped, failed };
}
