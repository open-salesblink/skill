# Folders

## Endpoints

| Endpoint   | Method | Description     |
| ---------- | ------ | --------------- |
| `/folders` | GET | List folders — the public API currently returns only `email-sender` folders |
| `/folders` | POST | Create a folder — returns `{ success: true }` only |

## Get Folders

**GET** `/folders`

Headers:

- `Authorization`: `SALESBLINK_API_KEY`

> **Note:** The public API currently returns only `email-sender` folders regardless of any `type` query parameter. Other folder types (list, template, sequence) are not exposed through this v1 endpoint.

## Create Folder

**POST** `/folders`

Headers:

- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:

```json
{
  "name": "Q1 Campaigns",
  "type": "email-sender"
}
```

| Field  | Type   | Req | Description                                               |
| ------ | ------ | --- | --------------------------------------------------------- |
| `name` | string | ✅  | Folder name                                               |
| `type` | string | ✅  | The API only accepts `"email-sender"` for this endpoint   |

> **Response:** The API returns `{ success: true }` only. It does not return the created folder object.

> Any `type` value other than `"email-sender"` is ignored or converted by the API.
