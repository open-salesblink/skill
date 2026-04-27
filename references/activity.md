# Activity Tracking

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sent` | GET | Log of all sent emails |
| `/opens` | GET | Email open events |
| `/clicks` | GET | Link click events |
| `/replies` | GET | Reply events |

## Query Parameters

All activity endpoints support:

| Param | Type | Description |
|-------|------|-------------|
| `per_page` | integer | Max 100 |
| `page` | integer | 1-indexed |
| `sequence_id` | string | Filter by sequence UUID |
| `recipient_email_address` | string | Filter by email address |
| `since` | integer | Filter events after this timestamp (ms) |
| `from` | integer | Start of date range (timestamp, ms) |
| `to` | integer | End of date range (timestamp, ms) |

> Use `per_page` and `page` for activity endpoints — not `limit`/`skip`.

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
- `Authorization`: `YOUR_API_KEY`

**GET** `/replies?since=TIMESTAMP_30_DAYS_AGO&per_page=100`

Headers:
- `Authorization`: `YOUR_API_KEY`
