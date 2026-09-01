# Done-For-You (DFY) — Domains & Mailboxes

Use these endpoints to search domains and view existing Done-For-You orders.

> **Important**: Placing new DFY orders and adding mailboxes to an existing order must be done through the SalesBlink web UI. The API supports searching domains, listing orders, and canceling a mailbox (which returns a billing management link).

## Endpoints

| Endpoint                                    | Method | Description                                        |
| ------------------------------------------- | ------ | -------------------------------------------------- |
| `/domains/search`                           | GET    | Search available .com domains for DFY purchase     |
| `/dfy/orders`                               | GET    | List all DFY orders                                |
| `/dfy/order-link`                           | GET    | Get a magic login link to place a DFY order        |
| `/dfy/orders/:orderId/mailbox-link`         | GET    | Get a magic login link to add mailboxes to an order |
| `/dfy/orders/:orderId/mailboxes/:mailboxId/cancel-link` | GET | Get a magic login link to cancel a mailbox (billing management) |

## Placing Orders and Adding Mailboxes

`GET /dfy/order-link` and `GET /dfy/orders/:orderId/mailbox-link` return magic login links to the relevant page in the SalesBlink web UI:

**GET** `/dfy/order-link` response:

```json
{
  "success": true,
  "message": "Please place Done-For-You orders through the SalesBlink web UI.",
  "data": {
    "login_link": "https://run.salesblink.io/magic?token=...&redirect=%2Foutreach%2Femail-senders%3Faddsenders%3Dtrue",
    "destination": "/outreach/email-senders?addsenders=true",
    "purpose": "place_dfy_order"
  }
}
```

**GET** `/dfy/orders/:orderId/mailbox-link` response:

```json
{
  "success": true,
  "message": "Please manage mailbox subscriptions through the SalesBlink web UI.",
  "data": {
    "login_link": "https://run.salesblink.io/magic?token=...&redirect=%2Faccount%2Fbilling%3Ftab%3Dsubscriptions",
    "destination": "/account/billing?tab=subscriptions",
    "purpose": "manage_subscriptions"
  }
}
```

## Search Domains

**GET** `/domains/search`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params:
- `keyword` (required) — domain name to search (e.g. `mybrand` or `mybrand.com`). Only `.com` domains are supported.

Returns up to 10 available `.com` domains with pricing and workspace availability.

Response:
```json
{
  "success": true,
  "message": "Domain search completed successfully",
  "data": [
    {
      "domain": "mybrand.com",
      "price": 15.00,
      "status": "available",
      "google_workspace_available": true,
      "ms365_workspace_available": true
    }
  ]
}
```

## List DFY Orders

**GET** `/dfy/orders`

Headers:

- `Authorization`: `SALESBLINK_API_KEY`

Response:

```json
{
  "success": true,
  "message": "DFY orders retrieved successfully",
  "data": [
    {
      "id": "...",
      "type": "google",
      "status": "paid",
      "amount": 23.00,
      "domains": [...],
      "nameservers": null
    }
  ]
}
```

## Get Mailbox Cancel Link

**GET** `/dfy/orders/:orderId/mailboxes/:mailboxId/cancel-link`

Headers:

- `Authorization`: `SALESBLINK_API_KEY`

Returns a billing management login link because subscription changes must be managed from the web UI.

Response:

```json
{
  "success": true,
  "message": "Please manage your mailbox subscription from the billing page.",
  "data": {
    "login_link": "https://run.salesblink.io/magic?token=...&redirect=%2Faccount%2Fbilling%3Ftab%3Dsubscriptions",
    "destination": "/account/billing?tab=subscriptions",
    "purpose": "manage_subscriptions"
  }
}
```

To place a new DFY order or add mailboxes to an order, open the SalesBlink app and go to the email-sender connection flow.
