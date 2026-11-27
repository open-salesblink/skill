# Lists

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/lists` | GET | Retrieve all lists. Query: `limit` (max 100), `skip`, `owned_by`, `folder` |
| `/lists/:id` | GET | Get a specific list by UUID — returns a single object `{ ... }` |
| `/lists/:id/leads` | GET | Get leads in a list — `total` reflects current page size |
| `/lists` | POST | Create a new list |
| `/lists/:id` | PATCH | Update a list |
| `/lists/:id/archive` | PUT | Archive or unarchive a list |

## Get List by ID

**GET** `/lists/:id` (UUID)

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

> **Note:** The API returns a single list object `{ ... }` for this endpoint.

> **List responses include `fields`**: an array of the list's columns (from its Complete View) in snake_case, e.g. `["first_name", "last_name", "email", "lead_score"]`. This applies to `GET /lists`, `GET /lists/:id`, and `POST /lists` responses.

> **`GET /lists/:id` includes `verification_status`**: `not_required` (verification is off), `running` (leads are being verified), `paused` (pending leads are blocked, usually because the account is out of verification credits until the next month), `done` (all leads verified), or `no_leads` (verification is on and the list is empty).

## Get Leads

**GET** `/lists/:id/leads?limit=100&skip=0`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Query params: `limit` (max 100), `skip`

> **Note:** `total` in the response reflects the number of leads in the current page, not the total count across all pages.

## Create List

**POST** `/lists`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "name": "Q1 Prospects"
}
```

Required fields marked with ✅:

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `name` | string | ✅ | List name |
| `folder` | string | | General folder ID (UUID). Must be a folder created without a `type` (i.e., not an email-sender folder). |
| `starred` | boolean | | Star the list (default: false) |
| `verification` | boolean | | Enable email verification ⚠️ **IRREVERSIBLE** |
| `archive_invalid` | boolean | | Auto-archive invalid emails ⚠️ **IRREVERSIBLE** |
| `archive_risky` | boolean | | Auto-archive risky emails ⚠️ **IRREVERSIBLE** |
| `source` | string | | Where the list's contacts come from: `csv_upload`, `crm_import`, `form_signup`, `existing_customer`, or `event_attendee`. Optional with an API key; **required** (400 otherwise) through the hosted SalesBlink MCP connector |
| `source_reference` | string | | The file, CRM, form or event the contacts come from, or how consent was obtained (max 500 characters). Required together with `source` through the hosted MCP connector |

## Update List

**PATCH** `/lists/:id` (UUID)

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "name": "Q2 Prospects Restructured",
  "folder": "folder_uuid",
  "starred": true,
  "archive_invalid": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | New name |
| `folder` | string | Move list to a general folder (a folder created without a `type`, not an email-sender folder) |
| `starred` | boolean | Star or unstar |
| `duplicate_removal` | boolean | Remove duplicates from this list |
| `duplicate_removal_other_list` | boolean | Remove contacts in other lists |
| `duplicate_removal_team_list` | boolean | Remove contacts in team members' lists |
| `verification` | boolean | Enable verification ⚠️ **IRREVERSIBLE** |
| `archive_invalid` | boolean | Archive invalid emails ⚠️ **IRREVERSIBLE** |
| `archive_risky` | boolean | Archive risky emails ⚠️ **IRREVERSIBLE** |

> Use `PUT /lists/:id/archive` for archiving — not this endpoint.

## Archive List

**PUT** `/lists/:id/archive`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{ "archived": true }
```

Set `"archived": false` to unarchive.

If a sequence uses the list, the request returns `409` with `code: "IN_USE"` and the sequences that use it. Nothing is changed. Tell the user which sequences use it, and only repeat the request with `"force": true` in the body (or `?force=true`) if they confirm:

```json
{
  "success": false,
  "code": "IN_USE",
  "message": "...",
  "sequences": [{ "id": "sequence_uuid", "name": "Q4 Outreach" }]
}
```
