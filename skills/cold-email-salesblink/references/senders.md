# Email Senders & OAuth

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/senders` | GET | List all connected senders (flat list, not grouped by folder) |
| `/senders` | POST | Add a single SMTP/IMAP sender. `folder` is accepted in the body but is **not persisted**. OAuth is preferred for Gmail/Outlook (`/oauth/google`, `/oauth/outlook`). |
| `/senders/bulk` | POST | Bulk add senders via CSV upload (multipart `csvFile` only) |
| `/senders/:id` | PATCH | Update sender settings (warmup, inbox, signature, tracking, etc.) |
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

Query params: `limit` (max 100), `skip`, `folder` (legacy folder UUID), `filter` (legacy filter string)

> **Note:** The response is a flat array of senders. It is **not** grouped by folder. The `owned_by` query parameter is not supported; use the legacy `folder` and `filter` parameters if needed.

> `folder` is **not persisted** when creating or updating a sender via `POST /senders` or `PATCH /senders/:id`.

## Add Single Sender (SMTP/IMAP)

**POST** `/senders`

> **Note:** This endpoint adds an SMTP/IMAP sender. For Gmail and Outlook, OAuth is preferred — use `/oauth/google` or `/oauth/outlook` to get an authorization URL and the sender is created automatically after OAuth completion. SMTP/IMAP can still be used if the user explicitly provides SMTP/IMAP credentials.

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "from_email": "outreach@yourcompany.com",
  "from_name": "Sales Team",
  "password": "your_password",
  "smtp_host": "smtp.yourprovider.com",
  "smtp_port": 587,
  "user_name": "outreach@yourcompany.com",
  "imap_host": "imap.yourprovider.com",
  "imap_port": 993
}
```

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `from_email` | string | ✅ | Sender email address |
| `password` | string | ✅ | SMTP/IMAP password |
| `smtp_host` | string | ✅ | SMTP server hostname |
| `smtp_port` | integer/string | ✅ | SMTP port (e.g. 587) |
| `from_name` | string | | Display name |
| `user_name` | string | | SMTP username (defaults to `from_email`) |
| `imap_host` | string | | IMAP hostname (omit for SMTP-only) |
| `imap_port` | integer/string | | IMAP port (e.g. 993) |
| `imap_user_name` | string | | IMAP username if different from SMTP |
| `imap_password` | string | | IMAP password if different from SMTP |
| `total_warmup_per_day` | integer | | Warmup emails per day (default: 5) |
| `warmup_enabled` | boolean | | Enable warmup (default: false) |
| `inbox_enable` | boolean | | Enable inbox (default: false) |
| `warmup_tag` | string | | Warmup keyword/tag |
| `inbox_path` | string | | Inbox folder path (default: "INBOX") |
| `spam_path` | string | | Spam folder path |
| `signature_id` | string | | Signature ID or name to attach |
| `custom_tracking_url` | string | | Custom tracking domain (must be verified) |
| `sequence_auto_ramp_up_enabled` | boolean | | Enable sequence ramp-up |
| `sequence_initial_daily_frequency` | integer | | Initial daily send limit (default: 30) |
| `sequence_ramp_up_frequency` | integer | | Ramp-up increment (default: 3) |
| `max_emails_per_day` | integer | | Max daily send limit (default: 30) |
| `dkim_identifier` | string | | DKIM identifier |
| `reply_to_email` | string | | Reply-to email address |

> If `imap_host` is omitted or empty, the sender is created as **SMTP-only** (`serviceName: "smtponly"`).

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

## Bulk Add Senders

**POST** `/senders/bulk`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `multipart/form-data`

Upload a CSV file via FormData with field name `csvFile`. JSON arrays of senders are **not** accepted.

> The CSV must contain the columns required for SMTP/IMAP sender creation (e.g. `from_email`, `from_name`, `password`, `smtp_host`, `smtp_port`, etc.).

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
