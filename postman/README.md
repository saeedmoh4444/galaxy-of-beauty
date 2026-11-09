# Postman / OpenAPI artifacts (F2)

`openapi.json` is **generated** — never hand-edited. It documents the tRPC
wire contract: one path per procedure (`POST /api/trpc/<router>.<procedure>`)
with the procedure's zod input schema inside the batch envelope
`{"0":{"json":…}}`.

## Regenerate

```bash
pnpm --filter @galaxy/api exec tsx ../../scripts/gen-openapi.mjs
```

The CI audit job runs the generator on every PR — a router rename, a broken
zod schema, or an import cycle fails the build (the generator exits non-zero).

## Validate / lint

```bash
postman spec lint postman/openapi.json
```

(Postman CLI, installed locally; not run in CI — the CLI is not provisioned
on the runners.)

## Publish to the Postman workspace (user-gated)

`postman login` (API key from the boss) → `postman api publish` /
`postman collection run` against staging. Not wired in CI until the key
lands — same gate as the other secrets.
