import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

/**
 * Get WebSocket connection URL from server environment
 * Converts API base URL to WebSocket protocol (ws/wss)
 */
export const getWebSocketConnectionUrlFromServer = createServerFn({
  method: "GET",
}).handler(async () => {
  const isDev = process.env.NODE_ENV === "development";

  // Use localhost in development, env variable in production
  const apiBaseUrl = isDev ? "http://localhost:8787" : env.API_BASE_URL;

  // Convert http/https to ws/wss
  const wsUrl = apiBaseUrl.replace(/^https?/, (match: string) =>
    match === "https" ? "wss" : "ws",
  );

  return { wsUrl, apiBaseUrl };
});
