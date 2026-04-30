# Inbox Placement Tests

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/inbox-placement` | GET | List deliverability tests |
| `/inbox-placement` | POST | Create a new deliverability test |
| `/inbox-placement/:id/pause` | PUT | Pause an active **recurring** test |
| `/inbox-placement/:id` | DELETE | Delete a test |

## Get Tests

**GET** `/inbox-placement`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params:

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Filter by test name (case-insensitive) |
| `status` | string | Filter by status: `pending`, `running`, `completed`, `stopped` |
| `mode` | string | Filter by mode: `one-time`, `recurring` |
| `ownedBy` | string | Filter by user ID |
| `limit` | integer | Page size (default: 10) |
| `skip` | integer | Offset (default: 0) |
| `sortBy` | string | Sort field (default: `created_at`) |
| `sortType` | integer | `-1` for descending, `1` for ascending |

> Note: filtering by `status=completed` excludes recurring tests since they never truly complete.

## Create Test

**POST** `/inbox-placement`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `name` | string | ✅ | Test name (min 3 characters) |
| `mode` | string | ✅ | `"one-time"` or `"recurring"` |
| `source` | string | ✅ | `"from-salesblink"` or `"from-outside"` |
| `sender_id` | string | ✅* | Sender UUID (required when `source="from-salesblink"` or `mode="recurring"`) |
| `content_type` | string | ✅* | `"custom"`, `"sequence"`, or `"template"` (required when `source="from-salesblink"` or `mode="recurring"`) |
| `subject` | string | ✅* | Email subject (required when `content_type="custom"`) |
| `body` | string | ✅* | Email HTML body (required when `content_type="custom"`) |
| `sequence_id` | string | ✅* | Sequence UUID (required when `content_type="sequence"`) |
| `template_id` | string | ✅* | Template ObjectId (required when `content_type="sequence"` or `"template"`) |
| `schedule_day` | integer | ✅* | Day of week: `0`=Sunday through `6`=Saturday (required when `mode="recurring"`) |
| `tracking_uuid` | string | | Optional UUID for `from-outside` tests. Auto-generated if omitted. |

> *Field requirement depends on `source`, `mode`, and `content_type` values.

**Behavior:**
- **One-time tests** run ~2 minutes after creation by default.
- **Recurring tests** run weekly on the specified `schedule_day` at 09:00 UTC.
- **`from-outside` tests** return `seed_emails` in the response — these are the addresses the user must send to.
- **`from-salesblink` tests** send automatically using the selected sender.

**V1 Wrapper behavior:** When `source="from-salesblink"` is provided without `content_type`:
- If `subject` and `body` are present → `content_type` becomes `"custom"`
- Otherwise → `content_type` becomes `"sequence"` with `sequence_id: "from_api"`

### Example: One-time custom content test

**POST** `/inbox-placement`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "name": "Gmail Deliverability Check",
  "mode": "one-time",
  "source": "from-salesblink",
  "sender_id": "sender-uuid-here",
  "content_type": "custom",
  "subject": "Hello from SalesBlink",
  "body": "<p>This is a test email.</p>"
}
```

### Example: Recurring sequence-based test

**POST** `/inbox-placement`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "name": "Weekly Sequence Check",
  "mode": "recurring",
  "source": "from-salesblink",
  "sender_id": "sender-uuid-here",
  "content_type": "sequence",
  "sequence_id": "sequence-uuid-here",
  "template_id": "507f1f77bcf86cd799439011",
  "schedule_day": 1
}
```

### Example: From-outside test (returns seed emails)

**POST** `/inbox-placement`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "name": "External Send Test",
  "mode": "one-time",
  "source": "from-outside"
}
```

Response for `from-outside`:
```json
{
  "success": true,
  "data": { "id": "...", "tracking_uuid": "...", ... },
  "seed_emails": ["seed1@test.com", "seed2@test.com", ...]
}
```

## Pause Test

**PUT** `/inbox-placement/:id/pause`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Only works on **recurring** tests. Sets status to `stopped` and clears scheduling.

## Delete Test

**DELETE** `/inbox-placement/:id`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Deletes the test and all associated tracking tasks.
