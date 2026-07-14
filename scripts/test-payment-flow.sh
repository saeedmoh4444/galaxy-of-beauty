#!/bin/bash
# Galaxy of Beauty — Payment Flow E2E Test
# Tests: register → login → create booking → authorize → capture → verify wallet
# Prerequisites: web app running on localhost:3000, PostgreSQL + Redis up
set -euo pipefail

BASE="${BASE_URL:-http://localhost:3000}/api/trpc"
PASS=0
FAIL=0

green() { echo -e "\033[32m✓ $1\033[0m"; ((PASS++)) || true; }
red()   { echo -e "\033[31m✗ $1\033[0m"; ((FAIL++)) || true; }
info()  { echo -e "\033[36m→ $1\033[0m"; }

# ── Helpers ──────────────────────────────────────────────────
trpc() {
  # $1 = path (e.g. "auth.login"), $2 = JSON body
  local path="$1" body="$2"
  local url="${BASE}/${path}"
  curl -s -X POST "$url" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer ${TOKEN:-}" \
    -H "x-csrf-token: ${CSRF:-}" \
    -d "$body"
}

# ── 1. Register test user ───────────────────────────────────
info "1. Registering test customer..."
EMAIL="paytest_$(date +%s)@test.com"
RESP=$(trpc "auth.register" "{\"email\":\"$EMAIL\",\"phone\":\"+966512345678\",\"password\":\"TestPass123\",\"name\":\"Payment Tester\",\"role\":\"CUSTOMER\",\"acceptedTerms\":true}")
TOKEN=$(echo "$RESP" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  green "Registered + got access token"
else
  red "Registration failed: $RESP"
  exit 1
fi

# ── 2. Create a booking ─────────────────────────────────────
info "2. Creating booking..."
BOOKING=$(trpc "bookings.create" "{\"technicianId\":1,\"serviceId\":1,\"addressId\":1,\"slotId\":1,\"startAt\":\"$(date -d '+2 days' -Iseconds)\",\"endAt\":\"$(date -d '+2 days +1 hour' -Iseconds)\",\"idempotencyKey\":\"$(uuidgen)\"}")
BOOKING_ID=$(echo "$BOOKING" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

if [ -n "$BOOKING_ID" ]; then
  green "Booking created: #$BOOKING_ID"
else
  red "Booking failed: $BOOKING"
  # Continue with hardcoded ID for testing
  BOOKING_ID=1
fi

# ── 3. Authorize payment ───────────────────────────────────
info "3. Authorizing payment..."
PAYMENT=$(trpc "payments.authorize" "{\"bookingId\":$BOOKING_ID,\"method\":\"online\",\"idempotencyKey\":\"$(uuidgen)\"}")
PAYMENT_ID=$(echo "$PAYMENT" | grep -o '"paymentId":[0-9]*' | cut -d: -f2)
GATEWAY_REF=$(echo "$PAYMENT" | grep -o '"gatewayRef":"[^"]*"' | cut -d'"' -f4)

if [ -n "$PAYMENT_ID" ]; then
  green "Payment authorized: #$PAYMENT_ID (ref: $GATEWAY_REF)"
else
  red "Payment authorization failed: $PAYMENT"
fi

# ── 4. Simulate webhook (capture) ───────────────────────────
info "4. Simulating PayFort webhook (CAPTURED)..."
WEBHOOK=$(trpc "payments.webhook" "{\"gatewayRef\":\"$GATEWAY_REF\",\"status\":\"14\",\"signature\":\"mock\"}")
PROCESSED=$(echo "$WEBHOOK" | grep -o '"processed":[a-z]*' | cut -d: -f2)

if [ "$PROCESSED" = "true" ]; then
  green "Webhook processed successfully"
else
  red "Webhook failed: $WEBHOOK"
fi

# ── 5. Verify wallet cashback ───────────────────────────────
info "5. Checking wallet for cashback..."
WALLET=$(trpc "wallet.getBalance" "{}")
BONUS=$(echo "$WALLET" | grep -o '"bonusBalance":[0-9.]*' | cut -d: -f2)

if [ -n "$BONUS" ] && [ "$BONUS" != "0" ]; then
  green "Cashback credited: $BONUS SAR"
else
  red "No cashback found (may need completed booking)"
fi

# ── 6. Verify payment status ─────────────────────────────────
info "6. Verifying payment status..."
PAYMENT_STATUS=$(trpc "payments.getByBooking" "{\"bookingId\":$BOOKING_ID}")
echo "$PAYMENT_STATUS" | grep -q '"status":"CAPTURED"' && green "Payment status: CAPTURED" || red "Payment not CAPTURED"

# ── Summary ─────────────────────────────────────────────────
echo ""
echo "=============================="
echo "  Passed: $PASS  |  Failed: $FAIL"
echo "=============================="
[ $FAIL -eq 0 ] && exit 0 || exit 1
