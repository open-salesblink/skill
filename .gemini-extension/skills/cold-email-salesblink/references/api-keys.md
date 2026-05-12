# API Key Management

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/keys` | GET | List all API keys for the account |
| `/keys` | POST | Create a new API key |
| `/keys/:id/refresh` | POST | Refresh an existing API key (deletes old, creates new) |
| `/keys/:id` | DELETE | Delete an API key |

## Get API Keys

**GET** `/keys`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Returns a list of all API keys associated with the account.

## Create API Key

**POST** `/keys`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{ "name": "Zapier Integration" }
```

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `name` | string | ✅ | A descriptive name for the API key |

## Refresh API Key

**POST** `/keys/:id/refresh`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

This endpoint generates a new API key and deletes the old one identified by `:id`. 

> [!WARNING]
> If you refresh the key you are currently using, you must update your integration immediately as the old key will be revoked.

## Delete API Key

**DELETE** `/keys/:id`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Deletes the specified API key.

> [!IMPORTANT]
> - You cannot delete the API key you are currently using.
> - At least one API key is required per account. If you want to replace your only key, use the Refresh endpoint instead.
