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
const DEBOUNCE_MS = Number(process.env.DEBOUNCE_MS ?? 3000);

type UserState = {
  lastMessageAt: number;
  messages: string[];
};

const userState = new Map<string, UserState>();

type Payload = {
  user_id?: string;
  contact_id?: string;
  id?: string;
  text?: string;
  message?: string;
};

function verifySecret(request: { headers: Record<string, string | string[] | undefined> }) {
  if (!WEBHOOK_SECRET) return true;
  const provided = request.headers["x-webhook-secret"];
  if (!provided) return false;
  if (Array.isArray(provided)) return provided.includes(WEBHOOK_SECRET);
  return provided === WEBHOOK_SECRET;
}

server.get("/health", async () => ({ ok: true }));

server.post("/ingest", async (request, reply) => {
  if (!verifySecret(request)) {
    reply.code(401);
    return { ok: false, error: "unauthorized" };
  }

  const payload = (request.body ?? {}) as Payload;
  const userId = payload.user_id ?? payload.contact_id ?? payload.id ?? "unknown";
  const text = payload.text ?? payload.message ?? "";

  const state = userState.get(userId) ?? { lastMessageAt: 0, messages: [] };
  state.lastMessageAt = Date.now();
  if (text) state.messages.push(text);
  userState.set(userId, state);

  request.log.info({ userId, text }, "manychat ingest received");
  return { ok: true };
});

server.post("/reply", async (request, reply) => {
  if (!verifySecret(request)) {
    reply.code(401);
    return { ok: false, error: "unauthorized" };
  }

  const payload = (request.body ?? {}) as Payload;
  const userId = payload.user_id ?? payload.contact_id ?? payload.id ?? "unknown";
  const state = userState.get(userId);
  if (!state) return { ok: true, reply_text: "" };

  const age = Date.now() - state.lastMessageAt;
  if (age < DEBOUNCE_MS) {
    return { ok: true, reply_text: "" };
  }

  // Replace this with your real logic later
  const replyText = "hello";
  userState.delete(userId);
  return { ok: true, reply_text: replyText };
});

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
