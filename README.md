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


## Claude Code Plugin

### Installation

Install from the GitHub repository:

```bash
claude /plugin install https://github.com/open-salesblink/skill
```

Or clone and load locally for development:

```bash
git clone https://github.com/open-salesblink/skill.git
claude --plugin-dir ./skill
```

### Configuration

Set your SalesBlink API key as an environment variable:

```bash
export SALESBLINK_API_KEY="key-****"
```

### Usage

Once installed, invoke the skill:

```bash
/cold-email-salesblink:cold-email-salesblink
```

Run `/help` to verify the plugin is loaded and see all available skills.

## Codex Plugin

### Installation

Install from the GitHub repository:

```bash
codex plugin install https://github.com/open-salesblink/skill
```

Or clone and load locally for development by adding it to a local marketplace:

```bash
git clone https://github.com/open-salesblink/skill.git
```

Then add a marketplace file at `$REPO_ROOT/.agents/plugins/marketplace.json` (repo-scoped) or `~/.agents/plugins/marketplace.json` (personal) pointing to the plugin directory.

### Configuration

Set your SalesBlink API key as an environment variable:

```bash
export SALESBLINK_API_KEY="key-****"
```

### Usage

Once installed, invoke the skill by referencing the plugin namespace. Use the plugin to create sequences, manage contacts, check analytics, or run any SalesBlink workflow.

## Gemini CLI Extension

### Installation

Clone the repository and link it for local development:

```bash
git clone https://github.com/open-salesblink/skill.git
cd skill/.gemini-extension
gemini extensions link .
```

Or install directly from the GitHub repository (when published as a release):

```bash
gemini extensions install https://github.com/open-salesblink/skill
```

### Configuration

Set your SalesBlink API key as an environment variable:

```bash
export SALESBLINK_API_KEY="key-****"
```

When you first use the extension, Gemini CLI will prompt you to enter the API key and store it securely in the system keychain.

### Usage

Once linked, restart Gemini CLI. The extension automatically loads `GEMINI.md` context and discovers the bundled agent skill. Ask Gemini to perform any SalesBlink workflow, such as:

- "Create a cold email sequence for my SaaS product"
- "Add these leads to a new list and launch a campaign"
- "Check analytics for opens and replies from last week"
- "Run an inbox placement test for my template"

## OpenClaw (via ClawHub)

### Installation

Install from ClawHub using the CLI:

```bash
openclaw skills install cold-email-salesblink
```

Or install by prompt:

```text
Install the skill "Cold Email Outreach with SalesBlink" (sheksushant/cold-email-salesblink) from ClawHub.
```

**Skill page:** https://clawhub.ai/sheksushant/cold-email-salesblink

### Configuration

Set your SalesBlink API key as an environment variable:

```bash
export SALESBLINK_API_KEY="key-****"
```

### Post-Install Setup

After installation, inspect the skill metadata to verify requirements. This skill requires:

- `SALESBLINK_API_KEY` — your SalesBlink API key from https://run.salesblink.io/account/integration/api

No additional environment variables or external dependencies are required. Once the API key is set, the skill is ready to use.

### Usage

Invoke the skill to create sequences, manage contacts, check analytics, or run any SalesBlink workflow.

## Base URL

```
https://run.salesblink.io/api/public/v1.0.0
```

## Authentication

1. Get your API key from: `https://run.salesblink.io/account/integration/api`
2. Pass it in every request as the `Authorization` header (no "Bearer" prefix):

```
Authorization: SALESBLINK_API_KEY
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
