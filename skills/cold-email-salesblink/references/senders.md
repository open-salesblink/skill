# Email Senders & OAuth

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/senders` | GET | List all connected senders (grouped by folder) |
| `/senders` | POST | Add a single SMTP/IMAP sender |
| `/senders/bulk` | POST | Bulk add senders via CSV upload |
| `/oauth/google` | POST | Get Google OAuth URL for connecting Gmail |
| `/oauth/outlook` | POST | Get Microsoft OAuth URL for connecting Outlook |

## Get Senders

**GET** `/senders`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params: `limit` (max 100), `skip`, `owned_by`

## Add Single Sender (SMTP/IMAP)

**POST** `/senders`

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
| `smtp_port` | integer/string | ✅ | SMTP port (e.g., 587) |
| `from_name` | string | | Display name |
| `user_name` | string | | SMTP username (defaults to `from_email`) |
| `imap_host` | string | | IMAP hostname (omit for SMTP-only) |
| `imap_port` | integer/string | | IMAP port (e.g., 993) |
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

## Bulk Add Senders

**POST** `/senders/bulk`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `multipart/form-data`

Upload a CSV file via FormData with field name `csvFile`.

## Google OAuth

**POST** `/oauth/google`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

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

Returns an `auth_url` for Microsoft Outlook authorization.
