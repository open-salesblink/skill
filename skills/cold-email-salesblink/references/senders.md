# Email Senders & OAuth

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/senders` | GET | List all connected senders (flat list, not grouped by folder) |
| `/senders/connect-link` | GET | Get a magic login link to the email-sender connection page in the SalesBlink web UI. |
| `/senders/bulk-connect-link` | GET | Get a magic login link to the bulk CSV sender upload page in the SalesBlink web UI. |
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

> **Important**: Adding new SMTP/IMAP senders through this API gateway is no longer supported. To connect a sender, use one of these options:
> - **Gmail / Google Workspace**: use **POST** `/oauth/google` to get an authorization URL. The sender is created automatically after OAuth completion.
> - **Microsoft 365 / Outlook**: use **POST** `/oauth/outlook` to get an authorization URL. The sender is created automatically after OAuth completion.
> - **SMTP/IMAP or bulk CSV**: request this endpoint to get a magic login link to the SalesBlink web UI at <https://run.salesblink.io/outreach/email-senders?addsenders=true>.

Response (`LoginLinkResponse`):

```json
{
  "success": true,
  "message": "Login link generated successfully",
  "data": {
    "login_link": "https://run.salesblink.io/magic?token=eyJ...&redirect=%2Foutreach%2Femail-senders%3Faddsenders%3Dtrue",
    "destination": "/outreach/email-senders?addsenders=true",
    "purpose": "connect_sender"
  }
}
```


For existing senders, use **PATCH** `/senders/:id` to update settings such as warmup, inbox, signature, tracking, or folder.

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

> **Important**: Bulk sender upload is not supported through this API gateway. To upload senders in bulk via CSV, request this endpoint to get a magic login link to the SalesBlink web UI at <https://run.salesblink.io/outreach/email-senders?addsenders=true>.

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
