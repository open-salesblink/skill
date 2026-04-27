# Folders

## Endpoints

| Endpoint   | Method | Description     |
| ---------- | ------ | --------------- |
| `/folders` | GET    | List folders    |
| `/folders` | POST   | Create a folder |

## Get Folders

**GET** `/folders`

Headers:

- `Authorization`: `YOUR_API_KEY`

## Create Folder

**POST** `/folders`

Headers:

- `Authorization`: `YOUR_API_KEY`
- `Content-Type`: `application/json`

Body:

```json
{
  "name": "Q1 Campaigns",
  "type": "sequence"
}
```

| Field  | Type   | Req | Description                                               |
| ------ | ------ | --- | --------------------------------------------------------- |
| `name` | string | ✅  | Folder name                                               |
| `type` | string | ✅  | `"list"`, `"template"`, `"sequence"`, or `"email-sender"` |

> If `type` contains `"sender"`, it is automatically converted to `"email-sender"`.
