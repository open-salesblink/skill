# Analytics

Cross-campaign and account-level analytics endpoints.

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analytics/overall` | GET | Overall stats across all sequences |
| `/analytics/daily` | GET | Day-wise overall stats |
| `/analytics/lead-stats` | GET | Lead-level stats |
| `/analytics/mailbox-stats` | GET | Overall mailbox stats |

## Overall Analytics

**GET** `/analytics/overall`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params:

| Param | Type | Description |
|-------|------|-------------|
| `from` | integer | Start date timestamp (milliseconds) |
| `to` | integer | End date timestamp (milliseconds) |

Returns aggregated stats (sent, opens, clicks, replies, bounces, unsubscribes) across all sequences.

## Daily Analytics

**GET** `/analytics/daily`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params:

| Param | Type | Description |
|-------|------|-------------|
| `from` | integer | Start date timestamp (milliseconds) |
| `to` | integer | End date timestamp (milliseconds) |
| `timezone` | string | IANA timezone (e.g. `America/New_York`) |

Returns day-wise aggregated stats.

## Lead Stats

**GET** `/analytics/lead-stats`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params:

| Param | Type | Description |
|-------|------|-------------|
| `from` | integer | Start date timestamp (milliseconds) |
| `to` | integer | End date timestamp (milliseconds) |
| `limit` | integer | Maximum number of results (default: 100) |
| `skip` | integer | Offset for pagination |

Returns per-lead activity statistics.

## Mailbox Stats

**GET** `/analytics/mailbox-stats`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params:

| Param | Type | Description |
|-------|------|-------------|
| `from` | integer | Start date timestamp (milliseconds) |
| `to` | integer | End date timestamp (milliseconds) |
| `limit` | integer | Maximum number of results (default: 100) |
| `skip` | integer | Offset for pagination |

Returns per-sender/mailbox performance statistics.
