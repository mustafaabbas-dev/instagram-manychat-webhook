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
- `POST /ingest` -> `{ ok: true }`
- `POST /reply` -> `{ ok: true, reply_text }`

## Deploy (Cloud Run)

1) Authenticate and set project:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com
```

2) Deploy:

```bash
gcloud run deploy instagram-manychat-webhook \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars WEBHOOK_SECRET=change-me
```

3) Use the URL output by the deploy command in ManyChat.
