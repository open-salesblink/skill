# SalesBlink Cold Email Outreach Skill

Run cold email sequences and sales outreach on autopilot via the [SalesBlink](https://salesblink.io) API. Works with any AI agent.

---

## Install in 30 seconds

### 1. Get your API key

Grab your key from [`run.salesblink.io/account/integration/api`](https://run.salesblink.io/account/integration/api).

### 2. Install the skill

**Any agent (npx)**

```bash
npx skills add open-salesblink/skill
```

**Claude Code**

```bash
/plugin marketplace add https://github.com/open-salesblink/skill
/plugin install cold-email-salesblink
```

**OpenClaw / ClawHub**

```bash
openclaw skills install cold-email-salesblink
```

### 3. Set your API key

```bash
export SALESBLINK_API_KEY="key-****"
```

### 4. Start working

- _"Create a cold email sequence for my SaaS product"_
- _"Add these leads to a new list and launch a campaign"_
- _"Check analytics for opens and replies from last week"_
- _"Run an inbox placement test for my template"_

---

## What you can do

- **Cold email campaigns** — build sequences, write templates, and launch outreach
- **Lead management** — create lists, import contacts in bulk, move and update leads
- **Sender management** — connect Gmail/Outlook via OAuth or SMTP/IMAP accounts
- **Inbox & replies** — read threads, reply to prospects, mark conversations
- **Analytics** — track opens, clicks, replies, and sent events
- **Deliverability testing** — run inbox placement tests across providers
- **Workspace & team management** — users, roles, folders, and account config

---

## Other platforms

### Codex

```bash
codex plugin marketplace add https://github.com/open-salesblink/skill
```

Invoke by referencing the plugin namespace.

### Cursor

```bash
git clone https://github.com/open-salesblink/skill.git
```

Load the plugin from the cloned directory in Cursor's plugin settings.

### Gemini CLI

```bash
gemini extensions install https://github.com/open-salesblink/skill
```

Or clone and link locally:

```bash
git clone https://github.com/open-salesblink/skill.git
cd skill/.gemini-extension
gemini extensions link .
```

Restart Gemini CLI after linking. The extension auto-loads `GEMINI.md` context.

### MCP

Visit https://mcp.salesblink.io to connect via MCP.

> **Note:** All platforms above require the same `SALESBLINK_API_KEY` environment variable shown in Step 3.

---

## API Quick Reference

**Base URL**

```
https://run.salesblink.io/api/public/v1.0.0
```

**Authentication**
Pass your API key in the `Authorization` header with no "Bearer" prefix:

```
Authorization: key-****
```

**Pagination**

- Most list endpoints: `limit` (max 100) and `skip`
- Activity endpoints (`/sent`, `/opens`, `/clicks`, `/replies`): `per_page` (max 100) and `page` (1-indexed)

Always paginate — never assume a single request returns all data.

**Error Handling**

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

---

## Quick Start: End-to-End Campaign

See [`references/workflows.md`](references/workflows.md) for full examples. High-level flow:

1. **Create a list** → `POST /lists`
2. **Add contacts** → `POST /contacts` (batch up to 500, PascalCase fields)
3. **Create templates** → `POST /templates` (merge vars like `{{first_name}}`)
4. **Fetch senders** → `GET /senders`
5. **Create sequence** → `POST /sequences` (steps: email → delay → email …)
6. **Launch** → `PATCH /sequences/:id` with `paused: false` & `launchTimingMode: "now"`

---

## Evaluations

The [`evals/evals.json`](evals/evals.json) file contains test scenarios covering list creation, bulk contact import, sequence creation, large CSV ingestion, inbox replies with CC, and paginated activity tracking.

---

## Compatibility

- Requires network access to `run.salesblink.io`
- Supports any HTTP client (curl, Node.js fetch, Python requests, PowerShell, etc.)

## License

This skill is provided as-is for use with the SalesBlink platform. Refer to SalesBlink's terms of service for API usage policies.

