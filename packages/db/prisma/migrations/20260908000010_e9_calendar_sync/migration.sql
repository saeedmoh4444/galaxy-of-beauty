-- E9 — customer Google Calendar sync (OAuth token storage)

ALTER TABLE "beauty_integrations"
    ADD COLUMN "refreshToken" TEXT,
    ADD COLUMN "tokenExpiry" TIMESTAMP(3),
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
