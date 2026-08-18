# Activity Tracking

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sent` | GET | Log of all sent emails |
| `/opens` | GET | Email open events |
| `/clicks` | GET | Link click events |
| `/replies` | GET | Reply events |
| `/leads/:id/activity` | GET | Activity history for a specific lead |

## Query Parameters

The `/sent`, `/opens`, `/clicks`, and `/replies` endpoints support:

| Param | Type | Description |
|-------|------|-------------|
| `per_page` | integer | Max 100 |
| `page` | integer | 1-indexed |
| `sequence_id` | string | Filter by sequence UUID |
| `recipient_email_address` | string | Filter by email address |
| `since` | integer | Filter events after this timestamp (ms) |
| `from` | integer | Start of date range (timestamp, ms) |
| `to` | integer | End of date range (timestamp, ms) |

> Use `per_page` and `page` for these activity endpoints — not `limit`/`skip`.
> `/leads/:id/activity` uses `limit`/`skip` instead (see Lead Activity section below).

## Response Format

Each event includes:
```json
{
  "id": "...",
  "time": 1715000000000,
  "message": "Sent",
  "type": "outreach",
  "sequence": "sequence-uuid",
  "email": "lead@example.com",
  "sequence_name": "Campaign Name"
}
```

For clicks and replies, `template_name` is also included.

## Examples

**GET** `/opens?sequence_id=SEQ_ID&per_page=100&page=1`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

**GET** `/replies?since=TIMESTAMP_30_DAYS_AGO&per_page=100`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

## Lead Activity

**GET** `/leads/:id/activity`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params:

| Param | Type | Description |
|-------|------|-------------|
| `sequence_id` | string | Filter by sequence UUID |
| `from` | integer | Start of date range (timestamp, ms) |
| `to` | integer | End of date range (timestamp, ms) |
| `limit` | integer | Maximum number of results (max 500) |
| `skip` | integer | Offset for pagination |

Returns the activity history for a specific lead across sequences.
