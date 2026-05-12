# Billing & Payment Methods

## Add Card Login Link

**POST** `/billing/add-card`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Generates a time-limited magic login link that redirects the user to the billing page where they can add a payment card.

Response:
```json
{
  "success": true,
  "message": "Add card login link generated successfully",
  "data": {
    "login_link": "https://run.salesblink.io/magic?token=...&redirect=%2Faccount%2Fbilling%3Ftab%3Dcard",
    "destination": "/account/billing?tab=card",
    "purpose": "add_card"
  }
}
```

## Remove Card Login Link

**POST** `/billing/remove-card`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Generates a time-limited magic login link that redirects the user to the billing page where they can remove their saved payment card.

Response:
```json
{
  "success": true,
  "message": "Remove card login link generated successfully",
  "data": {
    "login_link": "https://run.salesblink.io/magic?token=...&redirect=%2Faccount%2Fbilling%3Ftab%3Dcard",
    "destination": "/account/billing?tab=card",
    "purpose": "remove_card"
  }
}
```
