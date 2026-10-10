-- Gift-card purchases must be paid (money-integrity gap #1): the purchase
-- flow now debits the wallet and records a GIFT_CARD_PURCHASE transaction.
ALTER TYPE "TransactionSource" ADD VALUE 'GIFT_CARD_PURCHASE';
