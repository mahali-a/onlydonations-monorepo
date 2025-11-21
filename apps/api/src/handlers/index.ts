import { Hono } from "hono";
import health from "./health";
import webhooks from "./webhooks/paystack";

export const app = new Hono<{ Bindings: Env }>();

app.route("/health", health);
app.route("/webhooks/paystack", webhooks);
app.get("/", (c) => c.text("OnlyDonations API"));

export default app;
