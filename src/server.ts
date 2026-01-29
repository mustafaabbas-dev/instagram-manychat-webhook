import "dotenv/config";
import Fastify from "fastify";

const server = Fastify({
  logger: true,
});

// Allow empty JSON bodies from providers that set Content-Type without a payload
server.addContentTypeParser(
  "application/json",
  { parseAs: "string" },
  (request, body, done) => {
    const text = typeof body === "string" ? body : body?.toString?.("utf8");
    if (text === "" || text === null || text === undefined) {
      done(null, {});
      return;
    }
    try {
      const json = JSON.parse(text);
      done(null, json);
    } catch (err) {
      done(err as Error, undefined);
    }
  }
);

const PORT = Number(process.env.PORT ?? 8080);
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

function verifySecret(request: { headers: Record<string, string | string[] | undefined> }) {
  if (!WEBHOOK_SECRET) return true;
  const provided = request.headers["x-webhook-secret"];
  if (!provided) return false;
  if (Array.isArray(provided)) return provided.includes(WEBHOOK_SECRET);
  return provided === WEBHOOK_SECRET;
}

server.get("/health", async () => ({ ok: true }));

server.post("/webhook", async (request, reply) => {
  if (!verifySecret(request)) {
    reply.code(401);
    return { ok: false, error: "unauthorized" };
  }

  // ManyChat will send JSON; keep raw payload for experiments
  const payload = request.body ?? null;
  request.log.info({ payload }, "manychat webhook received");

  return { ok: true, reply_text: "hello" };
});

const start = async () => {
  try {
    await server.listen({ port: PORT, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

void start();
