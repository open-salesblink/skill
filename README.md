# SalesBlink API Agent Skill

An agent skill for automating cold email and sales outreach via the [SalesBlink](https://salesblink.io) Public REST API.

## Overview

This skill enables AI agents to interact with SalesBlink for:

- **Cold email campaigns** — create sequences, templates, and launch outreach
- **Lead management** — build lists, import contacts in bulk, move and update leads
- **Sender management** — connect Gmail/Outlook via OAuth or SMTP/IMAP accounts
- **Inbox & replies** — read threads, reply to prospects, mark conversations
- **Analytics** — track opens, clicks, replies, and sent events
- **Deliverability testing** — run inbox placement tests across providers
- **Workspace & team management** — users, roles, folders, and account config

## Base URL

```
https://run.salesblink.io/api/public/v1.0.0
```

## Authentication

1. Get your API key from: `https://run.salesblink.io/account/integration/api`
2. Pass it in every request as the `Authorization` header (no "Bearer" prefix):

```
Authorization: YOUR_API_KEY
```

## Directory Structure

```
salesblink-api-v1/
├── SKILL.md                          # Skill manifest & quick reference
├── README.md                         # This file
├── evals/
│   └── evals.json                    # Evaluation scenarios for the skill
└── references/
    ├── lists.md                      # List & lead-container endpoints
    ├── contacts.md                   # Contact/lead CRUD endpoints
    ├── templates.md                  # Email template endpoints
    ├── sequences.md                  # Sequence (campaign) endpoints
    ├── senders.md                    # Email sender & OAuth endpoints
    ├── inbox.md                      # Inbox, threads & reply endpoints
    ├── activity.md                   # Opens, clicks, replies, sent events
    ├── organization.md               # Users & workspaces
    ├── folders.md                    # Folder management
    ├── account-config.md             # Domains, signatures, warmup links
    ├── reports.md                    # Aggregated activity reports
    ├── inbox-placement.md            # Deliverability / seed tests
    └── workflows.md                  # End-to-end campaign examples
```

## Pagination

- Most list endpoints: `limit` (max 100) and `skip`
- Activity endpoints (`/sent`, `/opens`, `/clicks`, `/replies`): `per_page` (max 100) and `page` (1-indexed)

Always paginate — never assume a single request returns all data.

## Quick Start: End-to-End Campaign

See [`references/workflows.md`](references/workflows.md) for full examples. Here is the high-level flow:

1. **Create a list** → `POST /lists`
2. **Add contacts** → `POST /contacts` (batch up to 500, PascalCase fields)
3. **Create templates** → `POST /templates` (merge vars like `{{first_name}}`)
4. **Fetch senders** → `GET /senders`
5. **Create sequence** → `POST /sequences` (steps: email → delay → email …)
6. **Launch** → `PATCH /sequences/:id` with `paused: false` & `launchTimingMode: "now"`

## Error Handling

| Status | Meaning       | Action                                                |
|--------|---------------|-------------------------------------------------------|
| 200    | Success       | Check `success` field                                 |
| 400    | Bad request   | Re-check payload structure against the reference file |
| 401    | Unauthorized  | Verify API key                                        |
| 403    | Forbidden     | Insufficient permissions (role too low)               |
| 404    | Not found     | Verify the ID / endpoint                              |
| 409    | Conflict      | Resource already exists or connection failed          |
| 429    | Rate limited  | Wait 60s, then retry                                  |
| 500    | Server error  | Retry once after 10s                                  |

## Evaluations

The [`evals/evals.json`](evals/evals.json) file contains test scenarios covering:

- List creation with verification and bulk contact import
- Sequence creation with steps, senders, and launch timing
- Large CSV ingestion with batching and deduplication
- Inbox reply with CC
- Paginated activity tracking (opens over 30 days)

## Compatibility

- Requires network access to `run.salesblink.io`
- Supports any HTTP client (curl, Node.js fetch, Python requests, PowerShell, etc.)

## License

This skill is provided as-is for use with the SalesBlink platform. Refer to SalesBlink's terms of service for API usage policies.
