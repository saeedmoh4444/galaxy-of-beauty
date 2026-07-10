# =============================================================================
# Galaxy of Beauty — Web (Next.js) Dockerfile
# =============================================================================
# Build:
#   docker build -t gob-web --target production .
#   docker build -t gob-web --target development .
# =============================================================================

# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy workspace config and lockfile
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages/config/package.json ./packages/config/
COPY packages/config/src ./packages/config/src
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
RUN pnpm install --frozen-lockfile

# ---- Development ----
FROM deps AS development
ENV NODE_ENV=development

# Copy source for Prisma generate
COPY packages/db/src ./packages/db/src
COPY packages/db/prisma ./packages/db/prisma

# Generate Prisma client
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

# Generate Prisma client
RUN cd /app/packages/db && npx prisma generate

# Build Next.js
RUN cd /app/apps/web && npx next build

# ---- Production ----
FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next /app/apps/web/.next
COPY --from=builder /app/apps/web/public /app/apps/web/public
COPY --from=builder /app/apps/web/package.json /app/apps/web/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages /app/packages

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npx", "next", "start"]
