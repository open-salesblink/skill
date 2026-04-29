---
name: cold-email-salesblink
description: >
  Run cold email sequences on autopilot and manage full sales outreach campaigns via the SalesBlink API.
  Use this skill to build automated multi-step email campaigns (sequences), manage leads and email lists,
  create reusable templates with merge variables and spintax, connect sending accounts (Gmail, Outlook, SMTP),
  handle inbox replies, and track campaign analytics (opens, clicks, replies, sent).
  Also supports bulk contact imports, email deliverability testing (inbox placement / spam checks),
  sender warmup links, workspace/team management, and any HTTP request to the SalesBlink platform.
compatibility: >
  Requires network access to run.salesblink.io and a SALESBLINK_API_KEY.
  Supports any HTTP client (curl, Node.js fetch, Python requests, PowerShell, etc.).
  No prior knowledge of SalesBlink is needed: the skill guides you through connecting email accounts,
  importing leads, writing templates, building sequences, launching campaigns, and monitoring deliverability.
metadata:
  openclaw:
    requires:
      env:
        - SALESBLINK_API_KEY
    primaryEnv: SALESBLINK_API_KEY
---

# SalesBlink Public REST API v1.0.0

## When to use this skill

Use this skill when the user wants to:

- Create, update, or manage email lists, sequences, templates, or senders
- Add, update, move, or remove contacts/leads
- Send or reply to emails via the inbox
- Check campaign analytics (opens, clicks, replies, sent)
- Set up outreach campaigns end-to-end
- Manage workspaces, users, folders, or deliverability tests
- Make any HTTP request to `run.salesblink.io/api/public/v1.0.0`

## Gotchas

- **ID types matter**: Templates and contact archive use MongoDB ObjectId (24-char hex). All other entities use UUID v4.
- **messageId** is the RFC822 Message-ID (e.g. `<id@domain.com>`) or Microsoft Graph ID. **Crucial:** Always URL-encode this ID when using it as a path parameter (e.g. in `/inbox/:messageId/thread`). This is distinct from the internal UUID `id`.
- **`senders` is a comma-separated string**, not an array. It can mix sender IDs and folder IDs — the server auto-detects each.
- **Sequence `steps` fully replace on PATCH**. Send the complete desired array.
- **Verification flags are IRREVERSIBLE**: `verification`, `archive_invalid`, `archive_risky` on lists can only be turned ON, never OFF.
- **Sequences default to paused**: If `paused` is omitted on create, it defaults to `true`.
- **`launchTimingMode: "now"` starts in 5 minutes**, not instantly.
- **Template attachments use FormData field `attachment`** (not `attachments`). Max 3 per template.
- **Remove template attachments via `remove_attachments`** array of file **names**.
- **Adding SMTP sender requires `from_email`**, not `email`.
- **If an endpoint for a specific task is not mentioned then tell the user that the endpoint is not available**
- **If user does not have a list, ask them for a CSV file, or list of lead emails with data.**
- **If email sender is not connected, help them connect one using APIs.**
- **When asked to create a sequence or campaign for cold email outreach, first ask them about their ICP, Offer, and other details.**

## Base URL

`https://run.salesblink.io/api/public/v1.0.0`

## Authentication

Ask the user for their SALESBLINK_API_KEY: `https://run.salesblink.io/account/integration/api`

Pass it in every request as the `Authorization` header (no "Bearer" prefix):

**Header:** `Authorization: key-****`

## Rate Limits

| Method        | Limit | Window     |
| ------------- | ----- | ---------- |
| GET           | 30    | per minute |
| POST / PATCH  | 15    | per minute |
| PUT (archive) | 10    | per minute |

On `429 Too Many Requests`: wait at least 60 seconds before retrying. For batch operations, insert a 4-second delay between requests.

## Pagination

Most list endpoints use `limit` (max 100) and `skip`. Activity endpoints (`/sent`, `/opens`, `/clicks`, `/replies`) use `per_page` (max 100) and `page` (1-indexed).

Always paginate. Never assume a single request returns all data.

## Endpoint Categories

Read the relevant reference file before performing operations in that domain:

- **Lists & contacts/leads** → [references/lists.md](references/lists.md) and [references/contacts.md](references/contacts.md)
  - Use these endpoints when the user wants to fetch or manage lists that contain leads/contacts. A list is a container for contacts/leads. Each contact/lead contains fields like Email, First_Name, Last_Name, Phone, Company, Title, and custom fields. Contacts are added to lists in batches (up to 500 per request), can be moved between lists, updated, or removed.

- **Email templates** → [references/templates.md](references/templates.md)
  - Use these endpoints when the user wants to create or manage reusable email templates. A template has a name, subject_line, and HTML content that supports merge variables like {{first_name}} and {{company}}. Templates can have up to 3 attachments and are referenced by sequences when building outreach steps.

- **Sequences & email campaigns** → [references/sequences.md](references/sequences.md)
  - Use these endpoints when the user wants to create or manage automated email campaigns (sequences). A sequence connects lists (who to email), senders (which accounts send), and templates (what to send) into a timed step-by-step workflow. Steps alternate between email sends and delay periods. Sequences can be launched, paused, resumed, cloned, or archived.

- **Senders & OAuth** → [references/senders.md](references/senders.md)
  - Use these endpoints when the user wants to connect or manage email sending accounts. A sender is an email account (SMTP/IMAP or OAuth-connected Gmail/Outlook) that sends emails on behalf of sequences. Multiple senders can be assigned to a sequence. Senders can also be organized into folders.

- **Inbox & replies** → [references/inbox.md](references/inbox.md)
  - Use these endpoints when the user wants to view or interact with email conversations. The inbox contains reply threads, sent emails, scheduled emails, and drafts. Each thread has a messageId. The user can reply to a lead's email, mark messages as read/unread, or classify outcomes.

- **Activity tracking** → [references/activity.md](references/activity.md)
  - Use these endpoints when the user wants to query engagement events. The system tracks four event types: sent (emails sent), opens (emails opened), clicks (links clicked), and replies (responses received). Events can be filtered by sequence, recipient email, and date range.

- **Users & workspaces** → [references/organization.md](references/organization.md)
  - Use these endpoints when the user wants to manage team membership or workspaces. A workspace is an account boundary. Users have roles (client, user, admin, developer). Only owners and admins can invite users or create workspaces.

- **Folders** → [references/folders.md](references/folders.md)
  - Use these endpoints when the user wants to organize resources into folders. Folders have a type (list, template, sequence, or email-sender) and group related resources together for easier management.

- **Domains, signatures & warmup links** → [references/account-config.md](references/account-config.md)
  - Use these endpoints when the user wants to view account-level configuration. Custom tracking domains are used for click tracking in emails. Signatures are appended to outgoing emails. Warmup links are used in email warmup processes.

- **Reports** → [references/reports.md](references/reports.md)
  - Use these endpoints when the user wants to fetch aggregated activity reports over a date range. Reports combine data across campaigns into summary views.

- **Inbox placement tests** → [references/inbox-placement.md](references/inbox-placement.md)
  - Use these endpoints when the user wants to test email deliverability. An inbox placement test sends a test email to seed email addresses across providers (Gmail, Outlook, etc.) and reports whether the email landed in inbox, spam, promotions, or other tabs. Tests can be one-time or recurring.

- **End-to-end workflow examples** → [references/workflows.md](references/workflows.md)
  - Use this reference when the user wants to set up a complete outreach campaign from scratch. It shows the full chain: create list → add contacts → create templates → fetch senders → create sequence → launch.

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
