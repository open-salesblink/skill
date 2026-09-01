# Contacts & Leads

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/lists/:id/leads` | GET | Get leads in a list (paginated) |
| `/contacts` | POST | Add up to 500 leads to a list |
| `/contacts/remove` | POST | Remove a single lead by email from a list |
| `/leads/:id` | PATCH | Update lead fields |
| `/leads/:id/move` | PUT | Move a lead to a different list |
| `/contacts/:id/archive` | PUT | Archive or unarchive a contact |
| `/leads/activity` | GET | Get activity history for a lead by email query parameter |
| `/leads/:id/activity` | GET | Get activity history for a lead by ID |
| `/leads/:id/unsubscribe` | POST | Globally unsubscribe a lead from all sequences |

## Get Lead Activity by ID

**GET** `/leads/:id/activity`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params: `sequence_id`, `from`, `to` (Unix ms), `limit` (max 500), `skip`

Response: `{ success, data: [...], lead, count, skip, limit }`

## Get Lead Activity by Email

**GET** `/leads/activity?email=lead@example.com`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params: `email` (required), `sequence_id`, `from`, `to` (Unix ms), `limit` (max 500), `skip`

> Use this endpoint when you have the lead's email address but not the internal lead ID. Response shape is the same as `/leads/:id/activity`.

## Globally Unsubscribe Lead

**POST** `/leads/:id/unsubscribe`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Adds the lead to the global unsubscribe list and cancels pending tasks across all sequences.

## Get Leads

**GET** `/lists/:id/leads?limit=100&skip=0`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params: `limit` (max 100), `skip`

## Add Contacts

**POST** `/contacts`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "list_id": "a1b2c3d4-e5f6-7890-abcd-abcdef123456",
  "contacts": [
    {
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1234567890",
      "company_name": "Acme Inc",
      "job_title": "VP Sales",
      "custom_field": "any value"
    }
  ],
  "remove_duplicates": true
}
```

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `list_id` | string | ✅ | List UUID to add leads to |
| `contacts` | object[] | ✅ | Array of lead objects (**max 500 per request**) |
| `remove_duplicates` | boolean | | Remove duplicate emails after insert |

Each contact object:

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `email` | string | ✅ | Lead's email address |
| `first_name` | string | | First name |
| `last_name` | string | | Last name |
| `phone` | string | | Phone number |
| `company_name` | string | | Company name |
| `job_title` | string | | Job title |
| `starred` | boolean | | Mark/unmark the contact as starred. This is a contact setting, not a data field/column. |
| _(any key)_ | string | | Custom fields are supported |

> **Field naming**: All field names **must be snake_case** (`first_name`, `last_name`, `email`, `company_name`, `lead_score`). Requests with non-snake_case field names are rejected with a 400 error. New custom fields are automatically added to the list's columns. The `starred` boolean is a contact setting and is NOT added as a list column. Use `PUT /contacts/:id/archive` to archive/unarchive contacts.

## Remove Contact

**POST** `/contacts/remove`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "list_id": "a1b2c3d4-e5f6-7890-abcd-abcdef123456",
  "email": "john@example.com"
}
```

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `list_id` | string | ✅ | List UUID |
| `email` | string | ✅ | Email address of the lead to remove |

## Update Lead

**PATCH** `/leads/:id` (UUID)

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "first_name": "Updated",
  "last_name": "Name",
  "job_title": "CTO",
  "starred": true
}
```

Any standard or custom contact fields can be updated. All field names **must be snake_case**; requests with non-snake_case field names are rejected with a 400 error. System fields (`_id`, `id`, `list_id`, `account_id`, `user_id`, `accuracy`, `provider`, `custom_fields`, `removed_sequences`, `verification_required`, `archive_invalid_contacts`, `archive_risky_contacts`, `processing`, `completed`, `completedAt`, `last_modified`, `created_date`, `verification_blocked`, `didOpen`, `didClick`, `didReply`, `contactStats`, `retryCount`, `esg_name`, `archived`, `deleted`) **cannot** be modified.

Use the dedicated `starred` boolean property to mark/unmark the lead as starred; `starred` is a contact setting and is NOT added as a list column. Use `PUT /contacts/:id/archive` to archive/unarchive contacts.

If updating `email`, it is automatically lowercased.

## Move Lead

**PUT** `/leads/:id/move` (UUID)

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{ "list_id": "destination_list_uuid" }
```

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `list_id` | string | ✅ | Destination list UUID |

## Archive Contact

**PUT** `/contacts/:id/archive`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{ "archived": true }
```

> ⚠️ **The `:id` here is a MongoDB ObjectId** (24-char hex), NOT a UUID. This is the only contact endpoint that uses ObjectId.
