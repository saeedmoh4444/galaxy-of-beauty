-- 6.1d — ZATCA onboarding credentials.
CREATE TABLE "zatca_credentials" (
    "id" SERIAL NOT NULL,
    "env" TEXT NOT NULL,
    "certificatePem" TEXT NOT NULL,
    "privateKeyPem" TEXT NOT NULL,
    "binarySecurityToken" TEXT,
    "secret" TEXT,
    "requestId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "zatca_credentials_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "zatca_credentials_env_key" ON "zatca_credentials"("env");
