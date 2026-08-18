# SalesBlink Public REST API v1.0.0 — Overview

## Base URL

`https://run.salesblink.io/api/public/v1.0.0`

## Authentication

Pass the API key in every request as the `Authorization` header (no "Bearer" prefix):

**Header:** `Authorization: key-****`

Get a key at: https://run.salesblink.io/account/integration/api

## Gotchas

- **ID types matter**: Templates and contact archive use MongoDB ObjectId (24-char hex). All other entities use UUID v4.
- **GET `/lists/:id` returns an array**: The API returns a single-element array `[{ ... }]` even though the path looks like a single-resource endpoint. Extract the first item.
- **Sequence status filters differ by endpoint**: `GET /sequences` uses status values `running`, `paused`, `completed`, `needs-attention`. `POST /sequences/:id/status` uses `ACTIVE`, `PAUSED`, `STOPPED`, `ARCHIVED`. Do not mix them up.
- **GET `/sequences/:id` returns the internal flowchart**: The response includes the full internal `flowchart` object, not a simplified step list. Use `flowchart` to inspect steps.
- **POST `/sequences/:id/clone` returns `clonedSequenceId`**: The response shape is `{ success, data: { clonedSequenceId }, message }`, not `data.id` or `data.name`.
- **OAuth `redirectUrl` is ignored**: The API does not use a custom `redirectUrl` for `/oauth/google` or `/oauth/outlook`. The response field is `data.auth_url`, not `data.url`.
- **messageId** is the RFC822 Message-ID (e.g. `<id@domain.com>`) or Microsoft Graph ID. **Crucial:** Always URL-encode this ID when using it as a path parameter (e.g. in `/inbox/:messageId/thread`). This is distinct from the internal UUID `id`.
- **`senders` is a comma-separated string**, not an array. It can mix sender IDs and folder IDs — the server auto-detects each.
- **Sequence `steps` fully replace on PATCH**. Send the complete desired array.
- **Verification flags are IRREVERSIBLE**: `verification`, `archive_invalid`, `archive_risky` on lists can only be turned ON, never OFF.
- **Sequences default to paused**: If `paused` is omitted on create, it defaults to `true`.
- **`launchTimingMode: "now"` starts in 5 minutes**, not instantly.
- **Template attachments use FormData field `attachment`** (not `attachments`). Max 3 per template.
- **Remove template attachments via `remove_attachments`** array of file **names**.
- **POST `/senders` adds an SMTP/IMAP sender**. For Gmail and Outlook, OAuth is preferred — use `/oauth/google` or `/oauth/outlook`, which return an `auth_url` the user must open in a browser; the sender is created automatically after OAuth completion. SMTP/IMAP can still be used if the user explicitly provides SMTP/IMAP credentials.
- **Adding an SMTP/IMAP sender requires `from_email`**, not `email`.
- **If an endpoint for a specific task is not mentioned then tell the user that the endpoint is not available**
- **If user does not have a list, ask them for a CSV file, or list of lead emails with data.**
- **If email sender is not connected, help them connect one using APIs.**
- **When asked to create a sequence or campaign for cold email outreach, first ask them about their ICP, Offer, and other details.**
- **Forward content is optional**: `POST /inbox/:messageId/forward` uses the original email body when `content` is omitted.
- **`/blocklist` CLI vocabulary maps to `/unsubscribe` endpoints**: all blocklist operations use the `/unsubscribe` public API.
- **Archiving is done via dedicated archive routes**: `PATCH /lists/:id`, `PATCH /templates/:id`, and `PATCH /sequences/:id` ignore the `archived` field. Use `PUT /lists/:id/archive`, `PUT /templates/:id/archive`, and `PUT /sequences/:id/archive` instead.

## Rate Limits

| Method        | Limit | Window     | Applies To |
| ------------- | ----- | ---------- | ---------- |
| GET           | 30    | per minute | Most GET endpoints |
| POST / PATCH  | 15    | per minute | POST and PATCH endpoints |
| PUT (archive) | 10    | per minute | PUT and DELETE endpoints |
| POST /signup  | 5     | per day    | Public signup (per IP) |

On `429 Too Many Requests`: wait at least 60 seconds before retrying. For batch operations, insert a 4-second delay between requests.

## Public Signup

**POST** `/signup` — public endpoint, no API key required. Successful signup returns an API key.

```json
{ "email": "user@example.com", "password": "SecurePassword123", "name": "John Doe" }
```

Constraints: `password` min 8, max 48 chars, at least one uppercase and one lowercase letter. Rate limit: 5 signups per day per IP.

## Pagination

Most list endpoints use `limit` (max 100) and `skip`. Activity endpoints (`/sent`, `/opens`, `/clicks`, `/replies`) use `per_page` (max 100) and `page` (1-indexed).

Some endpoints support higher limits:
- `/sequences/:id/leads` and `/leads/:id/activity` — max 500
- `/sequences/:id/export` — max 50,000 (default 10,000)

Always paginate. Never assume a single request returns all data.

## Endpoint Categories (reference doc topics)

Use `salesblink_get_reference_doc` with one of these topics before performing operations in that domain:

- `lists` — create/manage lists (containers for contacts/leads)
- `contacts` — add/update/move/remove leads in lists (batch up to 500)
- `templates` — reusable email templates with merge variables and attachments
- `sequences` — automated email campaigns (steps, launch, pause, clone, archive)
- `senders` — sending accounts (OAuth Gmail/Outlook, SMTP/IMAP), warmup links
- `inbox` — reply threads, sent/scheduled emails, drafts, classify outcomes
- `activity` — engagement events: sent, opens, clicks, replies
- `analytics` — aggregated campaign stats (overall, day-wise, lead-level, per-mailbox)
- `blocklist` — account-level unsubscribes / blocked emails and domains
- `organization` — users, roles, workspaces
- `folders` — organize lists, templates, sequences, senders into folders
- `account-config` — custom tracking domains, signatures
- `dfy` — Done-For-You domain purchase and mailbox provisioning
- `billing` — saved payment methods, billing magic links
- `api-keys` — list, create, refresh, delete API keys
- `reports` — aggregated activity reports over a date range
- `inbox-placement` — deliverability / spam placement tests
- `workflows` — end-to-end campaign setup examples

## Error Handling

Always check the `success` boolean in the response body. A `200` status can still return `{ success: false, message: "..." }`.

| Status | Meaning      | Action                                                |
| ------ | ------------ | ----------------------------------------------------- |
| 200    | Success      | Check `success` field                                 |
| 400    | Bad request  | Re-check payload structure against the reference file |
| 401    | Unauthorized | Verify API key                                        |
| 403    | Forbidden    | Insufficient permissions (role too low)               |
| 404    | Not found    | Verify the ID / endpoint                              |
| 409    | Conflict     | Resource already exists or connection failed          |
| 429    | Rate limited | Wait 60s, then retry                                  |
| 500    | Server error | Retry once after 10s                                  |
