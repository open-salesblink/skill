# Inbox & Outreach

## Endpoints

| Endpoint                   | Method | Description                                     |
| -------------------------- | ------ | ----------------------------------------------- |
| `/inbox`                   | GET    | Retrieve inbox threads                          |
| `/inbox/:messageId/thread` | GET    | Get all messages in a specific thread           |
| `/inbox/:messageId/reply`  | POST   | Reply to a lead's email                         |
| `/inbox/:messageId`        | PATCH  | Mark as read/unread, set outcome classification |

## Get Inbox

**GET** `/inbox`

Headers:

- `Authorization`: `SALESBLINK_API_KEY`

Query params:

| Param      | Type    | Description                                               |
| ---------- | ------- | --------------------------------------------------------- |
| `type`     | string  | `all` (replies, default), `draft`, `scheduled`, or `sent` |
| `limit`    | integer | Max 100 (default: 10)                                     |
| `skip`     | integer | Offset (default: 0)                                       |
| `sequence` | string  | Filter by sequence UUID                                   |
| `outcome`  | string  | Filter by outcome classification                          |
| `search`   | string  | Search in body, subject, or email address                 |
| `date`     | string  | Date range as `startTimestamp-endTimestamp`               |
| `sender`   | string  | Filter by sender ID                                       |
| `owned_by` | string  | Filter by user email (owners/admins only)                 |

```
GET /inbox?type=all&limit=50&skip=0
GET /inbox?type=sent&sequence=SEQ_ID&limit=100
GET /inbox?search=acme&limit=20
```

Response includes `data.result` (thread array), `totalCount`, `count`, and `messageIDs`.

## Get Thread

**GET** `/inbox/:messageId/thread`

Headers:

- `Authorization`: `SALESBLINK_API_KEY`

Returns all messages in a conversation thread, sorted newest first.

## Reply to Email

**POST** `/inbox/:messageId/reply`

Headers:

- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:

```json
{
  "content": "<p>Thanks for getting back to me! Let's schedule a call.</p>",
  "cc": "manager@company.com"
}
```

| Field              | Type    | Req | Description                                             |
| ------------------ | ------- | --- | ------------------------------------------------------- |
| `content`          | string  | ✅  | HTML content of the reply                               |
| `cc`               | string  |     | Optional CC email address                               |
| `bcc`              | string  |     | Optional BCC email address                              |
| `scheduled_time`   | integer |     | Schedule at this timestamp (ms). Defaults to ~20s delay |
| `tzMode`           | string  |     | Timezone mode: `"sequence"` or `"custom"`               |
| `selectedTimezone` | string  |     | Timezone identifier if tzMode is custom                 |

> Attachments are supported via FormData field `attachment`. Base64 images in HTML are automatically uploaded to S3.
> The reply is automatically sent from the same sender that originally contacted the lead.

## Update Mail State

**PATCH** `/inbox/:messageId`

Headers:

- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:

```json
{
  "unread": false,
  "outcome": "interested"
}
```

| Field     | Type    | Description                                                                                                                                                              |
| --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `unread`  | boolean | Mark as read (`false`) or unread (`true`)                                                                                                                                |
| `outcome` | string  | Classify the reply: `"interested"`, `"not-interested"`, `"automatic-response"`, `"meeting-request"`, `"out-of-office"`, `"do-not-contact"`, `"wrong-person"`, `"closed"` |
