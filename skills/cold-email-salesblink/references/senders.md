# Email Senders & OAuth

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/senders` | GET | List all connected senders (flat list, not grouped by folder) |
| `/senders/connect-link` | GET | Get a magic login link to the email-sender connection page in the SalesBlink web UI. |
| `/senders/bulk-connect-link` | GET | Get a magic login link to the bulk CSV sender upload page in the SalesBlink web UI. |
| `/senders/add-sender` | POST | Add one SMTP/IMAP sender directly from JSON credentials |
| `/senders/add-bulk-senders` | POST | Add or update many SMTP/IMAP senders from a CSV file (`multipart/form-data`) |
| `/senders/:id` | PATCH | Update sender settings (warmup, inbox, signature, tracking, folder, etc.) |
| `/senders/:id/reconnect` | POST | Reconnect a failed sender |
| `/senders/:id/health` | GET | Get sender health/reputation score |
| `/senders/:id/warmup-stats` | GET | Date-wise warmup stats |
| `/senders/:id/fetch-messages` | POST | Retrieve sent emails and received replies for a sender (max 50 messages, use `?skip` for pagination) |
| `/senders/multi/fetch-messages` | POST | Bulk retrieve sent emails and received replies across senders (max 50 messages, use `?skip` for pagination) |
| `/warmup-links` | GET | List warmup link configurations |
| `/oauth/google` | POST | Get Google OAuth URL for connecting Gmail |
| `/oauth/outlook` | POST | Get Microsoft OAuth URL for connecting Outlook |

## Get Senders

**GET** `/senders`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params: `limit` (max 100), `skip`, `folder` (email-sender folder UUID), `filter` (legacy filter string)

> **Note:** The response is a flat array of senders. It is **not** grouped by folder. The `owned_by` query parameter is not supported; use the `folder` (email-sender folder UUID) and `filter` query parameters if needed.

> Use `PATCH /senders/:id` with `folder` to move a sender into an email-sender folder, or pass an empty string to remove it from its folder. The `folder` field is **not** accepted when creating a sender.

## Get Single Sender Connection Link

**GET** `/senders/connect-link`

This endpoint does not create a sender. It returns a magic login link to the email-sender connection page in the SalesBlink web UI. Ways to connect a sender:
- **Gmail / Google Workspace**: use **POST** `/oauth/google` to get an authorization URL. The sender is created automatically after OAuth completion.
- **Microsoft 365 / Outlook**: use **POST** `/oauth/outlook` to get an authorization URL. The sender is created automatically after OAuth completion.
- **SMTP/IMAP, via the API**: use **POST** `/senders/add-sender` (one sender, JSON) or **POST** `/senders/add-bulk-senders` (CSV upload).
- **SMTP/IMAP, in the web UI**: request this endpoint and give the user the `login_link`. Prefer this when the user would rather not share mailbox passwords in the conversation.

Response (`LoginLinkResponse`):

```json
{
  "success": true,
  "message": "Please connect your email sender through the SalesBlink web UI.",
  "data": {
    "login_link": "https://run.salesblink.io/magic?token=eyJ...&redirect=%2Foutreach%2Femail-senders%3Faddsenders%3Dtrue",
    "destination": "/outreach/email-senders?addsenders=true",
    "purpose": "connect_sender"
  }
}
```


For existing senders, use **PATCH** `/senders/:id` to update settings such as warmup, inbox, signature, tracking, or folder.

## Add Sender (SMTP/IMAP)

**POST** `/senders/add-sender`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Creates one SMTP/IMAP sender. The credentials are tested in the background, not during the request (see [After adding](#after-adding-a-sender)).

Minimal body:
```json
{
  "from_email": "alex@mycompany.com",
  "password": "app-password",
  "smtp_host": "smtp.mycompany.com",
  "smtp_port": 465,
  "imap_host": "imap.mycompany.com",
  "imap_port": 993
}
```

> **Handle credentials carefully**: `password` / `imap_password` are mailbox secrets. Never echo them back to the user or write them into logs or files. Recommend an app password where the provider supports one. If the user prefers not to share a password, use `GET /senders/connect-link` instead.

### Connection fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `from_email` | string | ✓ | Sender address. Stored lowercased |
| `password` | string | ✓ | SMTP password. Also used for IMAP unless `imap_user_name` + `imap_password` are both given |
| `smtp_host` | string | ✓ | SMTP server host |
| `smtp_port` | integer | ✓ | SMTP port (e.g. `465`, `587`) |
| `from_name` | string | | Display name. Defaults to `"Admin User"` |
| `user_name` | string | | SMTP username. Defaults to `from_email` |
| `imap_host` | string | | IMAP server host. **Omit for an SMTP-only sender**: an SMTP-only sender can send, but it cannot receive replies, monitor the inbox or warm up |
| `imap_port` | integer | | IMAP port (e.g. `993`) |
| `imap_user_name` | string | | Separate IMAP username. Only used when `imap_password` is also set; otherwise IMAP uses `from_email` / `password` |
| `imap_password` | string | | Separate IMAP password. Only used together with `imap_user_name` |

### Warmup & inbox fields

Warmup only applies to senders with IMAP. If `imap_host` is set, inbox monitoring is always enabled.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `warmup_enabled` | boolean | `false` | Start warmup. Ignored for SMTP-only senders |
| `auto_ramp_up_enabled` | boolean | `true` | Ramp warmup volume up daily from the starting value to the max |
| `starting_warmup_frequency` | integer | `5` | Warmup emails on day one (1–50, capped at `max_daily_frequency`) |
| `total_warmup_per_day` | integer | `5` | Older name for the starting value; used only when `starting_warmup_frequency` is omitted |
| `ramp_up_frequency` | integer | `1` | Daily warmup increase (1–50, capped at `max_daily_frequency`) |
| `max_daily_frequency` | integer | `30` | Max warmup emails per day (1–50) |
| `warmup_tag` | string | `""` | Warmup keyword/tag |
| `inbox_path` | string | `"INBOX"` | IMAP inbox folder |
| `spam_path` | string | `""` | IMAP spam folder |

### Sequence sending fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `sequence_auto_ramp_up_enabled` | boolean | `false` | Ramp sequence volume up from the initial value to the max |
| `sequence_initial_daily_frequency` | integer | `30` | Starting daily sequence sends (min 1, capped at the max) |
| `sequence_ramp_up_frequency` | integer | `3` | Daily sequence-send increase (min 1, capped at the max) |
| `sequence_max_daily_frequency` | integer | `30` | Max daily sequence sends (min 1). `max_emails_per_day` is accepted as an alias |
| `pause_cold_emails_when_health_low` | boolean | `false` | Pause sequence sends when health drops below the threshold |
| `pause_cold_emails_health_threshold` | integer | `80` | Health score threshold |

The sender's daily sending limit starts at `sequence_initial_daily_frequency` when sequence ramp-up is on, otherwise at `sequence_max_daily_frequency`.

### Other fields

| Field | Type | Description |
|-------|------|-------------|
| `signature_id` | string | Signature ID **or** name (case-insensitive). Silently ignored if no signature matches |
| `custom_tracking_url` | string | Click-tracking domain, e.g. `track.mycompany.com`. A verified tracking domain in the account is used right away. Any other domain is registered as a tracking domain during connection and its DNS is checked (see `account-config.md`). If the domain belongs to another SalesBlink account, the connection fails |
| `dkim_identifier` | string | DKIM selector/identifier |
| `reply_to_email` | string | Reply-to address |

Notes:
- `folder` is not accepted here. Move the sender afterwards with `PATCH /senders/:id`.
- Booleans may be sent as `true` or `"true"`.
- camelCase aliases are also accepted: `email`, `senderName`, `smtpHost`, `smtpPort`, `smtpPassword`, `smtpUsername`, `imapHost`, `imapPort`, `imapUsername`, `imapPassword`, `autoRampUpEnabled`, `rampUpFrequency`, `maxDailyFrequency`, `startingWarmupFrequency`.

Response (`200`); `data` has the same shape as a `GET /senders` item and never includes passwords:
```json
{
  "success": true,
  "message": "Email Sender will be connected in a few minutes.",
  "data": {
    "id": "6c1f0b8e-3a5d-4e0f-9a51-2b7d8e4c1a90",
    "smtpImapEmail": "alex@mycompany.com",
    "senderType": "smtp",
    "serviceName": "smtpimap",
    "sendingEnabled": false,
    "receivingEnabled": false,
    "inboxEnabled": true
  }
}
```

`serviceName` is `"smtpimap"`, or `"smtponly"` when no `imap_host` was given.

Errors:

| Status | `message` | Cause |
|--------|-----------|-------|
| 400 | `from_email is required` (likewise `password`, `smtp_host`, `smtp_port`) | Missing required field |
| 403 | `Email sender limit reached. Limit: N` | The plan's sender limit is used up |
| 409 | `Sender already in use` | That address is already connected to SalesBlink, in this or another account, including as a Gmail/Outlook OAuth sender |

### After adding a sender

The connection is tested in the background, usually within a few minutes:
- **Success**: `sendingEnabled` becomes `true` (and `receivingEnabled` too, when IMAP is set). Check with `GET /senders`.
- **Failure** (wrong credentials, host or port): the sender stays disabled and the user is notified of the sender error. Fix the settings with `PATCH /senders/:id`, or have the user fix them in the web UI, then call `POST /senders/:id/reconnect`.

Only add a sender to a sequence once `sendingEnabled` is `true`.

## Add Senders in Bulk (CSV)

**POST** `/senders/add-bulk-senders`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `multipart/form-data`

Upload a CSV file in the form field **`csvFile`**. Each row is matched by `from_email` against the account's existing senders:
- **No match**: a new sender is created.
- **Match with an existing SMTP/IMAP sender**: that sender's settings are updated from the row.
- **Match with a Gmail/Outlook OAuth sender**: the row is skipped.

> **Requires `multipart/form-data`.** The JSON-only MCP gateway cannot upload this file. In that case, use `GET /senders/bulk-connect-link`, or the CLI: `salesblink senders add-bulk-senders --csv-file senders.csv`.

```bash
curl -X POST "https://run.salesblink.io/api/public/v1.0.0/senders/add-bulk-senders" \
  -H "Authorization: $SALESBLINK_API_KEY" \
  -F "csvFile=@senders.csv"
```

Example CSV:
```csv
from_email,from_name,user_name,password,smtp_host,smtp_port,imap_host,imap_port,warmup_enabled
alex@mycompany.com,Alex,alex@mycompany.com,app-password-1,smtp.mycompany.com,465,imap.mycompany.com,993,true
sam@mycompany.com,Sam,sam@mycompany.com,app-password-2,smtp.mycompany.com,465,,,false
```

The second row has an empty `imap_host`, so it is added as SMTP-only.

### CSV columns

The CSV uses the same column names as the single-sender body, **except for the warmup columns**, which use `warmup_*` names:

| Group | Columns |
|-------|---------|
| Connection | `from_email`, `password`, `smtp_host`, `smtp_port`, `from_name`, `user_name`, `imap_host`, `imap_port`, `imap_user_name`, `imap_password` |
| Warmup | `warmup_enabled`, `warmup_auto_ramp_up_enabled` (default `true`), `warmup_initial_daily_frequency` (default `5`), `warmup_ramp_up_frequency` (default `1`), `warmup_max_daily_frequency` (default `30`); frequencies 1–50 |
| Inbox | `inbox_enable`, `warmup_tag`, `inbox_path`, `spam_path` |
| Sequence | `sequence_auto_ramp_up_enabled`, `sequence_initial_daily_frequency`, `sequence_ramp_up_frequency`, `sequence_max_daily_frequency` (or `max_emails_per_day`), `pause_cold_emails_when_health_low`, `pause_cold_emails_health_threshold`; same defaults as the single-sender body |
| Other | `signature_id`, `custom_tracking_url`, `dkim_identifier`, `reply_to_email` |

CSV vs. the single-sender endpoint:
- **No per-row validation, and fewer defaults.** Fill in `from_email`, `password`, `smtp_host`, `smtp_port`, `from_name` and `user_name` on every row; `from_name` and `user_name` are **not** filled in from `from_email`.
- **SMTP-only rows**: include the `imap_host` column and leave it empty.
- **Inbox monitoring** is only enabled when the row sets `inbox_enable` to `true`. `warmup_enabled` only applies when IMAP is set.
- **Skipped rows**: blank `from_email`, rows whose `from_email` contains `Email address` (a template's example row), and later duplicates of the same `from_email` within the file.
- **Missing `from_email` header**: the whole upload fails.

Response (`200`):
```json
{
  "success": true,
  "data": null,
  "message": "Bulk senders uploaded successfully"
}
```

The response does not list the senders it created. Call `GET /senders` to see them. Each sender connects in the background as described in [After adding](#after-adding-a-sender).

Errors:

| Status | `message` |
|--------|-----------|
| 400 | `csvFile is required (multipart/form-data)` |
| 403 | `Bulk sender upload is not available on your plan.` |
| 403 | `Email sender limit reached. Limit: N` (checked before the upload) |

## Sender Lifecycle & Diagnostics

**POST** `/senders/:id/reconnect`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Re-queues a failed SMTP/IMAP sender for connection, or refreshes OAuth tokens for Gmail/Outlook senders.

**GET** `/senders/:id/health`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Returns sender health/reputation score and diagnostic info.

**GET** `/senders/:id/warmup-stats`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params: `days` (integer, max 90, default 30)

Returns date-wise warmup statistics for the sender.

**POST** `/senders/:id/fetch-messages`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Schedules an inbox fetch for the sender.

**POST** `/senders/multi/fetch-messages`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{ "ids": ["sender-id-1", "sender-id-2"] }
```

Bulk fetch messages across multiple senders.

## Get Bulk Sender Upload Link

**GET** `/senders/bulk-connect-link`

This endpoint returns a magic login link for uploading a sender CSV in the SalesBlink web UI. Use it when the CSV can't be sent as `multipart/form-data` (for example through the MCP gateway), or when the user prefers the UI. To upload the CSV through the API, use **POST** `/senders/add-bulk-senders`.

Calling **GET** `/senders/bulk-connect-link` returns a magic login link to the email-sender connection page:

```json
{
  "success": true,
  "message": "Please upload senders in bulk through the SalesBlink web UI.",
  "data": {
    "login_link": "https://run.salesblink.io/magic?token=...&redirect=%2Foutreach%2Femail-senders%3Faddsenders%3Dtrue",
    "destination": "/outreach/email-senders?addsenders=true",
    "purpose": "bulk_upload_senders"
  }
}
```

## Update Sender

**PATCH** `/senders/:id`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Pass any of the fields below to update specific sender settings. Only provided fields are updated.

### Warmup fields

| Field | Type | Description |
|-------|------|-------------|
| `warmup_enabled` | boolean | Enable/disable warmup |
| `warmup_urls` | array | Warmup link URLs |
| `warmup_templates` | array | Warmup template IDs |
| `auto_ramp_up_enabled` | boolean | Enable auto ramp-up |
| `ramp_up_frequency` | integer | Ramp-up increment |
| `max_daily_frequency` | integer | Max daily warmup emails |
| `starting_warmup_frequency` | integer | Starting warmup frequency |
| `open_rate` | integer | Target open rate % |
| `spam_protection` | integer | Spam protection level |
| `read_emulation` | integer | Read emulation level |
| `warmup_keyword` | string | Warmup keyword/tag |

### Sequence / sending fields

| Field | Type | Description |
|-------|------|-------------|
| `sequence_auto_ramp_up_enabled` | boolean | Enable sequence auto ramp-up |
| `sequence_initial_daily_frequency` | integer | Initial daily sequence sends |
| `sequence_ramp_up_frequency` | integer | Sequence ramp-up increment |
| `sequence_max_daily_frequency` | integer | Max daily sequence sends |
| `pause_cold_emails_when_health_low` | boolean | Pause cold emails when health is low |
| `pause_cold_emails_health_threshold` | integer | Health threshold to pause at |

### Inbox fields

| Field | Type | Description |
|-------|------|-------------|
| `inbox_enabled` | boolean | Enable inbox monitoring |
| `inbox_path` | string | Inbox folder path |
| `spam_path` | string | Spam folder path |

### Other fields

| Field | Type | Description |
|-------|------|-------------|
| `signature` | string | Signature ID or name |
| `reply_to` | string | Reply-to email address |
| `dkim_identifier` | string | DKIM identifier |
| `use_custom_tracking_domain` | boolean | Use custom tracking domain |
| `tracking_domain` | string | Tracking domain ID |
| `folder` | string | Email-sender folder ID to move the sender into. Must be a folder created with `type: "email-sender"`. Pass an empty string to remove from folder. |

Response:
```json
{
  "success": true,
  "message": "Sender settings updated successfully",
  "data": { ... }
}
```

## Warmup Links

**GET** `/warmup-links`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params: `limit` and `skip` are accepted for compatibility but currently have no effect — all matching links are returned.

List warmup link configurations. These URLs are used in sender warmup campaigns to improve deliverability.

## Google OAuth

**POST** `/oauth/google`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Body is optional. A custom `redirectUrl` in the body is ignored by the API.

Returns an `auth_url` that the user must visit to authorize Gmail access.

Response:
```json
{
  "success": true,
  "data": { "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?..." }
}
```

## Outlook OAuth

**POST** `/oauth/outlook`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Body is optional. A custom `redirectUrl` in the body is ignored by the API.

Returns an `auth_url` for Microsoft Outlook authorization.

Response:
```json
{
  "success": true,
  "data": { "auth_url": "https://login.microsoftonline.com/..." }
}
```
