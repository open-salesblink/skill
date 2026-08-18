# Account Config — Domains & Signatures

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/account/verify` | GET | Verify API key and return account info |
| `/domains` | GET | List custom tracking domains |
| `/signatures` | GET | List email signatures |

## Verify Account

**GET** `/account/verify`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Returns account info and confirms the API key is valid.

## Domains

**GET** `/domains`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

List custom tracking domains for the account.

## Signatures

**GET** `/signatures`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

List email signatures.

> Signature IDs can be referenced when adding senders via the `signature_id` field. You can pass either the signature ID or its name.



Note: For GET domains, GET signatures, and GET warmup-links, you can use `owned_by`, `ownedby`, `userID`, `uid`, or `user` to filter by user.
