import { Hono } from "hono";
import health from "./health";

export const app = new Hono<{ Bindings: Env }>();

app.route("/health", health);
app.get("/", (c) => c.text("OnlyDonations API"));

export default app;
