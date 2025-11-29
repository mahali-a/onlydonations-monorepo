import { Hono } from "hono";
import { cors } from "hono/cors";
import health from "./health";
import realtime from "./realtime";
import paystackWebhooks from "./webhooks/paystack";
import smileWebhooks from "./webhooks/smile";

export const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: (origin) => {
      // @ts-expect-error - process.env available in Node compat mode
      const isDev = process.env.NODE_ENV === "development";

      if (isDev && origin.includes("localhost")) return origin;

      if (origin.includes("onlydonations.com")) return origin;

      return null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.route("/health", health);
app.route("/webhooks/paystack", paystackWebhooks);
app.route("/webhooks/smile", smileWebhooks);
app.route("/", realtime);
app.get("/", (c) => c.text("OnlyDonations API"));

export default app;
