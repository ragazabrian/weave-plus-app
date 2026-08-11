import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  completeConnect,
  listConnections,
  removeConnection,
  startConnect,
} from "@/server/googleConnect.server";

export const startGoogleConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { connectorId: string }) => data)
  .handler(async ({ data, context }) => {
    const request = getRequest();
    if (!request) throw new Error("OAuth must start from an app request.");
    return startConnect(context.userId, data.connectorId, request.url);
  });

export const completeGoogleConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { code: string; state?: string }) => data)
  .handler(async ({ data, context }) => {
    const request = getRequest();
    return completeConnect(context.userId, data.code, {
      ...(data.state ? { state: data.state } : {}),
      ...(request ? { requestUrl: request.url } : {}),
    });
  });

export const getGoogleConnections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listConnections(context.userId));

export const disconnectGoogleConnector = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { connectorId: string }) => data)
  .handler(async ({ data, context }) => removeConnection(context.userId, data.connectorId));
