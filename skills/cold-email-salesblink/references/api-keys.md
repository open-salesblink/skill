# API Key Management

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/keys` | GET | List all API keys for the account |
| `/keys/create-link` | GET | Get a magic login link to the API keys page in the SalesBlink web UI |
| `/keys/:id/refresh-link` | GET | Get a magic login link to refresh an API key in the SalesBlink web UI |
| `/keys/:id` | DELETE | Delete an API key |

## Get API Keys

**GET** `/keys`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Returns a list of all API keys associated with the account.

## Get API Key Creation Link

**GET** `/keys/create-link`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

> **Important**: Creating an API key through this API gateway is no longer supported. **GET** `/keys/create-link` returns a magic login link to the API keys page in the SalesBlink web UI:

```json
{
  "success": true,
  "message": "Please manage API keys through the SalesBlink web UI.",
  "data": {
    "login_link": "https://run.salesblink.io/magic?token=...&redirect=%2Faccount%2Fintegration%2Fapi",
    "destination": "/account/integration/api",
    "purpose": "manage_api_keys"
  }
}
```

## Get API Key Refresh Link

**GET** `/keys/:id/refresh-link`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

> **Important**: Refreshing an API key through this API gateway is no longer supported. **GET** `/keys/:id/refresh-link` returns a magic login link to the API keys page in the SalesBlink web UI:

```json
{
  "success": true,
  "message": "Please refresh API keys through the SalesBlink web UI.",
  "data": {
    "login_link": "https://run.salesblink.io/magic?token=...&redirect=%2Faccount%2Fintegration%2Fapi",
    "destination": "/account/integration/api",
    "purpose": "manage_api_keys"
  }
}
```

## Delete API Key

**DELETE** `/keys/:id`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Deletes the specified API key.

> [!IMPORTANT]
> - You cannot delete the API key you are currently using.
> - At least one API key is required per account. If you want to replace your only key, use the Refresh endpoint instead.
