# Workflow Examples

## End-to-End Campaign Setup

Goal: Build a complete outreach campaign from scratch.

### Step 1 — Create a list

**POST** `/lists`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "name": "Q1 Prospects",
  "removeDuplicates": {
    "inThisList": true,
    "inOtherLists": true
  }
}
```

Extract `LIST_ID` from the response.

### Step 2 — Add leads to the list

**POST** `/contacts`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "list_id": "LIST_ID_HERE",
  "contacts": [
    { "Email": "alice@corp.com", "First_Name": "Alice", "Company": "Corp Inc" },
    { "Email": "bob@startup.io", "First_Name": "Bob", "Company": "Startup IO" }
  ],
  "remove_duplicates": true
}
```

### Step 3 — Create email templates

**POST** `/templates`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "name": "Intro Email",
  "subject_line": "Quick question, {{first_name}}",
  "content": "<p>Hi {{first_name}},</p><p>I noticed {{company}} is scaling fast...</p>"
}
```

Extract `TEMPLATE_1_ID` (MongoDB ObjectId). Repeat for follow-up templates.

### Step 4 — Fetch available senders

**GET** `/senders`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Extract target `SENDER_ID` (UUID).

### Step 5 — Create the sequence

**POST** `/sequences`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "name": "Q1 Outbound Campaign",
  "senders": "SENDER_ID_HERE",
  "lists": ["LIST_ID_HERE"],
  "steps": [
    { "type": "email", "template_id": "TEMPLATE_1_ID" },
    { "type": "delay", "days": 3 },
    { "type": "email", "template_id": "TEMPLATE_2_ID" }
  ],
  "paused": false,
  "launchTimingMode": "now"
}
```

## Clone and Modify Workflow

Goal: Duplicate an existing sequence and tweak it.

### 1. Clone the sequence (creates paused copy)

**POST** `/sequences/:id/clone`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`

Extract `NEW_SEQ_ID` from response.

### 2. Update the cloned sequence with new settings

**PATCH** `/sequences/:id`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "name": "Q1 Campaign — Variant B",
  "steps": [
    { "type": "email", "template_id": "NEW_TEMPLATE_ID" },
    { "type": "delay", "days": 5 },
    { "type": "email", "template_id": "FOLLOW_UP_TEMPLATE_ID" }
  ]
}
```

### 3. Launch when ready

**PATCH** `/sequences/:id`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "paused": false,
  "launchTimingMode": "now"
}
```

## Archive Cleanup Workflow

Goal: Clean up old campaigns, lists, and templates.

### Archive a sequence (pauses it and removes pending tasks)

**PUT** `/sequences/:id/archive`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{ "archived": true }
```

### Archive the associated list

**PUT** `/lists/:id/archive`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{ "archived": true }
```

### Archive templates

**PUT** `/templates/:id/archive`

Headers:
- `Authorization`: `SALESBLINK_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{ "archived": true }
```

> Archiving a sequence automatically pauses it and removes pending email tasks. Archiving a list pauses it if active. Archiving a contact removes its pending tasks from all sequences.
