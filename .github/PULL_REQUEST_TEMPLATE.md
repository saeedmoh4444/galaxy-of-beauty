## Summary

<!-- One sentence: what does this PR do? -->

## Problem

<!-- Link the issue this PR resolves, or describe the problem -->

Closes #

## Scope

<!-- What's changed? Mark all that apply -->

- [ ] Auth / Security
- [ ] Database / Migration
- [ ] API (tRPC router)
- [ ] Web (Next.js)
- [ ] Mobile (Expo)
- [ ] Shared (ui / shared / config)
- [ ] CI / Deployment
- [ ] Documentation

## Design

<!-- For architecture/security/data changes: link the ADR or explain the design -->

## Testing

<!-- How was this tested? -->

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

### Test commands

```bash
pnpm type-check
pnpm --filter @galaxy/api test
```

## Screenshots

<!-- For UI changes: before/after screenshots -->

## Risk Assessment

- **Rollback**: <!-- How to undo this change -->
- **Data impact**: <!-- Does this change data? Migration needed? -->
- **Security impact**: <!-- Affects auth, CORS, tokens, sessions? -->

## Checklist

- [ ] Type-check passes (`pnpm type-check`)
- [ ] Build passes (`pnpm build`)
- [ ] Tests pass (`pnpm --filter @galaxy/api test`)
- [ ] Format passes (`pnpm format:check`)
- [ ] No new `any` in Tier 1 domains (auth, bookings, payments, wallet)
- [ ] No new eslint-disable without comment + issue link
- [ ] Migration is backward-compatible with rollback plan (if applicable)
- [ ] Documentation updated (README, ADR, runbook if applicable)
