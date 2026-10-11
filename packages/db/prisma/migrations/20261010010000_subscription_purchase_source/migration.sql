-- AI-subscription purchases must be paid (money-integrity gap #2): the
-- purchase flow now debits the wallet and records a
-- SUBSCRIPTION_PURCHASE transaction.
ALTER TYPE "TransactionSource" ADD VALUE 'SUBSCRIPTION_PURCHASE';
