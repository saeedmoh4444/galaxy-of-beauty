# =============================================================================
# Galaxy of Beauty — Mobile (Expo Web Preview)
# =============================================================================
# Usage:
#   docker compose build mobile && docker compose up -d mobile
#   Open http://localhost:8081 in your browser
# =============================================================================

FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# Copy full monorepo for workspace resolution
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

EXPOSE 8081 19000 19001 19002
CMD ["sh", "-c", "cd apps/mobile && npx expo start --web --lan --port 8081"]
