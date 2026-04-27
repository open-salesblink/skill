# Organization — Users & Workspaces

## Users

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/users` | GET | List workspace users |
| `/users` | POST | Invite a user |
| `/users/:id` | PATCH | Update user name or role |

### Create User

**POST** `/users`

Headers:
- `Authorization`: `YOUR_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "email": "newmember@company.com",
  "role": "user",
  "url": "https://run.salesblink.io/dashboard"
}
```

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `email` | string | ✅ | Email address of the new user |
| `role` | string | | `"client"`, `"user"`, `"admin"`, or `"developer"`. Default: `"user"` |
| `url` | string | | Optional redirect URL after accepting invitation |

> Only **owners and admins** can add users. Returns 403 otherwise.

### Update User

**PATCH** `/users/:id` (UUID)

Headers:
- `Authorization`: `YOUR_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{
  "name": "Updated Name",
  "role": "admin"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | New display name |
| `role` | string | One of: `client`, `user`, `admin`, `developer` |

---

## Workspaces

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/workspaces` | GET | List all accessible workspaces |
| `/workspaces` | POST | Create a new workspace |
| `/workspaces/:id` | PATCH | Update workspace name |

> **Owner only.** Returns 403 for non-owners.

### Create Workspace

**POST** `/workspaces`

Headers:
- `Authorization`: `YOUR_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{ "name": "Sales Team" }
```

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `name` | string | ✅ | Workspace name (min 4 characters) |

### Update Workspace

**PATCH** `/workspaces/:id` (UUID)

Headers:
- `Authorization`: `YOUR_API_KEY`
- `Content-Type`: `application/json`

Body:
```json
{ "name": "New Workspace Name" }
```

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `name` | string | ✅ | New workspace name (min 4 characters) |
