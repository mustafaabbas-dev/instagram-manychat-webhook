# Instagram ManyChat Webhook

Minimal Fastify webhook for ManyChat HTTP requests.

## Local dev

```bash
npm install
cp .env.example .env
npm run dev
```

Test:

```bash
curl -X POST http://localhost:8080/webhook \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: change-me' \
  -d '{"hello":"world"}'
```

## Endpoints

- `GET /health` -> `{ ok: true }`
- `POST /webhook` -> `{ ok: true }`

## Deploy (Cloud Run)

This repo is ready to deploy to Google Cloud Run. Deployment steps will be added in the next step.
