# Reports

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/reports` | GET | Retrieve activity reports with aggregated data |

## Get Reports

**GET** `/reports`

Headers:
- `Authorization`: `YOUR_API_KEY`

Query params:

| Param | Type | Description |
|-------|------|-------------|
| `from` | integer | Start date timestamp (milliseconds) |
| `to` | integer | End date timestamp (milliseconds) |
| `limit` | integer | Max 100 (default enforced server-side) |
| `skip` | integer | Offset |

> The endpoint maps `from`/`to` to a date range filter internally. Both are optional; omitting them returns all available report data.

**GET** `/reports?from=1715000000000&to=1717600000000`

Headers:
- `Authorization`: `YOUR_API_KEY`
