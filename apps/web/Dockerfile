# =============================================================================
# Galaxy of Beauty — Web (Next.js) Dockerfile — OPS-004
# =============================================================================
# Build:
#   docker build -t gob-web --target production .
#   docker build -t gob-web --target development .
#
# Security: Runs as non-root 'node' user in production.
# =============================================================================

# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy workspace config and lockfile
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages/config/package.json ./packages/config/
COPY packages/db/package.json ./packages/db/
COPY packages/db/prisma ./packages/db/prisma
COPY packages/api/package.json ./packages/api/
COPY packages/api/tsconfig.json ./packages/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY apps/web/package.json ./apps/web/
COPY apps/web/tsconfig.json ./apps/web/
COPY apps/web/next.config.js ./apps/web/
COPY apps/web/postcss.config.cjs ./apps/web/
COPY apps/web/tailwind.config.ts ./apps/web/

# ---- Dependencies ----
FROM base AS deps
RUN pnpm install --frozen-lockfile --prod=false

# ---- Development ----
FROM deps AS development
ENV NODE_ENV=development
COPY packages/db/src ./packages/db/src
RUN cd /app/packages/db && npx prisma generate
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm", "dev"]

# ---- Builder ----
FROM deps AS builder
COPY packages/db/src ./packages/db/src
COPY packages/api/src ./packages/api/src
COPY packages/shared/src ./packages/shared/src
COPY apps/web/src ./apps/web/src
COPY apps/web/public ./apps/web/public
RUN cd /app/packages/db && npx prisma generate
RUN cd /app/apps/web && npx next build

# ---- Production (OPS-004: non-root, minimal) ----
FROM node:20-alpine AS production
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

WORKDIR /app

# Copy only production artifacts (not full monorepo)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next /app/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public /app/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/package.json /app/
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/next.config.js /app/
COPY --from=builder --chown=nextjs:nodejs /app/node_modules /app/node_modules

# Copy only generated Prisma client (not full packages)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.pnpm/@prisma+client* /app/node_modules/.pnpm/
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma /app/node_modules/@prisma

# Switch to non-root user
USER nextjs

EXPOSE 3000
CMD ["npx", "next", "start"]
