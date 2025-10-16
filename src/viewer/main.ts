import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = new Hono();
app.use("/*", serveStatic({ root: join(__dirname, "../viewer") }));

const type = serve(app);
console.log("opened server on ", type.address());
