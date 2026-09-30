CREATE TYPE "TransactionStatus" AS ENUM ('PENDING','COMPLETED','FAILED');
ALTER TABLE "wallet_transactions" ADD COLUMN "status" "TransactionStatus" NOT NULL DEFAULT 'COMPLETED';
