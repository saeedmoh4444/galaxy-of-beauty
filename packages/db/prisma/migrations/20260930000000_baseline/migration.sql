-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'TECHNICIAN', 'ADMIN');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'PAYMENT_AUTHORIZED', 'CONFIRMED_OFFLINE', 'PAID', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('AUTHORIZED', 'CAPTURED', 'REFUNDED', 'FAILED', 'VOIDED');

-- CreateEnum
CREATE TYPE "PaymentIntent" AS ENUM ('AUTHORIZE', 'CAPTURE');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED_CUSTOMER', 'RESOLVED_TECHNICIAN', 'CLOSED');

-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('WAITING', 'NOTIFIED', 'CLAIMED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('CASHBACK', 'PLATFORM_FEE_SHARE', 'WITHDRAWAL', 'SUBSCRIPTION_BONUS', 'REFERRAL_BONUS', 'CASH_HANDLING_FEE', 'HANDLING_FEE_DEDUCTION', 'REFUND', 'INFLUENCER_COMMISSION');

-- CreateEnum
CREATE TYPE "ZatcaStatus" AS ENUM ('PENDING', 'REPORTED', 'CLEARED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AiFeature" AS ENUM ('CHATBOT', 'RECOMMENDATIONS', 'ONBOARDING_QUIZ');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifyToken" TEXT,
    "emailVerifyExpiry" TIMESTAMP(3),
    "twoFactorSecret" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "suspendedAt" TIMESTAMP(3),
    "suspendReason" TEXT,
    "avatarUrl" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'ar',
    "lastLoginAt" TIMESTAMP(3),
    "lastReengagementAt" TIMESTAMP(3),
    "birthDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reset_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'ios',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_accounts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT NOT NULL DEFAULT 'SILVER',
    "lifetimePoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_transactions" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "referenceId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_boosts" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "multiplier" DECIMAL(4,2) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_boosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" SERIAL NOT NULL,
    "titleJson" JSONB NOT NULL,
    "descriptionJson" JSONB,
    "severity" TEXT NOT NULL DEFAULT 'minor',
    "status" TEXT NOT NULL DEFAULT 'open',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_rewards" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "descriptionJson" JSONB NOT NULL,
    "pointsCost" INTEGER NOT NULL,
    "rewardType" TEXT NOT NULL,
    "rewardValue" DECIMAL(10,2) NOT NULL,
    "minTier" TEXT NOT NULL DEFAULT 'SILVER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technicians" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "area" TEXT,
    "bioJson" JSONB,
    "hourlyRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "ratingAvg" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "completedBookings" INTEGER NOT NULL DEFAULT 0,
    "kycStatus" "KYCStatus" NOT NULL DEFAULT 'PENDING',
    "kycDocuments" JSONB,
    "kycNotes" TEXT,
    "suspendedAt" TIMESTAMP(3),
    "googleCalendarToken" TEXT,
    "googleCalendarEmail" TEXT,
    "googleRefreshToken" TEXT,
    "googleTokenExpiry" TIMESTAMP(3),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isEcoFriendly" BOOLEAN NOT NULL DEFAULT false,
    "bufferMinutes" INTEGER NOT NULL DEFAULT 15,
    "tier" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "bonusBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" SERIAL NOT NULL,
    "walletId" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "source" "TransactionSource" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "referenceId" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "building" TEXT,
    "floor" TEXT,
    "apartment" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "slug" TEXT NOT NULL,
    "iconUrl" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "titleJson" JSONB NOT NULL,
    "descriptionJson" JSONB,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "slug" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isPregnancySafe" BOOLEAN NOT NULL DEFAULT false,
    "isMommyFriendly" BOOLEAN NOT NULL DEFAULT false,
    "isHourly" BOOLEAN NOT NULL DEFAULT false,
    "isWomenOnlyStaff" BOOLEAN NOT NULL DEFAULT false,
    "isPrivateSuite" BOOLEAN NOT NULL DEFAULT false,
    "dynamicPricingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_variants" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "nameJson" JSONB NOT NULL,
    "priceDelta" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "durationDelta" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "service_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_pricing_rules" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER,
    "categoryId" INTEGER,
    "technicianTier" TEXT,
    "dayOfWeek" INTEGER,
    "hourStart" INTEGER,
    "hourEnd" INTEGER,
    "priceMultiplier" DECIMAL(4,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_bundles" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "nameJson" JSONB NOT NULL,
    "descriptionJson" JSONB NOT NULL,
    "bundlePrice" DECIMAL(10,2) NOT NULL,
    "isMommyAndMe" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "primaryServiceId" INTEGER NOT NULL,
    "childServiceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_bundles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_addons" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "addonId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "popularityScore" INTEGER NOT NULL DEFAULT 0,
    "isSuggested" BOOLEAN NOT NULL DEFAULT false,
    "bundleDiscountPercent" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "service_addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_tags" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "service_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_tag_assignments" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "service_tag_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_services" (
    "id" SERIAL NOT NULL,
    "technicianId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "customPrice" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technician_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_slots" (
    "id" SERIAL NOT NULL,
    "technicianId" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "bookingId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "bookingCode" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "technicianId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "addressId" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'REQUESTED',
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "platformFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paymentFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cashHandlingFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "providerRevealed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "waitlistTriggered" BOOLEAN NOT NULL DEFAULT false,
    "influencerCode" TEXT,
    "idempotencyKey" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "googleEventId" TEXT,
    "technicianGoogleEventId" TEXT,
    "familyMemberId" INTEGER,
    "bundleId" INTEGER,
    "pricingBreakdown" JSONB,
    "addonsJson" JSONB,
    "beautyBundleId" INTEGER,
    "beautyBundleJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "gatewayRef" TEXT,
    "intent" "PaymentIntent" NOT NULL DEFAULT 'AUTHORIZE',
    "status" "PaymentStatus" NOT NULL DEFAULT 'AUTHORIZED',
    "commission" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "idempotencyKey" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" SERIAL NOT NULL,
    "technicianId" INTEGER,
    "vendorId" INTEGER,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "notes" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "raisedBy" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "evidenceUrl" TEXT,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolvedBy" INTEGER,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "titleJson" JSONB NOT NULL,
    "bodyJson" JSONB NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "sentVia" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "channels" TEXT[],
    "titleJson" JSONB NOT NULL,
    "bodyJson" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist_entries" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "technicianId" INTEGER NOT NULL,
    "serviceId" INTEGER,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'WAITING',
    "position" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "notifiedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terms_acceptances" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "termsVersion" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "terms_acceptances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zatca_invoices" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceHash" TEXT,
    "cryptographicStamp" TEXT,
    "qrCode" TEXT,
    "clearanceId" TEXT,
    "status" "ZatcaStatus" NOT NULL DEFAULT 'PENDING',
    "reportedAt" TIMESTAMP(3),
    "clearedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zatca_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "zatca_audit_logs" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "event" TEXT NOT NULL,
    "actorId" INTEGER NOT NULL,
    "detail" JSONB,
    "previousHash" TEXT NOT NULL,
    "entryHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zatca_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_subscription_plans" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "feature" "AiFeature" NOT NULL,
    "monthlyLimit" INTEGER NOT NULL,
    "priceMonthly" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_ai_subscriptions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_ai_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage" (
    "id" SERIAL NOT NULL,
    "subscriptionId" INTEGER NOT NULL,
    "feature" "AiFeature" NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER,
    "bookingId" INTEGER,
    "content" TEXT NOT NULL,
    "isAi" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_quiz_responses" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "responses" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_quiz_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_feedback" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "recommendedItemType" TEXT NOT NULL,
    "recommendedItemId" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "serviceId" INTEGER,
    "technicianId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saudi_cities" (
    "id" SERIAL NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "regionAr" TEXT NOT NULL,
    "regionEn" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "saudi_cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" SERIAL NOT NULL,
    "cityId" INTEGER NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streaks" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastBookingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "nameJson" JSONB NOT NULL,
    "descriptionJson" JSONB NOT NULL,
    "iconUrl" TEXT,
    "rewardAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" SERIAL NOT NULL,
    "referrerId" INTEGER NOT NULL,
    "referredId" INTEGER NOT NULL,
    "referralCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rewardCredited" BOOLEAN NOT NULL DEFAULT false,
    "referrerReward" DECIMAL(10,2) NOT NULL DEFAULT 20,
    "referredReward" DECIMAL(10,2) NOT NULL DEFAULT 20,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_prizes" (
    "id" SERIAL NOT NULL,
    "month" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "winnerId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "creditedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "influencers" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "socialHandle" TEXT,
    "commissionRate" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "userId" INTEGER,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "totalCommission" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "influencers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_configs" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_cards" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "cardToken" TEXT NOT NULL,
    "lastFour" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "expMonth" INTEGER NOT NULL,
    "expYear" INTEGER NOT NULL,
    "cardholderName" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_images" (
    "id" SERIAL NOT NULL,
    "technicianId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "captionJson" JSONB,
    "category" TEXT,
    "isBefore" BOOLEAN NOT NULL DEFAULT false,
    "pairId" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_codes" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountValue" DECIMAL(10,2) NOT NULL,
    "minOrderAmount" DECIMAL(10,2),
    "maxDiscount" DECIMAL(10,2),
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "appliesTo" TEXT,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_usages" (
    "id" SERIAL NOT NULL,
    "promoCodeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookingId" INTEGER,
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "descriptionJson" JSONB NOT NULL,
    "interval" TEXT NOT NULL DEFAULT 'MONTHLY',
    "price" DECIMAL(10,2) NOT NULL,
    "servicesPerMonth" INTEGER NOT NULL DEFAULT 1,
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "gymId" INTEGER,
    "priorityBooking" BOOLEAN NOT NULL DEFAULT false,
    "freeHomeService" BOOLEAN NOT NULL DEFAULT false,
    "dedicatedTechnician" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_subscriptions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "bookingsThisMonth" INTEGER NOT NULL DEFAULT 0,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercent" INTEGER NOT NULL DEFAULT 0,
    "enabledFor" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_sessions" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "roomId" TEXT NOT NULL,
    "initiatorId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "durationSec" INTEGER,
    "recordingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skin_analyses" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "resultJson" JSONB NOT NULL,
    "skinType" TEXT,
    "concerns" TEXT[],
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skin_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "slug" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "nameJson" JSONB NOT NULL,
    "descriptionJson" JSONB NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "comparePrice" DECIMAL(10,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sales" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "images" TEXT[],
    "brand" TEXT,
    "emoji" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "storeName" TEXT NOT NULL,
    "storeSlug" TEXT NOT NULL,
    "descriptionJson" JSONB,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "type" TEXT NOT NULL DEFAULT 'STORE',
    "licenseNumber" TEXT,
    "bankIban" TEXT,
    "bankName" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "commissionRate" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "totalSales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "ratingAvg" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "clinicType" TEXT,
    "licenseAgency" TEXT,
    "licenseVerifiedAt" TIMESTAMP(3),
    "consultationPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "gymType" TEXT,
    "gymCity" TEXT,
    "gymAddress" TEXT,
    "nailBarType" TEXT,
    "nailBarCity" TEXT,
    "nailBarAddress" TEXT,
    "homeCity" TEXT,
    "homeAddress" TEXT,
    "babyFriendly" BOOLEAN NOT NULL DEFAULT false,
    "womenOnlyStaff" BOOLEAN NOT NULL DEFAULT false,
    "privateSuite" BOOLEAN NOT NULL DEFAULT false,
    "childFriendlyCorner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_slots" (
    "id" SERIAL NOT NULL,
    "clinicId" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "consultationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_consultations" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "clinicId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "slotId" INTEGER NOT NULL,
    "treatmentType" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "notes" TEXT,
    "consentAcceptedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gym_classes" (
    "id" SERIAL NOT NULL,
    "gymId" INTEGER NOT NULL,
    "nameJson" JSONB NOT NULL,
    "descriptionJson" JSONB,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "enrolledCount" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gym_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gym_class_bookings" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "gym_class_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_orders" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "itemCount" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDING_FULFILLMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_deals" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "originalPrice" DECIMAL(10,2) NOT NULL,
    "dealPrice" DECIMAL(10,2) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_reviews" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_cards" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL,
    "purchaserId" INTEGER NOT NULL,
    "recipientEmail" TEXT,
    "recipientName" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_card_transactions" (
    "id" TEXT NOT NULL,
    "giftCardId" TEXT NOT NULL,
    "bookingId" INTEGER,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_card_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_bookings" (
    "id" SERIAL NOT NULL,
    "organizerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "theme" TEXT,
    "discountPercent" INTEGER NOT NULL DEFAULT 10,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_booking_members" (
    "id" SERIAL NOT NULL,
    "groupBookingId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "technicianId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_booking_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_packages" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "descriptionJson" JSONB,
    "imageUrl" TEXT,
    "discountPercent" INTEGER NOT NULL DEFAULT 15,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdByUserId" INTEGER,
    "reviewNotes" TEXT,
    "reviewedBy" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "clinicId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beauty_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_submissions" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "payload" JSONB NOT NULL,
    "reviewNotes" TEXT,
    "reviewedBy" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_package_services" (
    "id" SERIAL NOT NULL,
    "packageId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "beauty_package_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_favorites" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'مفضل',
    "serviceId" INTEGER NOT NULL,
    "technicianId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "descriptionJson" JSONB,
    "imageUrl" TEXT,
    "discountType" TEXT NOT NULL DEFAULT 'percent',
    "discountValue" DECIMAL(10,2) NOT NULL,
    "promoCode" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" SERIAL NOT NULL,
    "titleJson" JSONB NOT NULL,
    "bodyJson" JSONB NOT NULL,
    "slug" TEXT NOT NULL,
    "imageUrl" TEXT,
    "tags" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_profiles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "skinType" TEXT,
    "hairType" TEXT,
    "hairLength" TEXT,
    "skinTone" TEXT,
    "undertone" TEXT,
    "faceShape" TEXT,
    "allergies" TEXT[],
    "preferredScents" TEXT[],
    "makeupStyle" TEXT,
    "concerns" TEXT[],
    "notes" TEXT,
    "measurements" JSONB,
    "fitnessGoals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lifeStage" TEXT,
    "preferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "colorPalette" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beauty_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bridal_concierges" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "weddingDate" TIMESTAMP(3),
    "venue" TEXT,
    "guestCount" INTEGER,
    "budget" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'PLANNING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bridal_concierges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bridal_services" (
    "id" SERIAL NOT NULL,
    "conciergeId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "trialDate" TIMESTAMP(3),
    "isTrialDone" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,

    CONSTRAINT "bridal_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_badges" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "nameJson" JSONB NOT NULL,
    "iconUrl" TEXT,

    CONSTRAINT "technician_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_badge_assignments" (
    "id" SERIAL NOT NULL,
    "technicianId" INTEGER NOT NULL,
    "badgeId" INTEGER NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technician_badge_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_events" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "descriptionJson" JSONB,
    "eventType" TEXT NOT NULL,
    "location" TEXT,
    "price" DECIMAL(10,2),
    "maxAttendees" INTEGER,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "tier" TEXT NOT NULL DEFAULT 'PAID',
    "goodieBag" BOOLEAN NOT NULL DEFAULT false,
    "meetingProvider" TEXT,
    "meetingUrl" TEXT,
    "recordingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beauty_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "self_care_checkins" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "mood" INTEGER NOT NULL,
    "energy" INTEGER,
    "sleepHours" DECIMAL(3,1),
    "waterGlasses" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "self_care_checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_budgets" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "budget" DECIMAL(10,2) NOT NULL,
    "spent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beauty_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspiration_pins" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "title" TEXT,
    "notes" TEXT,
    "tags" TEXT[],
    "serviceId" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspiration_pins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_bookings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "technicianId" INTEGER,
    "addressId" INTEGER NOT NULL,
    "frequency" TEXT NOT NULL,
    "nextDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_likes" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_comments" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_posts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "tagsJson" JSONB,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_post_likes" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_post_comments" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_post_engagements" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER,
    "kind" TEXT NOT NULL,
    "targetId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_post_engagements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_certificates" (
    "id" SERIAL NOT NULL,
    "registrationId" INTEGER NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_service_requests" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "preferredDate" TEXT NOT NULL,
    "preferredTime" TEXT NOT NULL,
    "notes" TEXT,
    "vendorId" INTEGER,
    "assignedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "home_service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vip_memberships" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'silver',
    "expiresAt" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vip_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shorts" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'reel',
    "technicianId" INTEGER,
    "titleJson" JSONB NOT NULL,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "beforeImageUrl" TEXT,
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 'general',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "faceBlurred" BOOLEAN NOT NULL DEFAULT false,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "short_likes" (
    "id" SERIAL NOT NULL,
    "shortId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "short_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_drop_alerts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "serviceName" TEXT NOT NULL,
    "targetPrice" DOUBLE PRECISION NOT NULL,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '💅',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_drop_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warranty_claims" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "compensation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warranty_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spa_plans" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spa_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_steps" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "routineId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_certificates" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "quizId" TEXT NOT NULL,
    "quizName" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_boxes" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "products" JSONB NOT NULL,
    "frequency" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_boxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_alerts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "categories" JSONB NOT NULL,
    "maxDiscount" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_testimonials" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "userName" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "technicianName" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hair_color_sims" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "colorId" TEXT NOT NULL,
    "colorName" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hair_color_sims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_routines" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dna_analyses" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "traits" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "bestRoutine" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dna_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "before_after" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "userName" TEXT NOT NULL,
    "beforeUrl" TEXT NOT NULL,
    "afterUrl" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "technicianName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "before_after_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bingo_progress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bingo_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredient_scans" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "barcode" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "safetyScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingredient_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_faqs" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_recommendations" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "night_mode_settings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT NOT NULL DEFAULT '21:00',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "night_mode_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_kit_items" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "destination" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travel_kit_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_registries" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "occasion" TEXT NOT NULL,
    "targetAmount" DECIMAL(10,2) NOT NULL,
    "raisedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "serviceIds" INTEGER[],
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_registries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_registry_contributions" (
    "id" SERIAL NOT NULL,
    "registryId" INTEGER NOT NULL,
    "contributorName" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_registry_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookingReminders" BOOLEAN NOT NULL DEFAULT true,
    "promotions" BOOLEAN NOT NULL DEFAULT true,
    "tips" BOOLEAN NOT NULL DEFAULT true,
    "community" BOOLEAN NOT NULL DEFAULT true,
    "emailDigest" BOOLEAN NOT NULL DEFAULT false,
    "smsAlerts" BOOLEAN NOT NULL DEFAULT false,
    "whatsappAlerts" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "birthday_rewards" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "rewardType" TEXT NOT NULL,
    "rewardValue" DECIMAL(10,2) NOT NULL,
    "promoCode" TEXT,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "birthday_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_goals" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "serviceId" INTEGER,
    "title" TEXT NOT NULL,
    "targetAmount" DECIMAL(10,2) NOT NULL,
    "savedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "bnplPlanId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_follows" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "technicianId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technician_follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_journals" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "mood" INTEGER,
    "imageUrl" TEXT,
    "serviceType" TEXT,
    "bookingId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flash_deals" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "titleAr" TEXT,
    "titleEn" TEXT,
    "discountPercent" INTEGER NOT NULL,
    "originalPrice" DECIMAL(10,2) NOT NULL,
    "dealPrice" DECIMAL(10,2) NOT NULL,
    "discountValue" DECIMAL(10,2) NOT NULL,
    "maxRedemptions" INTEGER NOT NULL DEFAULT 20,
    "currentRedemptions" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flash_deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "preferences" TEXT[],
    "notes" TEXT NOT NULL DEFAULT '',
    "emergencyContact" TEXT,
    "allergies" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skin_diary_entries" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "skinCondition" TEXT NOT NULL,
    "hydration" INTEGER NOT NULL DEFAULT 5,
    "concerns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skin_diary_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wellness_checkins" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "water" INTEGER NOT NULL DEFAULT 0,
    "sleep" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mood" INTEGER NOT NULL DEFAULT 3,
    "steps" INTEGER NOT NULL DEFAULT 0,
    "skincare" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wellness_checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pen_pal_profiles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "interests" TEXT[],
    "bio" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pen_pal_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_chat_messages" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "userName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isAgent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_questions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "userName" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "technicianName" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "isAnswered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qa_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_boards" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "coverUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_board_pins" (
    "id" SERIAL NOT NULL,
    "boardId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "serviceId" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_board_pins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_wishlist_items" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "serviceName" TEXT NOT NULL,
    "currentPrice" INTEGER NOT NULL,
    "prevPrice" INTEGER NOT NULL DEFAULT 0,
    "lowestPrice" INTEGER NOT NULL DEFAULT 0,
    "emoji" TEXT NOT NULL DEFAULT '💅',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_card_listings" (
    "id" SERIAL NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "sellerName" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "sellingPrice" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🎁',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_card_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expiry_tracker_items" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "openDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryMonths" INTEGER NOT NULL DEFAULT 12,
    "emoji" TEXT NOT NULL DEFAULT '📦',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expiry_tracker_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restock_reminder_items" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lifespanDays" INTEGER NOT NULL DEFAULT 60,
    "notifyDays" INTEGER NOT NULL DEFAULT 7,
    "emoji" TEXT NOT NULL DEFAULT '📦',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restock_reminder_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycle_entries" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "phase" TEXT NOT NULL,
    "mood" TEXT,
    "notes" TEXT,
    "flowIntensity" TEXT,
    "symptoms" TEXT[],
    "temperature" DOUBLE PRECISION,
    "beautyNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cycle_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycle_settings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "cycleLength" INTEGER NOT NULL DEFAULT 28,
    "periodLength" INTEGER NOT NULL DEFAULT 5,
    "lastPeriodStart" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avgCycleLength" INTEGER,
    "pregnancyMode" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TIMESTAMP(3),
    "menopauseMode" BOOLEAN NOT NULL DEFAULT false,
    "lastPeriodAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cycle_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycle_periods" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "length" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cycle_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_closet_products" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🧴',
    "category" TEXT NOT NULL DEFAULT 'skincare',
    "openDate" TIMESTAMP(3),
    "expiryMonths" INTEGER,
    "usagePct" INTEGER NOT NULL DEFAULT 100,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_closet_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_parties" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "theme" TEXT NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "discountPct" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergen_profiles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allergen_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_budget_items" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "monthlyLimit" DOUBLE PRECISION NOT NULL,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_participants" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "challengeKey" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "challenge_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_consultations" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "consultantType" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "slot" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "meetingLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "virtual_consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salon_memberships" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'basic',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "salon_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_courses" (
    "id" SERIAL NOT NULL,
    "titleJson" JSONB NOT NULL,
    "descJson" JSONB,
    "instructor" TEXT NOT NULL,
    "lessons" INTEGER NOT NULL DEFAULT 1,
    "duration" TEXT NOT NULL DEFAULT '1 ساعة',
    "level" TEXT NOT NULL DEFAULT 'beginner',
    "category" TEXT NOT NULL DEFAULT 'skincare',
    "emoji" TEXT NOT NULL DEFAULT '📚',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beauty_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_enrollments" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ENROLLED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_plans" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "nameJson" JSONB NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "employees" INTEGER NOT NULL,
    "services" JSONB NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🌱',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_enquiries" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corporate_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_quiz_questions" (
    "id" SERIAL NOT NULL,
    "questionKey" TEXT NOT NULL,
    "questionJson" JSONB NOT NULL,
    "options" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_quiz_recommendations" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "descJson" JSONB,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🎁',
    "tags" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_quiz_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_buy_deals" (
    "id" SERIAL NOT NULL,
    "service" TEXT NOT NULL,
    "originalPrice" DOUBLE PRECISION NOT NULL,
    "groupPrice" DOUBLE PRECISION NOT NULL,
    "minBuyers" INTEGER NOT NULL DEFAULT 3,
    "currentBuyers" INTEGER NOT NULL DEFAULT 0,
    "endsIn" TEXT NOT NULL DEFAULT '٣ أيام',
    "emoji" TEXT NOT NULL DEFAULT '💄',
    "savings" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_buy_deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_looks" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "technicianName" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 'makeup',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_looks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compare_products" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "brand" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 'skincare',
    "emoji" TEXT NOT NULL DEFAULT '🧴',
    "features" JSONB NOT NULL,
    "ingredients" INTEGER NOT NULL DEFAULT 0,
    "crueltyFree" BOOLEAN NOT NULL DEFAULT false,
    "vegan" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compare_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matchmaker_questions" (
    "id" SERIAL NOT NULL,
    "questionKey" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matchmaker_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matchmaker_services" (
    "id" SERIAL NOT NULL,
    "nameAr" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '💅',
    "price" DOUBLE PRECISION NOT NULL,
    "tags" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matchmaker_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_reminders" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "intervalDays" INTEGER NOT NULL DEFAULT 30,
    "nextDate" TIMESTAMP(3) NOT NULL,
    "lastCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geo_promotions" (
    "id" SERIAL NOT NULL,
    "titleJson" JSONB NOT NULL,
    "descriptionJson" JSONB,
    "city" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "radiusKm" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "discountPct" INTEGER NOT NULL,
    "maxDiscount" DECIMAL(10,2),
    "minOrderAmount" DECIMAL(10,2),
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geo_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_streams" (
    "id" SERIAL NOT NULL,
    "technicianId" INTEGER NOT NULL,
    "titleJson" JSONB NOT NULL,
    "descriptionJson" JSONB,
    "category" TEXT NOT NULL DEFAULT 'makeup',
    "streamUrl" TEXT,
    "thumbnailUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "viewerCount" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "recordingUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_streams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER,
    "categoryId" INTEGER,
    "dayOfWeek" INTEGER,
    "hourStart" INTEGER,
    "hourEnd" INTEGER,
    "priceMultiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "technicianTier" TEXT,
    "labelJson" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_bundles" (
    "id" SERIAL NOT NULL,
    "titleJson" JSONB NOT NULL,
    "descriptionJson" JSONB,
    "serviceIds" INTEGER[],
    "discountPct" INTEGER NOT NULL DEFAULT 10,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "originalPrice" DECIMAL(10,2) NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSeasonal" BOOLEAN NOT NULL DEFAULT false,
    "season" TEXT,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beauty_bundles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_plans" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "descriptionJson" JSONB,
    "priceMonthly" DECIMAL(10,2) NOT NULL,
    "priceAnnual" DECIMAL(10,2),
    "maxBookings" INTEGER NOT NULL DEFAULT 4,
    "discountPct" INTEGER NOT NULL DEFAULT 10,
    "features" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beauty_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_circles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "city" TEXT,
    "cover" TEXT NOT NULL DEFAULT '🌸',
    "members" INTEGER NOT NULL DEFAULT 0,
    "creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beauty_circles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_circle_members" (
    "id" SERIAL NOT NULL,
    "circleId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_circle_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kindness_accounts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "lifetimePoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kindness_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kindness_transactions" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kindness_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sisterhood_compliments" (
    "id" SERIAL NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '💌',
    "text" TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,
    "senderName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sisterhood_compliments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "panic_alerts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "bookingId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "panic_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escort_requests" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "technicianId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escort_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_shares" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_checkins" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_heritage_practices" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "modernUse" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_heritage_practices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "green_salons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "practices" JSONB NOT NULL,
    "city" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "green_salons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_bank_donations" (
    "id" SERIAL NOT NULL,
    "donorId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_bank_donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "she_leads_members" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "city" TEXT,
    "yearsOfExperience" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "she_leads_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_events" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "time" TEXT,
    "maxAttendees" INTEGER,
    "hostId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_event_attendees" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_event_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensory_friendly_salons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "city" TEXT,
    "isCertified" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensory_friendly_salons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_myths" (
    "id" SERIAL NOT NULL,
    "myth" TEXT NOT NULL,
    "fact" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_myths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_quiz_questions" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "optionsJson" JSONB NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_quiz_attempts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "selectedIndex" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_beauty_tips" (
    "id" SERIAL NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '💡',
    "tip" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'عناية',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_beauty_tips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasonal_looks" (
    "id" SERIAL NOT NULL,
    "season" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '✨',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seasonal_looks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_habits" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '✅',
    "doneToday" BOOLEAN NOT NULL DEFAULT false,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accountability_partners" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "goal" TEXT NOT NULL,
    "partnerUserId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SEEKING',
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastCheckIn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accountability_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vision_goals" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🌟',
    "text" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "achieved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vision_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gratitude_notes" (
    "id" SERIAL NOT NULL,
    "authorId" INTEGER NOT NULL,
    "authorName" TEXT NOT NULL,
    "toName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '💕',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gratitude_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sleep_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "quality" INTEGER,
    "bedtime" TEXT,
    "wakeTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sleep_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concierge_requests" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "request" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'booking',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concierge_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_capsules" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "routineJson" JSONB NOT NULL,
    "openDate" TEXT NOT NULL,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_capsules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secret_santa_groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "drawDate" TEXT,
    "drawn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "secret_santa_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secret_santa_participants" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "assignedTo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "secret_santa_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_skills" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '⭐',
    "level" INTEGER NOT NULL DEFAULT 0,
    "maxLevel" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_playlists" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "tracksJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_recipes" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "ingredientsJson" JSONB NOT NULL,
    "stepsJson" JSONB NOT NULL,
    "duration" TEXT NOT NULL,
    "forSkin" TEXT,
    "emoji" TEXT NOT NULL DEFAULT '🥣',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_clubs" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '📖',
    "members" INTEGER NOT NULL DEFAULT 0,
    "currentChapter" TEXT,
    "nextMeeting" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_club_members" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_club_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_terms" (
    "id" SERIAL NOT NULL,
    "ar" TEXT NOT NULL,
    "en" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '📝',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_milestones" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '💰',
    "achieved" BOOLEAN NOT NULL DEFAULT false,
    "achievedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rural_outreach" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TRAINED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rural_outreach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "export_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_pitches" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investment_pitches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expert_talks" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "expert" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "seats" INTEGER,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "emoji" TEXT NOT NULL DEFAULT '🎤',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expert_talks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_paths" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '📜',
    "levelsJson" JSONB NOT NULL,
    "duration" TEXT NOT NULL,
    "accredited" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certification_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_enrollments" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "pathId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certification_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_impact" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_impact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dv_support_requests" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "serviceType" TEXT NOT NULL,
    "partnerShelter" TEXT,
    "message" TEXT,
    "confidential" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dv_support_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_gifts" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "friendName" TEXT NOT NULL,
    "months" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_gifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_achievements" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "achievementKey" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_feedback" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_surveys" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "questionsJson" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_responses" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "surveyId" INTEGER NOT NULL,
    "answersJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_memories" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '📸',
    "imageUrl" TEXT,
    "notes" TEXT,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_passes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "classes" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "gymId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_passes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_pass_purchases" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "passId" INTEGER NOT NULL,
    "classesRemaining" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_pass_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_spotlights" (
    "id" SERIAL NOT NULL,
    "technicianId" INTEGER NOT NULL,
    "story" TEXT NOT NULL,
    "achievement" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '👩‍🎨',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technician_spotlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_partners" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "interest" TEXT NOT NULL,
    "city" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SEEKING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_partner_matches" (
    "id" SERIAL NOT NULL,
    "partner1Id" INTEGER NOT NULL,
    "partner2Id" INTEGER NOT NULL,
    "interest" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_partner_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_responses" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_preferences" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "preferences" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_ratings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "technicianId" INTEGER NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "skill" INTEGER,
    "punctuality" INTEGER,
    "cleanliness" INTEGER,
    "communication" INTEGER,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technician_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_trends" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_trends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_integrations" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'CONNECTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beauty_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_milestones" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_reports" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_coupons" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 100,
    "used" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_queue_entries" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "technicianId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_queue_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_segments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurement_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "waistCm" DOUBLE PRECISION,
    "hipCm" DOUBLE PRECISION,
    "bustCm" DOUBLE PRECISION,
    "thighCm" DOUBLE PRECISION,
    "bodyFatPct" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "measurement_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menopause_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "symptom" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 2,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menopause_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bnpl_plans" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "installments" INTEGER NOT NULL,
    "monthlyPayment" DECIMAL(10,2) NOT NULL,
    "paidCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "schedule" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bnpl_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nail_bar_slots" (
    "id" SERIAL NOT NULL,
    "nailBarId" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "bookedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nail_bar_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nail_bar_bookings" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "slotId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nail_bar_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nps_responses" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookingId" INTEGER,
    "score" INTEGER NOT NULL,
    "comment" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followedUpAt" TIMESTAMP(3),

    CONSTRAINT "nps_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ab_test_events" (
    "id" SERIAL NOT NULL,
    "testKey" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ab_test_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasonal_services" (
    "id" SERIAL NOT NULL,
    "nameJson" JSONB NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "pricePremium" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasonal_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_isActive_idx" ON "users"("role", "isActive");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "refresh_tokens_familyId_idx" ON "refresh_tokens"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "reset_tokens_token_key" ON "reset_tokens"("token");

-- CreateIndex
CREATE INDEX "reset_tokens_userId_idx" ON "reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "reset_tokens_expiresAt_idx" ON "reset_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "push_tokens_token_key" ON "push_tokens"("token");

-- CreateIndex
CREATE INDEX "push_tokens_userId_idx" ON "push_tokens"("userId");

-- CreateIndex
CREATE INDEX "push_tokens_token_idx" ON "push_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_accounts_userId_key" ON "loyalty_accounts"("userId");

-- CreateIndex
CREATE INDEX "loyalty_accounts_userId_idx" ON "loyalty_accounts"("userId");

-- CreateIndex
CREATE INDEX "loyalty_accounts_tier_idx" ON "loyalty_accounts"("tier");

-- CreateIndex
CREATE INDEX "loyalty_transactions_accountId_idx" ON "loyalty_transactions"("accountId");

-- CreateIndex
CREATE INDEX "loyalty_transactions_createdAt_idx" ON "loyalty_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "loyalty_boosts_isActive_startsAt_endsAt_idx" ON "loyalty_boosts"("isActive", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "incidents_status_startedAt_idx" ON "incidents"("status", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "technicians_userId_key" ON "technicians"("userId");

-- CreateIndex
CREATE INDEX "technicians_city_kycStatus_idx" ON "technicians"("city", "kycStatus");

-- CreateIndex
CREATE INDEX "technicians_ratingAvg_idx" ON "technicians"("ratingAvg");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_idempotencyKey_key" ON "wallet_transactions"("idempotencyKey");

-- CreateIndex
CREATE INDEX "wallet_transactions_walletId_createdAt_idx" ON "wallet_transactions"("walletId", "createdAt");

-- CreateIndex
CREATE INDEX "wallet_transactions_referenceId_idx" ON "wallet_transactions"("referenceId");

-- CreateIndex
CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_parentId_idx" ON "categories"("parentId");

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_categoryId_isActive_idx" ON "services"("categoryId", "isActive");

-- CreateIndex
CREATE INDEX "services_basePrice_idx" ON "services"("basePrice");

-- CreateIndex
CREATE INDEX "service_variants_serviceId_idx" ON "service_variants"("serviceId");

-- CreateIndex
CREATE INDEX "service_pricing_rules_serviceId_isActive_idx" ON "service_pricing_rules"("serviceId", "isActive");

-- CreateIndex
CREATE INDEX "service_pricing_rules_isActive_idx" ON "service_pricing_rules"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "service_bundles_slug_key" ON "service_bundles"("slug");

-- CreateIndex
CREATE INDEX "service_bundles_isActive_sortOrder_idx" ON "service_bundles"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "service_addons_serviceId_idx" ON "service_addons"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "service_addons_serviceId_addonId_key" ON "service_addons"("serviceId", "addonId");

-- CreateIndex
CREATE UNIQUE INDEX "service_tags_slug_key" ON "service_tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "service_tag_assignments_serviceId_tagId_key" ON "service_tag_assignments"("serviceId", "tagId");

-- CreateIndex
CREATE INDEX "technician_services_technicianId_idx" ON "technician_services"("technicianId");

-- CreateIndex
CREATE INDEX "technician_services_serviceId_idx" ON "technician_services"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "technician_services_technicianId_serviceId_key" ON "technician_services"("technicianId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "availability_slots_bookingId_key" ON "availability_slots"("bookingId");

-- CreateIndex
CREATE INDEX "availability_slots_technicianId_startAt_isBooked_idx" ON "availability_slots"("technicianId", "startAt", "isBooked");

-- CreateIndex
CREATE INDEX "availability_slots_technicianId_startAt_endAt_idx" ON "availability_slots"("technicianId", "startAt", "endAt");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_bookingCode_key" ON "bookings"("bookingCode");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_idempotencyKey_key" ON "bookings"("idempotencyKey");

-- CreateIndex
CREATE INDEX "bookings_customerId_status_createdAt_idx" ON "bookings"("customerId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "bookings_technicianId_status_startAt_idx" ON "bookings"("technicianId", "status", "startAt");

-- CreateIndex
CREATE INDEX "bookings_status_createdAt_idx" ON "bookings"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "payments_bookingId_key" ON "payments"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotencyKey_key" ON "payments"("idempotencyKey");

-- CreateIndex
CREATE INDEX "payments_gatewayRef_idx" ON "payments"("gatewayRef");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_bookingId_idx" ON "payments"("bookingId");

-- CreateIndex
CREATE INDEX "payouts_technicianId_status_idx" ON "payouts"("technicianId", "status");

-- CreateIndex
CREATE INDEX "payouts_vendorId_status_idx" ON "payouts"("vendorId", "status");

-- CreateIndex
CREATE INDEX "payouts_periodStart_periodEnd_idx" ON "payouts"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_bookingId_key" ON "reviews"("bookingId");

-- CreateIndex
CREATE INDEX "reviews_customerId_idx" ON "reviews"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "disputes_bookingId_key" ON "disputes"("bookingId");

-- CreateIndex
CREATE INDEX "disputes_status_idx" ON "disputes"("status");

-- CreateIndex
CREATE INDEX "disputes_raisedBy_idx" ON "disputes"("raisedBy");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_createdAt_idx" ON "notifications"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_key_key" ON "notification_templates"("key");

-- CreateIndex
CREATE INDEX "notification_templates_category_isActive_idx" ON "notification_templates"("category", "isActive");

-- CreateIndex
CREATE INDEX "waitlist_entries_technicianId_status_idx" ON "waitlist_entries"("technicianId", "status");

-- CreateIndex
CREATE INDEX "waitlist_entries_customerId_idx" ON "waitlist_entries"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_entries_technicianId_customerId_key" ON "waitlist_entries"("technicianId", "customerId");

-- CreateIndex
CREATE INDEX "terms_acceptances_userId_termsVersion_idx" ON "terms_acceptances"("userId", "termsVersion");

-- CreateIndex
CREATE UNIQUE INDEX "zatca_invoices_bookingId_key" ON "zatca_invoices"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "zatca_invoices_invoiceNumber_key" ON "zatca_invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "zatca_invoices_invoiceNumber_idx" ON "zatca_invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "zatca_invoices_status_idx" ON "zatca_invoices"("status");

-- CreateIndex
CREATE UNIQUE INDEX "zatca_credentials_env_key" ON "zatca_credentials"("env");

-- CreateIndex
CREATE INDEX "zatca_audit_logs_invoiceId_idx" ON "zatca_audit_logs"("invoiceId");

-- CreateIndex
CREATE INDEX "audit_logs_adminId_createdAt_idx" ON "audit_logs"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_targetType_targetId_idx" ON "audit_logs"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_ai_subscriptions_userId_key" ON "customer_ai_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "customer_ai_subscriptions_userId_status_idx" ON "customer_ai_subscriptions"("userId", "status");

-- CreateIndex
CREATE INDEX "ai_usage_subscriptionId_createdAt_idx" ON "ai_usage"("subscriptionId", "createdAt");

-- CreateIndex
CREATE INDEX "chat_messages_senderId_createdAt_idx" ON "chat_messages"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX "chat_messages_bookingId_idx" ON "chat_messages"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_quiz_responses_userId_key" ON "customer_quiz_responses"("userId");

-- CreateIndex
CREATE INDEX "recommendation_feedback_userId_createdAt_idx" ON "recommendation_feedback"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "wishlist_items_userId_idx" ON "wishlist_items"("userId");

-- CreateIndex
CREATE INDEX "wishlist_items_createdAt_idx" ON "wishlist_items"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_userId_serviceId_key" ON "wishlist_items"("userId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_userId_technicianId_key" ON "wishlist_items"("userId", "technicianId");

-- CreateIndex
CREATE INDEX "saudi_cities_nameAr_idx" ON "saudi_cities"("nameAr");

-- CreateIndex
CREATE INDEX "saudi_cities_regionAr_idx" ON "saudi_cities"("regionAr");

-- CreateIndex
CREATE UNIQUE INDEX "saudi_cities_nameAr_regionAr_key" ON "saudi_cities"("nameAr", "regionAr");

-- CreateIndex
CREATE INDEX "areas_cityId_idx" ON "areas"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "areas_cityId_nameAr_key" ON "areas"("cityId", "nameAr");

-- CreateIndex
CREATE UNIQUE INDEX "streaks_customerId_key" ON "streaks"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_key_key" ON "achievements"("key");

-- CreateIndex
CREATE INDEX "user_achievements_userId_idx" ON "user_achievements"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "referrals_referrerId_idx" ON "referrals"("referrerId");

-- CreateIndex
CREATE INDEX "referrals_referredId_idx" ON "referrals"("referredId");

-- CreateIndex
CREATE INDEX "referrals_referralCode_idx" ON "referrals"("referralCode");

-- CreateIndex
CREATE INDEX "referral_prizes_winnerId_idx" ON "referral_prizes"("winnerId");

-- CreateIndex
CREATE UNIQUE INDEX "referral_prizes_month_rank_key" ON "referral_prizes"("month", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "influencers_code_key" ON "influencers"("code");

-- CreateIndex
CREATE INDEX "influencers_userId_idx" ON "influencers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "platform_configs_key_key" ON "platform_configs"("key");

-- CreateIndex
CREATE INDEX "saved_cards_userId_idx" ON "saved_cards"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_cards_userId_cardToken_key" ON "saved_cards"("userId", "cardToken");

-- CreateIndex
CREATE INDEX "gallery_images_technicianId_isPublished_idx" ON "gallery_images"("technicianId", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");

-- CreateIndex
CREATE INDEX "promo_codes_code_isActive_idx" ON "promo_codes"("code", "isActive");

-- CreateIndex
CREATE INDEX "promo_codes_validUntil_idx" ON "promo_codes"("validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "promo_usages_promoCodeId_userId_bookingId_key" ON "promo_usages"("promoCodeId", "userId", "bookingId");

-- CreateIndex
CREATE INDEX "customer_subscriptions_userId_status_idx" ON "customer_subscriptions"("userId", "status");

-- CreateIndex
CREATE INDEX "customer_subscriptions_status_currentPeriodEnd_idx" ON "customer_subscriptions"("status", "currentPeriodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "customer_subscriptions_userId_planId_key" ON "customer_subscriptions"("userId", "planId");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- CreateIndex
CREATE UNIQUE INDEX "video_sessions_bookingId_key" ON "video_sessions"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "video_sessions_roomId_key" ON "video_sessions"("roomId");

-- CreateIndex
CREATE INDEX "video_sessions_roomId_idx" ON "video_sessions"("roomId");

-- CreateIndex
CREATE INDEX "video_sessions_bookingId_idx" ON "video_sessions"("bookingId");

-- CreateIndex
CREATE INDEX "skin_analyses_userId_createdAt_idx" ON "skin_analyses"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_slug_key" ON "product_categories"("slug");

-- CreateIndex
CREATE INDEX "products_vendorId_isActive_idx" ON "products"("vendorId", "isActive");

-- CreateIndex
CREATE INDEX "products_categoryId_isActive_idx" ON "products"("categoryId", "isActive");

-- CreateIndex
CREATE INDEX "products_price_idx" ON "products"("price");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_userId_key" ON "vendors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_storeSlug_key" ON "vendors"("storeSlug");

-- CreateIndex
CREATE INDEX "vendors_storeSlug_idx" ON "vendors"("storeSlug");

-- CreateIndex
CREATE INDEX "vendors_isVerified_isActive_idx" ON "vendors"("isVerified", "isActive");

-- CreateIndex
CREATE INDEX "vendors_type_isVerified_isActive_idx" ON "vendors"("type", "isVerified", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_slots_consultationId_key" ON "clinic_slots"("consultationId");

-- CreateIndex
CREATE INDEX "clinic_slots_clinicId_startAt_idx" ON "clinic_slots"("clinicId", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_consultations_code_key" ON "clinic_consultations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_consultations_slotId_key" ON "clinic_consultations"("slotId");

-- CreateIndex
CREATE INDEX "clinic_consultations_clinicId_status_idx" ON "clinic_consultations"("clinicId", "status");

-- CreateIndex
CREATE INDEX "clinic_consultations_customerId_scheduledAt_idx" ON "clinic_consultations"("customerId", "scheduledAt");

-- CreateIndex
CREATE INDEX "gym_classes_gymId_startsAt_idx" ON "gym_classes"("gymId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "gym_class_bookings_code_key" ON "gym_class_bookings"("code");

-- CreateIndex
CREATE INDEX "gym_class_bookings_classId_status_idx" ON "gym_class_bookings"("classId", "status");

-- CreateIndex
CREATE INDEX "gym_class_bookings_customerId_idx" ON "gym_class_bookings"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "gym_class_bookings_classId_customerId_key" ON "gym_class_bookings"("classId", "customerId");

-- CreateIndex
CREATE INDEX "store_orders_vendorId_status_createdAt_idx" ON "store_orders"("vendorId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "store_orders_customerId_createdAt_idx" ON "store_orders"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "store_deals_productId_isActive_startsAt_endsAt_idx" ON "store_deals"("productId", "isActive", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "store_deals_vendorId_isActive_idx" ON "store_deals"("vendorId", "isActive");

-- CreateIndex
CREATE INDEX "product_reviews_productId_idx" ON "product_reviews"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_reviews_productId_userId_key" ON "product_reviews"("productId", "userId");

-- CreateIndex
CREATE INDEX "cart_items_userId_idx" ON "cart_items"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_userId_productId_key" ON "cart_items"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "gift_cards_code_key" ON "gift_cards"("code");

-- CreateIndex
CREATE INDEX "gift_cards_code_idx" ON "gift_cards"("code");

-- CreateIndex
CREATE INDEX "gift_cards_purchaserId_idx" ON "gift_cards"("purchaserId");

-- CreateIndex
CREATE INDEX "gift_cards_status_idx" ON "gift_cards"("status");

-- CreateIndex
CREATE INDEX "gift_card_transactions_giftCardId_idx" ON "gift_card_transactions"("giftCardId");

-- CreateIndex
CREATE INDEX "group_bookings_organizerId_idx" ON "group_bookings"("organizerId");

-- CreateIndex
CREATE INDEX "group_booking_members_groupBookingId_idx" ON "group_booking_members"("groupBookingId");

-- CreateIndex
CREATE INDEX "beauty_packages_status_isActive_idx" ON "beauty_packages"("status", "isActive");

-- CreateIndex
CREATE INDEX "provider_submissions_kind_status_idx" ON "provider_submissions"("kind", "status");

-- CreateIndex
CREATE INDEX "provider_submissions_providerId_createdAt_idx" ON "provider_submissions"("providerId", "createdAt");

-- CreateIndex
CREATE INDEX "beauty_package_services_packageId_idx" ON "beauty_package_services"("packageId");

-- CreateIndex
CREATE UNIQUE INDEX "beauty_package_services_packageId_serviceId_key" ON "beauty_package_services"("packageId", "serviceId");

-- CreateIndex
CREATE INDEX "customer_favorites_userId_idx" ON "customer_favorites"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_favorites_userId_serviceId_technicianId_key" ON "customer_favorites"("userId", "serviceId", "technicianId");

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_promoCode_key" ON "campaigns"("promoCode");

-- CreateIndex
CREATE INDEX "campaigns_startsAt_endsAt_idx" ON "campaigns"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "campaigns_isActive_idx" ON "campaigns"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_slug_idx" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_isPublished_publishedAt_idx" ON "blog_posts"("isPublished", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "beauty_profiles_userId_key" ON "beauty_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "bridal_concierges_userId_key" ON "bridal_concierges"("userId");

-- CreateIndex
CREATE INDEX "bridal_services_conciergeId_idx" ON "bridal_services"("conciergeId");

-- CreateIndex
CREATE UNIQUE INDEX "technician_badges_key_key" ON "technician_badges"("key");

-- CreateIndex
CREATE INDEX "technician_badge_assignments_technicianId_idx" ON "technician_badge_assignments"("technicianId");

-- CreateIndex
CREATE UNIQUE INDEX "technician_badge_assignments_technicianId_badgeId_key" ON "technician_badge_assignments"("technicianId", "badgeId");

-- CreateIndex
CREATE INDEX "beauty_events_startsAt_idx" ON "beauty_events"("startsAt");

-- CreateIndex
CREATE INDEX "beauty_events_isPublished_idx" ON "beauty_events"("isPublished");

-- CreateIndex
CREATE INDEX "self_care_checkins_userId_createdAt_idx" ON "self_care_checkins"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "beauty_budgets_userId_month_key" ON "beauty_budgets"("userId", "month");

-- CreateIndex
CREATE INDEX "inspiration_pins_userId_idx" ON "inspiration_pins"("userId");

-- CreateIndex
CREATE INDEX "recurring_bookings_userId_status_idx" ON "recurring_bookings"("userId", "status");

-- CreateIndex
CREATE INDEX "community_posts_createdAt_idx" ON "community_posts"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "community_likes_postId_userId_key" ON "community_likes"("postId", "userId");

-- CreateIndex
CREATE INDEX "community_comments_postId_idx" ON "community_comments"("postId");

-- CreateIndex
CREATE INDEX "beauty_posts_isApproved_createdAt_idx" ON "beauty_posts"("isApproved", "createdAt");

-- CreateIndex
CREATE INDEX "beauty_posts_featured_createdAt_idx" ON "beauty_posts"("featured", "createdAt");

-- CreateIndex
CREATE INDEX "beauty_post_likes_postId_idx" ON "beauty_post_likes"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "beauty_post_likes_postId_userId_key" ON "beauty_post_likes"("postId", "userId");

-- CreateIndex
CREATE INDEX "beauty_post_comments_postId_createdAt_idx" ON "beauty_post_comments"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "beauty_post_engagements_postId_kind_idx" ON "beauty_post_engagements"("postId", "kind");

-- CreateIndex
CREATE INDEX "beauty_post_engagements_kind_createdAt_idx" ON "beauty_post_engagements"("kind", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_eventId_userId_key" ON "event_registrations"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "event_certificates_registrationId_key" ON "event_certificates"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "event_certificates_certificateNumber_key" ON "event_certificates"("certificateNumber");

-- CreateIndex
CREATE INDEX "home_service_requests_userId_idx" ON "home_service_requests"("userId");

-- CreateIndex
CREATE INDEX "home_service_requests_vendorId_status_idx" ON "home_service_requests"("vendorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "vip_memberships_userId_key" ON "vip_memberships"("userId");

-- CreateIndex
CREATE INDEX "shorts_isApproved_isActive_idx" ON "shorts"("isApproved", "isActive");

-- CreateIndex
CREATE INDEX "shorts_technicianId_idx" ON "shorts"("technicianId");

-- CreateIndex
CREATE UNIQUE INDEX "short_likes_shortId_userId_key" ON "short_likes"("shortId", "userId");

-- CreateIndex
CREATE INDEX "price_drop_alerts_userId_idx" ON "price_drop_alerts"("userId");

-- CreateIndex
CREATE INDEX "warranty_claims_userId_idx" ON "warranty_claims"("userId");

-- CreateIndex
CREATE INDEX "spa_plans_userId_idx" ON "spa_plans"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "routine_steps_userId_routineId_stepIndex_key" ON "routine_steps"("userId", "routineId", "stepIndex");

-- CreateIndex
CREATE INDEX "quiz_certificates_userId_idx" ON "quiz_certificates"("userId");

-- CreateIndex
CREATE INDEX "beauty_boxes_userId_idx" ON "beauty_boxes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "sale_alerts_userId_idx" ON "sale_alerts"("userId");

-- CreateIndex
CREATE INDEX "hair_color_sims_userId_idx" ON "hair_color_sims"("userId");

-- CreateIndex
CREATE INDEX "ai_routines_userId_idx" ON "ai_routines"("userId");

-- CreateIndex
CREATE INDEX "dna_analyses_userId_idx" ON "dna_analyses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "bingo_progress_userId_taskId_key" ON "bingo_progress"("userId", "taskId");

-- CreateIndex
CREATE INDEX "ingredient_scans_userId_idx" ON "ingredient_scans"("userId");

-- CreateIndex
CREATE INDEX "service_recommendations_userId_idx" ON "service_recommendations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "night_mode_settings_userId_key" ON "night_mode_settings"("userId");

-- CreateIndex
CREATE INDEX "travel_kit_items_userId_idx" ON "travel_kit_items"("userId");

-- CreateIndex
CREATE INDEX "gift_registries_userId_idx" ON "gift_registries"("userId");

-- CreateIndex
CREATE INDEX "gift_registry_contributions_registryId_idx" ON "gift_registry_contributions"("registryId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "birthday_rewards_promoCode_key" ON "birthday_rewards"("promoCode");

-- CreateIndex
CREATE UNIQUE INDEX "birthday_rewards_userId_year_key" ON "birthday_rewards"("userId", "year");

-- CreateIndex
CREATE INDEX "savings_goals_userId_idx" ON "savings_goals"("userId");

-- CreateIndex
CREATE INDEX "savings_goals_bnplPlanId_idx" ON "savings_goals"("bnplPlanId");

-- CreateIndex
CREATE INDEX "technician_follows_customerId_idx" ON "technician_follows"("customerId");

-- CreateIndex
CREATE INDEX "technician_follows_technicianId_idx" ON "technician_follows"("technicianId");

-- CreateIndex
CREATE UNIQUE INDEX "technician_follows_customerId_technicianId_key" ON "technician_follows"("customerId", "technicianId");

-- CreateIndex
CREATE INDEX "beauty_journals_userId_createdAt_idx" ON "beauty_journals"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "flash_deals_isActive_startsAt_endsAt_idx" ON "flash_deals"("isActive", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "family_members_userId_idx" ON "family_members"("userId");

-- CreateIndex
CREATE INDEX "skin_diary_entries_userId_createdAt_idx" ON "skin_diary_entries"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "wellness_checkins_userId_idx" ON "wellness_checkins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "wellness_checkins_userId_date_key" ON "wellness_checkins"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "pen_pal_profiles_userId_key" ON "pen_pal_profiles"("userId");

-- CreateIndex
CREATE INDEX "live_chat_messages_userId_createdAt_idx" ON "live_chat_messages"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "qa_questions_category_isAnswered_idx" ON "qa_questions"("category", "isAnswered");

-- CreateIndex
CREATE INDEX "mood_boards_userId_idx" ON "mood_boards"("userId");

-- CreateIndex
CREATE INDEX "mood_board_pins_boardId_idx" ON "mood_board_pins"("boardId");

-- CreateIndex
CREATE INDEX "service_wishlist_items_userId_idx" ON "service_wishlist_items"("userId");

-- CreateIndex
CREATE INDEX "gift_card_listings_sellerId_idx" ON "gift_card_listings"("sellerId");

-- CreateIndex
CREATE INDEX "expiry_tracker_items_userId_idx" ON "expiry_tracker_items"("userId");

-- CreateIndex
CREATE INDEX "restock_reminder_items_userId_idx" ON "restock_reminder_items"("userId");

-- CreateIndex
CREATE INDEX "cycle_entries_userId_idx" ON "cycle_entries"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cycle_settings_userId_key" ON "cycle_settings"("userId");

-- CreateIndex
CREATE INDEX "cycle_periods_userId_startDate_idx" ON "cycle_periods"("userId", "startDate");

-- CreateIndex
CREATE INDEX "beauty_closet_products_userId_idx" ON "beauty_closet_products"("userId");

-- CreateIndex
CREATE INDEX "beauty_parties_userId_idx" ON "beauty_parties"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "allergen_profiles_userId_key" ON "allergen_profiles"("userId");

-- CreateIndex
CREATE INDEX "beauty_budget_items_userId_idx" ON "beauty_budget_items"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_participants_userId_challengeKey_key" ON "challenge_participants"("userId", "challengeKey");

-- CreateIndex
CREATE INDEX "virtual_consultations_userId_idx" ON "virtual_consultations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "salon_memberships_userId_key" ON "salon_memberships"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_userId_courseId_key" ON "course_enrollments"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "corporate_plans_key_key" ON "corporate_plans"("key");

-- CreateIndex
CREATE UNIQUE INDEX "gift_quiz_questions_questionKey_key" ON "gift_quiz_questions"("questionKey");

-- CreateIndex
CREATE UNIQUE INDEX "matchmaker_questions_questionKey_key" ON "matchmaker_questions"("questionKey");

-- CreateIndex
CREATE INDEX "geo_promotions_city_isActive_idx" ON "geo_promotions"("city", "isActive");

-- CreateIndex
CREATE INDEX "geo_promotions_startsAt_endsAt_idx" ON "geo_promotions"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "live_streams_status_scheduledAt_idx" ON "live_streams"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "live_streams_technicianId_idx" ON "live_streams"("technicianId");

-- CreateIndex
CREATE INDEX "pricing_rules_serviceId_dayOfWeek_isActive_idx" ON "pricing_rules"("serviceId", "dayOfWeek", "isActive");

-- CreateIndex
CREATE INDEX "beauty_bundles_isActive_sortOrder_idx" ON "beauty_bundles"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "beauty_circles_topic_idx" ON "beauty_circles"("topic");

-- CreateIndex
CREATE INDEX "beauty_circles_members_idx" ON "beauty_circles"("members");

-- CreateIndex
CREATE INDEX "beauty_circle_members_userId_idx" ON "beauty_circle_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "beauty_circle_members_circleId_userId_key" ON "beauty_circle_members"("circleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "kindness_accounts_userId_key" ON "kindness_accounts"("userId");

-- CreateIndex
CREATE INDEX "kindness_accounts_points_idx" ON "kindness_accounts"("points");

-- CreateIndex
CREATE INDEX "kindness_transactions_accountId_idx" ON "kindness_transactions"("accountId");

-- CreateIndex
CREATE INDEX "sisterhood_compliments_createdAt_idx" ON "sisterhood_compliments"("createdAt");

-- CreateIndex
CREATE INDEX "emergency_contacts_userId_idx" ON "emergency_contacts"("userId");

-- CreateIndex
CREATE INDEX "escort_requests_userId_idx" ON "escort_requests"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "beauty_heritage_practices_name_key" ON "beauty_heritage_practices"("name");

-- CreateIndex
CREATE INDEX "green_salons_isVerified_idx" ON "green_salons"("isVerified");

-- CreateIndex
CREATE UNIQUE INDEX "she_leads_members_userId_key" ON "she_leads_members"("userId");

-- CreateIndex
CREATE INDEX "she_leads_members_isActive_idx" ON "she_leads_members"("isActive");

-- CreateIndex
CREATE INDEX "she_leads_members_role_idx" ON "she_leads_members"("role");

-- CreateIndex
CREATE INDEX "community_events_date_idx" ON "community_events"("date");

-- CreateIndex
CREATE UNIQUE INDEX "community_event_attendees_eventId_userId_key" ON "community_event_attendees"("eventId", "userId");

-- CreateIndex
CREATE INDEX "sensory_friendly_salons_isCertified_idx" ON "sensory_friendly_salons"("isCertified");

-- CreateIndex
CREATE INDEX "beauty_myths_category_idx" ON "beauty_myths"("category");

-- CreateIndex
CREATE INDEX "beauty_quiz_attempts_userId_idx" ON "beauty_quiz_attempts"("userId");

-- CreateIndex
CREATE INDEX "seasonal_looks_season_idx" ON "seasonal_looks"("season");

-- CreateIndex
CREATE INDEX "beauty_habits_userId_idx" ON "beauty_habits"("userId");

-- CreateIndex
CREATE INDEX "accountability_partners_userId_idx" ON "accountability_partners"("userId");

-- CreateIndex
CREATE INDEX "accountability_partners_goal_idx" ON "accountability_partners"("goal");

-- CreateIndex
CREATE INDEX "vision_goals_userId_idx" ON "vision_goals"("userId");

-- CreateIndex
CREATE INDEX "gratitude_notes_createdAt_idx" ON "gratitude_notes"("createdAt");

-- CreateIndex
CREATE INDEX "sleep_logs_userId_idx" ON "sleep_logs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "sleep_logs_userId_date_key" ON "sleep_logs"("userId", "date");

-- CreateIndex
CREATE INDEX "concierge_requests_userId_idx" ON "concierge_requests"("userId");

-- CreateIndex
CREATE INDEX "time_capsules_userId_idx" ON "time_capsules"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "secret_santa_participants_groupId_userId_key" ON "secret_santa_participants"("groupId", "userId");

-- CreateIndex
CREATE INDEX "beauty_skills_userId_idx" ON "beauty_skills"("userId");

-- CreateIndex
CREATE INDEX "beauty_playlists_mood_idx" ON "beauty_playlists"("mood");

-- CreateIndex
CREATE UNIQUE INDEX "book_club_members_clubId_userId_key" ON "book_club_members"("clubId", "userId");

-- CreateIndex
CREATE INDEX "savings_milestones_userId_idx" ON "savings_milestones"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "certification_enrollments_userId_pathId_key" ON "certification_enrollments"("userId", "pathId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_achievements_userId_achievementKey_key" ON "customer_achievements"("userId", "achievementKey");

-- CreateIndex
CREATE INDEX "customer_feedback_category_idx" ON "customer_feedback"("category");

-- CreateIndex
CREATE UNIQUE INDEX "survey_responses_userId_surveyId_key" ON "survey_responses"("userId", "surveyId");

-- CreateIndex
CREATE INDEX "beauty_memories_userId_idx" ON "beauty_memories"("userId");

-- CreateIndex
CREATE INDEX "class_pass_purchases_userId_idx" ON "class_pass_purchases"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "beauty_partners_userId_key" ON "beauty_partners"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_responses_userId_key" ON "onboarding_responses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_preferences_userId_key" ON "customer_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "technician_ratings_bookingId_key" ON "technician_ratings"("bookingId");

-- CreateIndex
CREATE INDEX "technician_ratings_technicianId_idx" ON "technician_ratings"("technicianId");

-- CreateIndex
CREATE UNIQUE INDEX "beauty_integrations_userId_provider_key" ON "beauty_integrations"("userId", "provider");

-- CreateIndex
CREATE INDEX "customer_milestones_userId_idx" ON "customer_milestones"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "beauty_coupons_code_key" ON "beauty_coupons"("code");

-- CreateIndex
CREATE INDEX "service_queue_entries_technicianId_status_idx" ON "service_queue_entries"("technicianId", "status");

-- CreateIndex
CREATE INDEX "measurement_logs_userId_createdAt_idx" ON "measurement_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "menopause_logs_userId_createdAt_idx" ON "menopause_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "bnpl_plans_userId_status_idx" ON "bnpl_plans"("userId", "status");

-- CreateIndex
CREATE INDEX "nail_bar_slots_nailBarId_startAt_idx" ON "nail_bar_slots"("nailBarId", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "nail_bar_bookings_code_key" ON "nail_bar_bookings"("code");

-- CreateIndex
CREATE INDEX "nail_bar_bookings_customerId_idx" ON "nail_bar_bookings"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "nail_bar_bookings_slotId_customerId_key" ON "nail_bar_bookings"("slotId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "nps_responses_bookingId_key" ON "nps_responses"("bookingId");

-- CreateIndex
CREATE INDEX "nps_responses_userId_createdAt_idx" ON "nps_responses"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "consent_records_userId_idx" ON "consent_records"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "consent_records_userId_type_key" ON "consent_records"("userId", "type");

-- CreateIndex
CREATE INDEX "ab_test_events_testKey_variant_eventType_idx" ON "ab_test_events"("testKey", "variant", "eventType");

-- CreateIndex
CREATE INDEX "seasonal_services_season_startDate_endDate_idx" ON "seasonal_services"("season", "startDate", "endDate");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reset_tokens" ADD CONSTRAINT "reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "loyalty_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_variants" ADD CONSTRAINT "service_variants_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_pricing_rules" ADD CONSTRAINT "service_pricing_rules_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_pricing_rules" ADD CONSTRAINT "service_pricing_rules_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_bundles" ADD CONSTRAINT "service_bundles_primaryServiceId_fkey" FOREIGN KEY ("primaryServiceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_bundles" ADD CONSTRAINT "service_bundles_childServiceId_fkey" FOREIGN KEY ("childServiceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_addons" ADD CONSTRAINT "service_addons_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_addons" ADD CONSTRAINT "service_addons_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tag_assignments" ADD CONSTRAINT "service_tag_assignments_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tag_assignments" ADD CONSTRAINT "service_tag_assignments_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "service_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_services" ADD CONSTRAINT "technician_services_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_services" ADD CONSTRAINT "technician_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "family_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "service_bundles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_beautyBundleId_fkey" FOREIGN KEY ("beautyBundleId") REFERENCES "beauty_bundles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_raisedBy_fkey" FOREIGN KEY ("raisedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terms_acceptances" ADD CONSTRAINT "terms_acceptances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zatca_invoices" ADD CONSTRAINT "zatca_invoices_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zatca_audit_logs" ADD CONSTRAINT "zatca_audit_logs_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "zatca_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_ai_subscriptions" ADD CONSTRAINT "customer_ai_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ai_subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "customer_ai_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "areas" ADD CONSTRAINT "areas_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "saudi_cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_prizes" ADD CONSTRAINT "referral_prizes_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "influencers" ADD CONSTRAINT "influencers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_cards" ADD CONSTRAINT "saved_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_usages" ADD CONSTRAINT "promo_usages_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "promo_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_usages" ADD CONSTRAINT "promo_usages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_subscriptions" ADD CONSTRAINT "customer_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_subscriptions" ADD CONSTRAINT "customer_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_sessions" ADD CONSTRAINT "video_sessions_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skin_analyses" ADD CONSTRAINT "skin_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_slots" ADD CONSTRAINT "clinic_slots_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_slots" ADD CONSTRAINT "clinic_slots_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "clinic_consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_consultations" ADD CONSTRAINT "clinic_consultations_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_consultations" ADD CONSTRAINT "clinic_consultations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_classes" ADD CONSTRAINT "gym_classes_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_class_bookings" ADD CONSTRAINT "gym_class_bookings_classId_fkey" FOREIGN KEY ("classId") REFERENCES "gym_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_class_bookings" ADD CONSTRAINT "gym_class_bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_deals" ADD CONSTRAINT "store_deals_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_deals" ADD CONSTRAINT "store_deals_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_booking_members" ADD CONSTRAINT "group_booking_members_groupBookingId_fkey" FOREIGN KEY ("groupBookingId") REFERENCES "group_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beauty_packages" ADD CONSTRAINT "beauty_packages_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beauty_package_services" ADD CONSTRAINT "beauty_package_services_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "beauty_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bridal_services" ADD CONSTRAINT "bridal_services_conciergeId_fkey" FOREIGN KEY ("conciergeId") REFERENCES "bridal_concierges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_badge_assignments" ADD CONSTRAINT "technician_badge_assignments_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "technician_badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_certificates" ADD CONSTRAINT "event_certificates_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "event_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_bnplPlanId_fkey" FOREIGN KEY ("bnplPlanId") REFERENCES "bnpl_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_board_pins" ADD CONSTRAINT "mood_board_pins_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "mood_boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "beauty_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beauty_circle_members" ADD CONSTRAINT "beauty_circle_members_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "beauty_circles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beauty_circle_members" ADD CONSTRAINT "beauty_circle_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kindness_accounts" ADD CONSTRAINT "kindness_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kindness_transactions" ADD CONSTRAINT "kindness_transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "kindness_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_event_attendees" ADD CONSTRAINT "community_event_attendees_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "community_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secret_santa_participants" ADD CONSTRAINT "secret_santa_participants_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "secret_santa_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_club_members" ADD CONSTRAINT "book_club_members_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "book_clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_enrollments" ADD CONSTRAINT "certification_enrollments_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "certification_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "beauty_surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_passes" ADD CONSTRAINT "class_passes_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_pass_purchases" ADD CONSTRAINT "class_pass_purchases_passId_fkey" FOREIGN KEY ("passId") REFERENCES "class_passes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nail_bar_slots" ADD CONSTRAINT "nail_bar_slots_nailBarId_fkey" FOREIGN KEY ("nailBarId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nail_bar_bookings" ADD CONSTRAINT "nail_bar_bookings_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "nail_bar_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nps_responses" ADD CONSTRAINT "nps_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seasonal_services" ADD CONSTRAINT "seasonal_services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

