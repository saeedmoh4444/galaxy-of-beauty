# =============================================================================
# Galaxy of Beauty - Backend Dockerfile
# Multi-stage build for development and production
# =============================================================================

# ---- Base Stage ----
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl dumb-init

# ---- Development Stage ----
FROM base AS development
ENV NODE_ENV=development

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Install Prisma CLI
RUN npx prisma generate

# Copy source
COPY . .

# Generate Prisma client and run migrations on startup
CMD ["sh", "-c", "npx prisma generate && npx prisma db push && npm run dev"]

# ---- Production Stage ----
FROM base AS production
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .
RUN npx prisma generate

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/app.js"]

EXPOSE 4000
