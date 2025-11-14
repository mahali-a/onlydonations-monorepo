import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/r2/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const environment = env.ENVIRONMENT || process.env.NODE_ENV;
        if (environment === "production") {
          return new Response("Not Found", { status: 404 });
        }

        const key = params._splat;

        if (!key) {
          return new Response("No key provided", { status: 400 });
        }

        try {
          const file = await env.ASSETS.get(key);

          if (!file) {
            return new Response("File not found", { status: 404 });
          }

          const headers = new Headers();
          headers.append("cache-control", "immutable, no-transform, max-age=31536000");
          headers.append("etag", file.httpEtag);
          headers.append("date", file.uploaded.toUTCString());

          return new Response(file.body, { headers });
        } catch (error) {
          console.error(`Error fetching key "${key}" from R2:`, error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
