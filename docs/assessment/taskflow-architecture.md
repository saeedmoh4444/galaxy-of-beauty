# TaskFlow — Architecture & Specification

**Purpose**: Complete the missing TaskFlow take-home assessment per the original requirements.  
**Implementation**: Separate repository (`taskflow-assessment`)  
**Stack**: Next.js 14 + REST API + Prisma + PostgreSQL + Redis + Socket.IO

## Data Model

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  passwordHash String
  createdAt DateTime @default(now())

  boardMembers BoardMember[]
  cards        Card[] // assigned cards
}

model Board {
  id        Int      @id @default(autoincrement())
  name      String
  createdAt DateTime @default(now())

  members   BoardMember[]
  columns   Column[]
}

model BoardMember {
  id       Int      @id @default(autoincrement())
  boardId  Int
  userId   Int
  role     String   @default("MEMBER") // OWNER | MEMBER
  joinedAt DateTime @default(now())

  board Board @relation(fields: [boardId], references: [id])
  user  User  @relation(fields: [userId], references: [id])

  @@unique([boardId, userId])
}

model Column {
  id        Int      @id @default(autoincrement())
  boardId   Int
  name      String   // "To Do" | "In Progress" | "Done"
  position  Float    // Fractional ranking for ordering
  createdAt DateTime @default(now())

  board Board  @relation(fields: [boardId], references: [id])
  cards Card[]

  @@unique([boardId, position])
}

model Card {
  id          Int      @id @default(autoincrement())
  columnId    Int
  title       String
  description String?
  assigneeId  Int?
  position    Float    // Fractional ranking within column
  version     Int      @default(1) // Optimistic concurrency
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  column   Column @relation(fields: [columnId], references: [id])
  assignee User?  @relation(fields: [assigneeId], references: [id])
  activity CardActivity[]

  @@unique([columnId, position])
}

model CardActivity {
  id        Int      @id @default(autoincrement())
  cardId    Int
  userId    Int
  action    String   // CREATED | MOVED | UPDATED | ASSIGNED | DELETED
  oldValue  Json?
  newValue  Json?
  createdAt DateTime @default(now())

  card Card @relation(fields: [cardId], references: [id])
}
```

## API Contract (REST + OpenAPI)

### Auth

```
POST   /api/auth/register     { email, password, name } → { user, token }
POST   /api/auth/login         { email, password } → { user, token }
POST   /api/auth/refresh       { refreshToken } → { accessToken, refreshToken }
GET    /api/auth/me            → { user }
```

### Boards

```
GET    /api/boards             → [{ board }]          // User's boards
POST   /api/boards             { name } → { board }
GET    /api/boards/:id         → { board, columns[], members[] }
PUT    /api/boards/:id         { name } → { board }
DELETE /api/boards/:id         → 204
POST   /api/boards/:id/members { userId, role } → { member }
DELETE /api/boards/:id/members/:userId → 204
```

### Columns

```
GET    /api/boards/:id/columns           → [{ column }]
POST   /api/boards/:id/columns           { name } → { column }
PUT    /api/boards/:id/columns/:colId     { name } → { column }
DELETE /api/boards/:id/columns/:colId     → 204
```

### Cards

```
GET    /api/boards/:id/cards                     → [{ card }]
POST   /api/columns/:colId/cards                 { title, description? } → { card }
GET    /api/cards/:id                             → { card, activity[] }
PUT    /api/cards/:id                             { title?, description?, assigneeId? } → { card }
DELETE /api/cards/:id                             → 204
POST   /api/cards/:id/move                        { columnId, position, version } → { card } | 409 Conflict
```

## Card Ordering Strategy

**Fractional ranking** with periodic rebalancing:

- New cards get `position = (prevPosition + nextPosition) / 2`
- When adjacent positions differ by <0.001, rebalance the column: reassign positions at intervals of 1000.0
- Card moves are **idempotent**: `POST /cards/:id/move` with `{ columnId, position, version }`
- Optimistic concurrency: if `version` doesn't match, return `409 Conflict`

## Real-time (Socket.IO)

| Channel           | Authorization     | Events                                                                                          |
| ----------------- | ----------------- | ----------------------------------------------------------------------------------------------- |
| `board:<boardId>` | Board member only | `card:created`, `card:updated`, `card:moved`, `card:deleted`, `column:created`, `member:joined` |

Realtime messages:

```json
{
  "entity": "card",
  "operation": "moved",
  "entityId": 42,
  "version": 7,
  "actor": { "id": 1, "name": "Saeed" },
  "timestamp": "2026-08-11T12:00:00Z",
  "data": { "columnId": 3, "position": 2500.0 }
}
```

Clients that detect a version gap (received version 7 but local state has version 4) must refetch board state via `GET /api/boards/:id/cards`.

## Testing Strategy

| Suite       | Tools                    | Scope                                                                 |
| ----------- | ------------------------ | --------------------------------------------------------------------- |
| Unit        | Vitest                   | Card ordering math, validation, auth helpers                          |
| Integration | Vitest + Supertest       | REST endpoints with ephemeral PostgreSQL                              |
| Component   | Vitest + Testing Library | React components (Board, Column, Card, CardForm)                      |
| E2E         | Playwright               | Drag-and-drop (keyboard + pointer), multi-client real-time, auth flow |
| Security    | Vitest                   | JWT algorithm pinning, board membership auth, rate limiting           |

## Infrastructure

- **Dockerfiles**: Non-root users, multi-stage builds for frontend and backend
- **Compose**: PostgreSQL + Redis + backend + frontend
- **CI**: Frozen install → format → lint → type-check → unit → integration → E2E → build → audit
- **Health checks**: `GET /api/health` → `{ status: "ok", db: "connected", redis: "connected" }`
