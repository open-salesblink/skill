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
      "Email": "john@example.com",
      "First_Name": "John",
      "Last_Name": "Doe",
      "Phone": "+1234567890",
      "Company": "Acme Inc",
      "Title": "VP Sales",
      "Custom_Field": "any value"
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
| `Email` | string | ✅ | Lead's email address |
| `First_Name` | string | | First name |
| `Last_Name` | string | | Last name |
| `Phone` | string | | Phone number |
| `Company` | string | | Company name |
| `Title` | string | | Job title |
| _(any key)_ | string | | Custom fields are supported |

> **Field naming**: Use **PascalCase with underscores** (`First_Name`, `Last_Name`, `Email`).

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
  "First_Name": "Updated",
  "Last_Name": "Name",
  "Title": "CTO"
}
```

Any standard or custom contact fields can be updated. System fields (`_id`, `id`, `list_id`, `account_id`, `user_id`, `accuracy`, `provider`, `custom_fields`, `removed_sequences`, `verification_required`, `archive_invalid_contacts`, `archive_risky_contacts`, `processing`, `completed`, `completedAt`, `last_modified`, `created_date`, `verification_blocked`, `didOpen`, `didClick`, `didReply`, `contactStats`, `retryCount`, `esg_name`, `archived`, `deleted`) **cannot** be modified.

If updating `Email`, it is automatically lowercased.

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
