-- B.3 vendor portal persistence: sales counter + card emoji on products
ALTER TABLE "products" ADD COLUMN "sales" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN "emoji" TEXT NOT NULL DEFAULT '';
