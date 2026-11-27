# Account Config — Domains & Signatures

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/account/verify` | GET | Verify API key and return account info |
| `/login-link` | GET | Get a short-lived magic login link to the SalesBlink web UI |
| `/domains` | GET | List custom tracking domains (both verified and unverified with DNS setup instructions) |
| `/signatures` | GET | List email signatures |

## Verify Account

**GET** `/account/verify`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Returns account info and confirms the API key is valid.

## Magic Login Link

**GET** `/login-link`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

| Query param | Type | Description |
|-------------|------|-------------|
| `redirect_url` | string | Relative path or full URL on the app domain to open after login. Without it, the user lands on the app's default page after sign-in. URLs on another domain are ignored |
| `expiry_minutes` | integer | How long the link stays valid in minutes (default: 5). Values outside 1–30 are clamped |

Response:
```json
{
  "success": true,
  "message": "Login link generated successfully",
  "data": {
    "login_link": "https://run.salesblink.io/magic?code=sc_...&redirect=%2Foutreach%2Fsequences",
    "destination": "/outreach/sequences",
    "expiry_minutes": 5
  }
}
```

`destination` is only present when `redirect_url` is set.

> The link signs the user in to a full web session and can be used once. Give it only to the account holder, and never log or store it. Needs the `login_link` scope on a narrowed API key.

## Domains

**GET** `/domains`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query Parameters:
- `owned_by` (optional string): Filter by owner email (admin/owner only). Also accepts `ownedby`, `userID`, `uid`, or `user`.

List custom tracking domains for the account. Both verified and unverified domains are returned.

### Verification Status & Tag
- **Verified domains**: have `verified: true`, `status: "verified"`, `tag: "verified"`, and `instructions: null`.
- **Unverified domains**: have `verified: false`, `status: "not verified"`, `tag: "not verified"`, and include DNS setup `instructions` (`record_type`, `host`, `value`, `message`) to guide DNS configuration.

### DNS Instructions Details
- **Root/Apex domains** (e.g. `example.com`): require an `A` record with Host `@` pointing to `178.105.15.117`.
- **Subdomains** (e.g. `track.example.com`): require a `CNAME` record with Host (e.g. `track`) pointing to `cname.salesblink.io` (for click-tracker), `meet.salesblink.io` (for meet-link), or `run.salesblink.io` (for white-label).

### Response Example

```json
{
  "success": true,
  "message": "Custom domains retrieved successfully",
  "data": [
    {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "domain": "track.mycompany.com",
      "type": "click-tracker",
      "verified": false,
      "status": "not verified",
      "tag": "not verified",
      "instructions": {
        "record_type": "CNAME",
        "host": "track",
        "value": "cname.salesblink.io",
        "message": "Add a CNAME record for \"track.mycompany.com\" with Host \"track\" pointing to \"cname.salesblink.io\". It can take up to 24 hours for DNS changes to propagate."
      },
      "uid": "user_123",
      "owned_by": "alex@mycompany.com"
    },
    {
      "id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "domain": "clicks.mycompany.com",
      "type": "click-tracker",
      "verified": true,
      "status": "verified",
      "tag": "verified",
      "instructions": null,
      "uid": "user_123",
      "owned_by": "alex@mycompany.com"
    }
  ]
}
```

## Signatures

**GET** `/signatures`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

List email signatures.

> Signature IDs can be referenced when adding senders via the `signature_id` field. You can pass either the signature ID or its name.



Note: For GET domains, GET signatures, and GET warmup-links, you can use `owned_by`, `ownedby`, `userID`, `uid`, or `user` to filter by user.
