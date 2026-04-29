# Sequences

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sequences` | GET | List all sequences. Query: `limit`, `skip`, `owned_by` |
| `/sequences/:id` | GET | Get sequence details including steps and settings |
| `/sequences/:id/stats` | GET | Get performance analytics. Query: `from`, `to`, `sender` |
| `/sequences` | POST | Create a full sequence with steps, senders, lists |
| `/sequences/:id` | PATCH | Update settings, pause/resume, rewrite steps |
| `/sequences/:id/clone` | POST | Duplicate an existing sequence (created paused) |
| `/sequences/:id/archive` | PUT | Archive or unarchive a sequence |

## Create Sequence

**POST** `/sequences`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "name": "Q1 Outbound Campaign",
  "senders": "a1b2c3d4-e5f6-7890-abcd-000000000001,a1b2c3d4-e5f6-7890-abcd-000000000002",
  "lists": ["b2c3d4e5-f6a7-8901-bcde-000000000001"],
  "steps": [
    { "type": "email", "template_id": "507f1f77bcf86cd799439011" },
    { "type": "delay", "days": 3 },
    { "type": "email", "template_id": "507f1f77bcf86cd799439012" }
  ],
  "paused": false,
  "launchTimingMode": "now",
  "timezone": "America/New_York",
  "delayEnabled": true,
  "delayFrom": 10,
  "delayTo": 20,
  "stopWhenReplyRecieved": true,
  "stopWhenReplyRecievedWhen": "contact"
}
```

Required fields marked with ✅:

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `name` | string | ✅ | Sequence name |
| `senders` | string | ✅ | **Comma-separated string** of sender/folder IDs (NOT an array) |
| `lists` | string[] | ✅ | Array of list UUIDs |
| `steps` | Step[] | ✅ | Ordered array of email and delay steps |
| `folder` | string | | Folder ID (UUID) |
| `starred` | boolean | | Star the sequence |
| `paused` | boolean | | Create in paused state (default: **true**) |
| `launchTimingMode` | string | | `"now"` (starts in 5 mins) or `"schedule"` (requires `scheduledAt`) |
| `scheduledAt` | integer | | UTC timestamp in **milliseconds** (required if mode = `"schedule"`) |
| `timezone` | string | | Timezone for sending (default: `"America/New_York"`) |
| `delayEnabled` | boolean | | Enable random delay between emails (default: true) |
| `delayFrom` | integer | | Minimum delay in minutes (default: 10) |
| `delayTo` | integer | | Maximum delay in minutes (default: 20) |
| `stopWhenReplyRecieved` | boolean | | Stop sequence when lead replies (default: true) |
| `stopWhenReplyRecievedWhen` | string | | `"contact"` or `"contact-with-same-domain"` (default: `"contact"`) |
| `evergreen` | boolean | | Enable evergreen mode — continuously running (default: false) |
| `bounceThreshold` | integer | | Bounces before pausing (default: 2) |
| `bouncePause` | boolean | | Pause sequence on bounce threshold (default: false) |
| `autoPause` | boolean | | Auto-pause on high bounce rate (default: true) |
| `autoTagReplies` | boolean | | Auto-tag reply outcomes (default: false) |
| `plainText` | boolean | | Send as plain text email (default: true) |
| `auto_reply` | boolean | | Enable auto-reply detection (default: true) |
| `matchProvider` | boolean | | Match sender email provider with recipient (default: true) |
| `skip_esg` | boolean | | Skip ESG detection (default: true) |
| `sendToOnlyVerifiedEmail` | boolean | | Only send to verified emails (default: false) |
| `validEmail` | boolean | | Send to contacts with valid email status (default: true) |
| `riskyEmail` | boolean | | Send to contacts with risky email status (default: true) |
| `invalidEmail` | boolean | | Send to contacts with invalid email status (default: true) |
| `checkEmailOpen` | boolean | | Check if recipient opened previous email before sending next (default: false) |
| `checkEmailClick` | boolean | | Check if recipient clicked link before sending next (default: false) |
| `checkEmailReply` | boolean | | Check if recipient replied before sending next (default: true) |
| `checkEmailBeforeSending` | boolean | | Verify email before sending (default: true) |
| `bcc` | string | | BCC email address for all outgoing emails (default: `""`) |
| `emailSendingHours` | array | | Sending hours per day of the week (see default below) |

**Steps structure** — ordered array mixing `email` and `delay` types:

```json
"steps": [
  { "type": "email", "template_id": "507f1f77bcf86cd799439011" },
  { "type": "delay", "days": 3 },
  { "type": "email", "template_id": "507f1f77bcf86cd799439012" }
]
```

- `type: "email"` → MUST include `template_id` (the template's MongoDB ObjectId).
- `type: "delay"` → MUST include `days` (integer, number of days to wait).
- Omitting `type` or misspelling it will fail or create a broken sequence.

**Default `emailSendingHours`:**
```json
[
  { "enabled": true, "name": "Monday", "fromTime": "09:00", "toTime": "17:00" },
  { "enabled": true, "name": "Tuesday", "fromTime": "09:00", "toTime": "17:00" },
  { "enabled": true, "name": "Wednesday", "fromTime": "09:00", "toTime": "17:00" },
  { "enabled": true, "name": "Thursday", "fromTime": "09:00", "toTime": "17:00" },
  { "enabled": true, "name": "Friday", "fromTime": "09:00", "toTime": "17:00" },
  { "enabled": false, "name": "Saturday", "fromTime": "09:00", "toTime": "17:00" },
  { "enabled": false, "name": "Sunday", "fromTime": "09:00", "toTime": "17:00" }
]
```

## Update Sequence

**PATCH** `/sequences/:id` (UUID)

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{ "paused": true }
```

Accepts the same fields as create (all optional). Additionally used to **pause/resume**.

> **Critical**: When updating `steps`, the entire array is **replaced** — send the full desired step list.

> Updates to `name`, `starred`, or `folder` do **not** trigger task rescheduling. All other field updates do.

## Clone Sequence

**POST** `/sequences/:id/clone` (UUID)

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Creates a paused duplicate of an existing sequence.

## Archive Sequence

**PUT** `/sequences/:id/archive` (UUID)

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{ "archived": true }
```

Archiving a sequence automatically pauses it and removes pending email tasks.
