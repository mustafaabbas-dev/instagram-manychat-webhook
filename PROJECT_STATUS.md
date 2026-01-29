# Project Status

Date: 2026-01-29

## Current goal
Collect rapid IG messages, wait 10 seconds, then send a single reply via ManyChat.

## Backend (Cloud Run)
- Service: instagram-manychat-webhook
- URL: https://instagram-manychat-webhook-327590868727.us-central1.run.app
- Region: us-central1
- Env:
  - WEBHOOK_SECRET=change-me
  - DEBOUNCE_MS=10000

Endpoints:
- POST /ingest
  - Stores messages in memory keyed by user_id.
- POST /reply
  - Returns reply_text only after debounce window.
  - Returns ManyChat action to unset reply_text field:
    - actions: [{ action: "unset_field_value", field_name: "reply_text" }]

## ManyChat flow (intended)
1) Default Reply trigger
2) External Request #1 -> /ingest
3) Wait 10 seconds
4) External Request #2 -> /reply
5) Condition: if reply_text is not empty -> Send Message {{reply_text}}

Request body for both external requests:
{
  "user_id": "{{contact.id}}",
  "text": "{{last_text_input}}"
}

## Current issue
- Cloud Run logs show only /reply requests, not /ingest.
- This means the first External Request is not firing or is misconfigured.

## Next actions
- Fix External Request #1 URL to /ingest and ensure it has a JSON body.
- Re-test and confirm logs show /ingest calls.
