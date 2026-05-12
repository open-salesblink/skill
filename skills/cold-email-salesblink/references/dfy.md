# Done-For-You (DFY) — Domains & Mailboxes

Use these endpoints to purchase domains and provision Google Workspace / Microsoft 365 mailboxes with full deliverability setup.

> **Prerequisites**: A saved payment method is required. Trial plans cannot place DFY orders.

## Endpoints

| Endpoint                                    | Method | Description                                        |
| ------------------------------------------- | ------ | -------------------------------------------------- |
| `/domains/search`                           | GET    | Search available .com domains for DFY purchase     |
| `/dfy/orders`                               | POST   | Place a new DFY domain + mailbox order             |
| `/dfy/orders`                               | GET    | List all DFY orders                                |
| `/dfy/orders/:orderId/mailboxes`            | POST   | Add mailboxes to an existing order                 |
| `/dfy/orders/:orderId/mailboxes/:mailboxId` | DELETE | Cancel a mailbox (returns billing management link) |

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

## Place DFY Order

**POST** `/dfy/orders`

Headers:

- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

### Provider-specific payloads

#### Google Workspace (buy domain)

```json
{
  "domains": [
    {
      "domain": "mybrand.com",
      "isConnect": false,
      "mailboxes": [
        { "username": "john", "firstName": "John", "lastName": "Doe" },
        { "username": "jane", "firstName": "Jane", "lastName": "Smith" }
      ]
    }
  ],
  "type": "google",
  "password": "SecurePass123!",
  "redirectionUrl": "https://mybrand.com"
}
```

#### Google Workspace (connect existing domain)

```json
{
  "domains": [
    {
      "domain": "mybrand.com",
      "isConnect": true
    }
  ],
  "type": "google",
  "password": "SecurePass123!"
}
```

#### Microsoft 365 / Outlook (buy domain)

```json
{
  "domains": [
    {
      "domain": "mybrand.com",
      "isConnect": false,
      "mailboxes": [
        { "username": "sales", "firstName": "Sales", "lastName": "Team" }
      ]
    }
  ],
  "type": "outlook"
}
```

#### Azure (100 mailboxes per domain)

```json
{
  "domains": [
    {
      "domain": "mybrand.com",
      "mailboxes": [
        { "username": "user001", "firstName": "User", "lastName": "001" },
        { "username": "user002", "firstName": "User", "lastName": "002" }
        // ... 98 more mailboxes (exactly 100 total per domain)
      ]
    }
  ],
  "type": "azure"
}
```

### Fields

| Field              | Type   | Req | Description                                                                                                                            |
| ------------------ | ------ | --- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `domains`          | array  | ✅  | Array of domain objects (see below). Buy and Connect domains cannot be mixed.                                                          |
| `type`             | string | ✅  | Mailbox provider: `google`, `outlook`, or `azure`                                                                                      |
| `password`         | string |     | **Required for Google.** Common password for ALL mailboxes. Auto-generated if omitted for google buy domains with no custom mailboxes. |
| `redirectionUrl`   | string |     | Redirect URL for the domain                                                                                                            |
| `masterInboxEmail` | string |     | Master inbox email for admin access                                                                                                    |
| `couponCode`       | string |     | Optional Stripe coupon code                                                                                                            |

### Domain object

| Field       | Type    | Req | Description                                                                                                |
| ----------- | ------- | --- | ---------------------------------------------------------------------------------------------------------- |
| `domain`    | string  | ✅  | Domain name to purchase or connect                                                                         |
| `isConnect` | boolean |     | `false` = buy new domain (default), `true` = connect your own existing domain                              |
| `mailboxes` | array   |     | Array of mailbox objects. Required for all provider types. Each domain needs ≥1 for google/outlook, exactly 100 for azure. Optional for connect-domain orders. |

### Mailbox object

| Field       | Type   | Req | Description                                  |
| ----------- | ------ | --- | -------------------------------------------- |
| `username`  | string | ✅  | Mailbox username (with or without `@domain`) |
| `firstName` | string |     | First name                                   |
| `lastName`  | string |     | Last name                                    |

### Rules

- You cannot mix buy and connect domains in the same order.
- For **Google**, `password` is required. Each domain must have at least 1 mailbox in the `mailboxes` array.
- For **Outlook**, each domain must have at least 1 mailbox in the `mailboxes` array.
- For **Azure**, each domain must have exactly 100 mailboxes in the `mailboxes` array.
- For **connect domains** (`isConnect: true`), no `mailboxes` array is needed in the request; the system will provision admin mailboxes automatically.
- Connect domain orders return `nameservers` in the response. You must update your domain's nameservers before provisioning can begin.

### Response

Buy domain success:

```json
{
  "success": true,
  "message": "DFY order placed successfully",
  "data": {
    "id": "...",
    "type": "google",
    "status": "paid",
    "amount": 23.00,
    "domains": [...],
    "nameservers": null
  }
}
```

Connect domain success:

```json
{
  "success": true,
  "message": "DFY order placed successfully",
  "data": { ... },
  "notice": "This is a connect domain order. Please update your domain's nameservers..."
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

## Add Mailboxes to Order

**POST** `/dfy/orders/:orderId/mailboxes`

Headers:

- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:

```json
{
  "domainName": "mybrand.com",
  "emails": ["alice", "bob"],
  "password": "SecurePass123!"
}
```

| Field        | Type   | Req | Description                              |
| ------------ | ------ | --- | ---------------------------------------- |
| `domainName` | string | ✅  | Domain in the order to add mailboxes to  |
| `emails`     | array  | ✅  | Array of usernames (without `@domain`)   |
| `password`   | string |     | Password for new mailboxes (Google only) |

Rules:

- Cannot add mailboxes to Azure orders.
- Cannot add mailboxes to a domain where all mailboxes have been cancelled.
- Duplicate usernames are rejected.

## Cancel Mailbox

**DELETE** `/dfy/orders/:orderId/mailboxes/:mailboxId`

Headers:

- `Authorization`: `SALESBLINK_API_KEY`

Cancels a mailbox. Returns a billing management login link because subscription changes must be managed from the web UI.

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
