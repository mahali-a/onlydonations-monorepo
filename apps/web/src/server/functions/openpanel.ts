import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";

export const retrieveOpenPanelClientId = createServerFn({
  method: "GET",
}).handler(() => env.OPENPANEL_CLIENT_ID);
