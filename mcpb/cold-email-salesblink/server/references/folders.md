# Folders

SalesBlink has two kinds of folders:

- **General folders** — used for lists, templates, and sequences.
- **Email-sender folders** — used only for email senders.

Only include `type` when creating an email-sender folder. For general folders (lists, templates, sequences), do not include the `type` field.

## Endpoints

| Endpoint   | Method | Description     |
| ---------- | ------ | --------------- |
| `/folders` | GET | List folders — supports `type` filter: `all`, `general`, or `email-sender` |
| `/folders` | POST | Create a folder — returns `{ success: true }` only |

## Get Folders

**GET** `/folders`

Headers:

- `Authorization`: `SALESBLINK_API_KEY`

Query params: `limit` (max 100), `skip`, `search`, `type`

| `type` value | Result |
| ------------ | ------ |
| `all` | All folders (default if omitted) |
| `general` | Non-email-sender folders only |
| `email-sender` | Email-sender folders only |

## Create Folder

**POST** `/folders`

Headers:

- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:

```json
{
  "name": "Q1 Campaigns"
}
```

For an email-sender folder:

```json
{
  "name": "Warm Senders",
  "type": "email-sender"
}
```

| Field  | Type   | Req | Description                                               |
| ------ | ------ | --- | --------------------------------------------------------- |
| `name` | string | ✅  | Folder name                                               |
| `type` | string |     | Only include this field when creating an email-sender folder. For general folders, do not include this field. |

> **Response:** The API returns `{ success: true }` only. It does not return the created folder object.

> Only `"email-sender"` is accepted as a `type` value. Any other value is rejected.

## Folder assignment rules

- Lists, templates, and sequences can only be placed in **general folders** (folders created without a `type`).
- Email senders can only be placed in **email-sender folders** (folders created with `type: "email-sender"`).
- Use `PATCH /lists/:id`, `PATCH /templates/:id`, or `PATCH /sequences/:id` with `folder` to move a list, template, or sequence into a general folder (or pass an empty string to remove it from its folder).
- Use `PATCH /senders/:id` with `folder` to move an email sender into an email-sender folder (or pass an empty string to remove it from its folder).
