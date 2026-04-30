# Account Config — Domains, Signatures & Warmup Links

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

## Warmup Links

**GET** `/warmup-links`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

List warmup link configurations.
