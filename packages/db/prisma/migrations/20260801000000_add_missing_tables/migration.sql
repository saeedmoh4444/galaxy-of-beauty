-- AlterTable
ALTER TABLE "services" ADD COLUMN     "isMommyFriendly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPregnancySafe" BOOLEAN NOT NULL DEFAULT false;

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beauty_packages_pkey" PRIMARY KEY ("id")
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
    "allergies" TEXT[],
    "preferredScents" TEXT[],
    "makeupStyle" TEXT,
    "concerns" TEXT[],
    "notes" TEXT,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cycle_entries_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "expiry_tracker_items_userId_idx" ON "expiry_tracker_items"("userId");

-- CreateIndex
CREATE INDEX "restock_reminder_items_userId_idx" ON "restock_reminder_items"("userId");

-- CreateIndex
CREATE INDEX "cycle_entries_userId_idx" ON "cycle_entries"("userId");

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

-- AddForeignKey
ALTER TABLE "group_booking_members" ADD CONSTRAINT "group_booking_members_groupBookingId_fkey" FOREIGN KEY ("groupBookingId") REFERENCES "group_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beauty_package_services" ADD CONSTRAINT "beauty_package_services_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "beauty_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bridal_services" ADD CONSTRAINT "bridal_services_conciergeId_fkey" FOREIGN KEY ("conciergeId") REFERENCES "bridal_concierges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_badge_assignments" ADD CONSTRAINT "technician_badge_assignments_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "technician_badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_board_pins" ADD CONSTRAINT "mood_board_pins_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "mood_boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 7.9.1                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
