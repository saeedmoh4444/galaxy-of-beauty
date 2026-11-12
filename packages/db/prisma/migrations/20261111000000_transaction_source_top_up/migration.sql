-- W1 (audit 2026-11-11): wallet top-up transactions get their own source.
-- ALTER TYPE ... ADD VALUE cannot run inside a transaction block, so this
-- file holds only the addition (same discipline as the SELLER role enum).
ALTER TYPE "TransactionSource" ADD VALUE 'TOP_UP';
