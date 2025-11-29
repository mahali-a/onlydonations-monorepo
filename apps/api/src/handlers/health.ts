import { Hono } from "hono";

const health = new Hono<{ Bindings: Cloudflare.Env }>();

health.get("/", (c) => {
  return c.json({ status: "ok", timestamp: Date.now() });
});

export default health;
