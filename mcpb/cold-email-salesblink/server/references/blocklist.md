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
| `/unsubscribe/remove/preview` | POST | Dry run of `/unsubscribe/remove`: returns the entries that would be removed |
| `/unsubscribe/:id/delete-preview` | GET | Dry run of `DELETE /unsubscribe/:id`: returns the entry that would be deleted |

> **Through the hosted SalesBlink MCP connector (AI agents)**: only entries added by hand can be removed, one per request. Entries from unsubscribes, bounces or imports return `409` with `code: "BLOCKLIST_ENTRY_PROTECTED"`, and clearing the whole blocklist returns `403`. The account holder can remove those in the SalesBlink app. These limits do not apply to API-key requests.

> The preview routes need the `unsubscribes.read` scope; the other write routes need `unsubscribes.write`.

## List Blocklist

**GET** `/unsubscribe`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params:

| Param | Type | Description |
|-------|------|-------------|
| `limit` | integer | Maximum number of results (default: 50, capped at 100) |
| `skip` | integer | Offset for pagination — must be a multiple of `limit` (e.g. with `limit=50` use `skip=0`, `50`, `100`, …); non-multiples are rejected with a 400 error |
| `search` | string | Search query |
| `type` | string | Filter by entry type: `email` or `domain` |

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

> **Preview first**: removing an entry lets emails reach a contact who may have unsubscribed. Call **POST** `/unsubscribe/remove/preview` with the same body to see the matching entries (`data.entries[]`: `id`, `email`, `type`, `created_at`; `data.dry_run: true`) and confirm with the user before removing. For a single entry, use **GET** `/unsubscribe/:id/delete-preview`.

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
