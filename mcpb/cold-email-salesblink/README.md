# SalesBlink Cold Email — MCP Bundle (MCPB)

Run cold email sequences and full sales outreach on autopilot via the [SalesBlink](https://salesblink.io) public REST API, packaged as an [MCP Bundle](https://github.com/anthropics/mcpb) (`.mcpb`) for one-click installation in MCPB-compatible hosts (e.g. Claude for macOS/Windows).

This bundle is built from the SalesBlink agent skill in [`open-salesblink/skill`](https://github.com/open-salesblink/skill). Prefer installing the skill directly? See the repo README for `npx skills`, Claude Code, OpenClaw, and Hermes install options.

**[⬇ Download the latest cold-email-salesblink.mcpb](https://github.com/open-salesblink/skill/releases/latest/download/cold-email-salesblink.mcpb)** — open the file in your host and enter your `SALESBLINK_API_KEY` when prompted.

## What it does

The bundle runs a local Node.js MCP server (stdio transport) that acts as a hardened gateway to `https://run.salesblink.io/api/public/v1.0.0`:

- **Campaigns** — build multi-step email sequences, launch, pause, resume, clone, archive
- **Leads** — create lists, bulk-import contacts (500/request), move and update leads
- **Templates** — merge variables (`{{first_name}}`), spintax, attachments
- **Senders** — Gmail/Outlook OAuth, SMTP/IMAP accounts, warmup links
- **Inbox** — reply threads, replies, forwards, outcome classification
- **Analytics** — sent/opens/clicks/replies, overall/daily/lead-level/mailbox stats
- **Deliverability** — inbox placement tests across providers
- **Workspace** — users, workspaces, folders, domains, signatures, billing, API keys

The complete SalesBlink API reference (endpoints, payload shapes, gotchas) ships inside the bundle as readable docs, so the assistant can self-guide through any of the ~98 endpoints.

## Tools

| Tool | Purpose |
| ---- | ------- |
| `salesblink_request` | Make any authenticated API call: `method`, `path`, `query`, `body` |
| `salesblink_signup` | Create a SalesBlink account (public) and receive an API key |
| `salesblink_list_reference_docs` | List bundled API doc topics |
| `salesblink_get_reference_doc` | Read exact endpoints/payloads/gotchas for one domain |
| `salesblink_check_auth` | Verify the configured API key (`GET /account/verify`) |

Typical flow: `salesblink_get_reference_doc("overview")` → `salesblink_get_reference_doc("sequences")` → `salesblink_request({ method: "POST", path: "/sequences", body: {...} })`.

## Configuration

Set during installation (defined in `manifest.json` `user_config`):

- **SalesBlink API Key** (`SALESBLINK_API_KEY`, sensitive, required) — get one at <https://run.salesblink.io/account/integration/api>. Without it, only `salesblink_signup` and the doc tools work.
- **Log Level** (`SALESBLINK_MCPB_LOG_LEVEL`, optional, default `info`) — `debug` | `info` | `warn` | `error`. Logs go to **stderr only**; stdout is reserved for the MCP protocol.

Additional optional env var: `SALESBLINK_TIMEOUT_MS` (request timeout, default `30000`, max `120000`).

## Security

- API key is passed only via environment variable, sent only to `run.salesblink.io`, and redacted from logs.
- The base URL is hardcoded; tool `path` arguments are validated to be relative paths (absolute URLs are rejected), so requests cannot be redirected to other hosts.
- Requests time out after 30s (configurable); one automatic retry on transient network failure; structured errors on 4xx/5xx with actionable hints.
- Responses are capped (~100 KB) to protect the host's context window.

## Rate limits (SalesBlink API)

- GET: 30/min · POST/PATCH: 15/min · PUT/DELETE: 10/min · signup: 5/day per IP
- On `429`, wait at least 60 seconds before retrying; the server returns this hint in the error payload.

## Build from source

```bash
cd mcpb/cold-email-salesblink
npm install --omit=dev          # installs + bundles node_modules
npm test                        # stdio protocol smoke test (no API key needed)
npx @anthropic-ai/mcpb validate .   # validate manifest.json against the spec
npx @anthropic-ai/mcpb pack .       # produce cold-email-salesblink.mcpb
```

Then open `cold-email-salesblink.mcpb` with your MCPB-compatible host to install.

## Manual (non-bundle) usage

Any MCP client can run the server directly:

```json
{
  "mcpServers": {
    "salesblink": {
      "command": "node",
      "args": ["/path/to/mcpb/cold-email-salesblink/server/index.js"],
      "env": { "SALESBLINK_API_KEY": "key-****" }
    }
  }
}
```

## License

MIT — © FUTUREBLINK Inc. See the repository root `LICENSE` file.
