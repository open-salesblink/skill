# Email Templates

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/templates` | GET | List all templates (includes `cold_email_score`) |
| `/templates/:id` | GET | Get full template details + score breakdown |
| `/templates` | POST | Create a template |
| `/templates/:id` | PATCH | Update template content, attachments |
| `/templates/:id/archive` | PUT | Archive or unarchive a template |

## Create Template

**POST** `/templates`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "name": "Cold Outreach V1",
  "subject_line": "Quick question, {{first_name}}",
  "content": "<p>Hi {{first_name}},</p><p>I noticed {{company}} is scaling fast...</p>",
  "folder": "folder_id",
  "starred": false
}
```

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `name` | string | ✅ | Template name |
| `subject_line` | string | ✅ | Email subject (supports `{{variables}}`) |
| `content` | string | ✅ | HTML body (supports `{{first_name}}`, `{{company}}`, etc.) |
| `folder` | string | | Folder ID (UUID) |
| `starred` | boolean | | Star the template |
| `attachments` | file[] | | Files to attach (**max 3 total**). Use FormData field name `attachment` |

Response includes `cold_email_score`:
```json
{
  "score": 72.5,
  "rating": "Good",
  "details": {
    "word_count": 85,
    "personalization_count": 3,
    "link_count": 1,
    "image_count": 0,
    "question_count": 1,
    "spam_word_count": 0
  }
}
```

## Update Template

**PATCH** `/templates/:id` (ObjectId)

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "name": "Updated Template",
  "subject_line": "New subject {{first_name}}",
  "content": "<p>Updated content here</p>",
  "remove_attachments": ["old_file.pdf"]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | New template name |
| `subject_line` | string | New subject line |
| `content` | string | New HTML body |
| `starred` | boolean | Star/unstar |
| `attachments` | file[] | New files to **append** (total must not exceed 3). Use FormData field name `attachment` |
| `remove_attachments` | string[] | Names of existing attachments to **remove** |

> **IMPORTANT**: To remove attachments, use the `remove_attachments` array with file **names** — not the `attachments` field.

## Archive Template

**PUT** `/templates/:id/archive` (ObjectId)

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{ "archived": true }
```
