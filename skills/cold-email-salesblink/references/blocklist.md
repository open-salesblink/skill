# Blocklist / Unsubscribe Management

Manage account-level unsubscribes and blocklisted emails/domains.

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/unsubscribe` | GET | List blocked emails and domains |
| `/unsubscribe` | POST | Add emails/domains to the blocklist |
| `/unsubscribe/remove` | POST | Remove emails/domains from the blocklist |
| `/unsubscribe/:id` | DELETE | Remove a single blocklist entry by ID |
| `/unsubscribe` | DELETE | Delete all blocklist entries |
| `/unsubscribe/check` | GET | Check if an email is blocked |

## List Blocklist

**GET** `/unsubscribe`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params:

| Param | Type | Description |
|-------|------|-------------|
| `limit` | integer | Maximum number of results (default: 50) |
| `skip` | integer | Offset for pagination |
| `search` | string | Search query |
| `type` | string | Filter by `email` or `domain` |

## Add to Blocklist

**POST** `/unsubscribe`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "emails": ["unwanted@example.com", "competitor.com"]
}
```

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `emails` | string[] | ✅ | Array of emails or domains to block |

## Remove from Blocklist

**POST** `/unsubscribe/remove`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "emails": ["unwanted@example.com", "competitor.com"]
}
```

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `emails` | string[] | ✅ | Array of emails or domains to unblock |

## Delete Blocklist Entry by ID

**DELETE** `/unsubscribe/:id`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

## Delete All Blocklist Entries

**DELETE** `/unsubscribe`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

> Use with caution — this removes every entry in the account blocklist.

## Check Blocklist

**GET** `/unsubscribe/check?email=foo@example.com`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params:

| Param | Type | Description |
|-------|------|-------------|
| `email` | string | Email address to check |

Returns whether the email is currently blocked.
