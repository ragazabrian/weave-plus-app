/**
 * Server-only storage for per-user connector connection keys.
 * Keys are encrypted before they touch the database and never leave the server.
 */
import { encryptConnectionKey, decryptConnectionKey } from "@/server/connectionKeyCrypto";

type ConnectionRow = { connector_id: string; connection_key_ciphertext: string };

async function table() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // The table is service-role only, so it is intentionally absent from the
  // browser-facing generated types.
  return (
    supabaseAdmin as unknown as {
      from: (name: string) => any;
    }
  ).from("app_user_connections");
}

export async function saveConnectionKeyForUser(
  userId: string,
  connectorId: string,
  connectionAPIKey: string,
) {
  const { error } = await (
    await table()
  ).upsert(
    {
      user_id: userId,
      connector_id: connectorId,
      connection_key_ciphertext: encryptConnectionKey(connectionAPIKey),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,connector_id" },
  );
  if (error) throw error;
}

export async function getConnectionKeyForUser(userId: string, connectorId: string) {
  const { data, error } = await (
    await table()
  )
    .select("connection_key_ciphertext")
    .eq("user_id", userId)
    .eq("connector_id", connectorId)
    .maybeSingle();
  if (error) throw error;
  return data ? decryptConnectionKey(data.connection_key_ciphertext) : null;
}

/** Connector ids this user has connected. No key material is returned. */
export async function listConnectedConnectorIds(userId: string): Promise<string[]> {
  const { data, error } = await (await table()).select("connector_id").eq("user_id", userId);
  if (error) throw error;
  return ((data ?? []) as ConnectionRow[]).map((row) => row.connector_id);
}

export async function deleteConnectionForUser(userId: string, connectorId: string) {
  const { error } = await (
    await table()
  )
    .delete()
    .eq("user_id", userId)
    .eq("connector_id", connectorId);
  if (error) throw error;
}
