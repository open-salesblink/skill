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
