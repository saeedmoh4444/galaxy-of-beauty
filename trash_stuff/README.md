# 🗑️ Trash Stuff

> Local development artifacts — not needed for the platform to build or run.

## Contents

| File | Origin | Why Here |
|------|--------|----------|
| `.env` | Project root | Local dev environment variables — gitignored, use `.env.example` |
| `web.env` | `apps/web/.env` | E2E test JWT secrets — gitignored, use `apps/web/.env.example` |
| `db.env` | `packages/db/.env` | Local database connection — gitignored, use `packages/db/.env.example` |
| `postman-collection.json` | `api/` | Legacy REST API Postman collection (pre-tRPC rebuild) |
| `local-dev.postman_environment.json` | `api/` | Legacy Postman environment config |

## Why Moved

These files are either:
- **Local secrets** (`.env` files) — already gitignored, should never be committed
- **Legacy artifacts** (Postman files) — from the v1.0 Express REST API, not relevant to the tRPC-based platform

## Can I Delete This Folder?

Yes. These files are not referenced by any build script, test, or application code. They're kept here for reference only.
