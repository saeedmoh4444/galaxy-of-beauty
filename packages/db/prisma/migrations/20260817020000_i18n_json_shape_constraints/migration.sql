-- P3-02: DB-level shape validation for localization JSON columns.
-- Every { ar, en } JSON field must contain both keys (jsonb ? operator).
-- Nullable columns allow NULL. Legacy rows missing the en key were
-- backfilled (en := ar) before these constraints were added.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_loyalty_rewards_nameJson_i18n') THEN
    ALTER TABLE "loyalty_rewards" ADD CONSTRAINT chk_loyalty_rewards_nameJson_i18n CHECK ("nameJson" ? 'ar' AND "nameJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_loyalty_rewards_descriptionJson_i18n') THEN
    ALTER TABLE "loyalty_rewards" ADD CONSTRAINT chk_loyalty_rewards_descriptionJson_i18n CHECK ("descriptionJson" ? 'ar' AND "descriptionJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_technicians_bioJson_i18n') THEN
    ALTER TABLE "technicians" ADD CONSTRAINT chk_technicians_bioJson_i18n CHECK ("bioJson" IS NULL OR ("bioJson" ? 'ar' AND "bioJson" ? 'en'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_categories_nameJson_i18n') THEN
    ALTER TABLE "categories" ADD CONSTRAINT chk_categories_nameJson_i18n CHECK ("nameJson" ? 'ar' AND "nameJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_services_titleJson_i18n') THEN
    ALTER TABLE "services" ADD CONSTRAINT chk_services_titleJson_i18n CHECK ("titleJson" ? 'ar' AND "titleJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_services_descriptionJson_i18n') THEN
    ALTER TABLE "services" ADD CONSTRAINT chk_services_descriptionJson_i18n CHECK ("descriptionJson" IS NULL OR ("descriptionJson" ? 'ar' AND "descriptionJson" ? 'en'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_service_variants_nameJson_i18n') THEN
    ALTER TABLE "service_variants" ADD CONSTRAINT chk_service_variants_nameJson_i18n CHECK ("nameJson" ? 'ar' AND "nameJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_service_tags_nameJson_i18n') THEN
    ALTER TABLE "service_tags" ADD CONSTRAINT chk_service_tags_nameJson_i18n CHECK ("nameJson" ? 'ar' AND "nameJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_notifications_titleJson_i18n') THEN
    ALTER TABLE "notifications" ADD CONSTRAINT chk_notifications_titleJson_i18n CHECK ("titleJson" ? 'ar' AND "titleJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_notifications_bodyJson_i18n') THEN
    ALTER TABLE "notifications" ADD CONSTRAINT chk_notifications_bodyJson_i18n CHECK ("bodyJson" ? 'ar' AND "bodyJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_ai_subscription_plans_nameJson_i18n') THEN
    ALTER TABLE "ai_subscription_plans" ADD CONSTRAINT chk_ai_subscription_plans_nameJson_i18n CHECK ("nameJson" ? 'ar' AND "nameJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_achievements_nameJson_i18n') THEN
    ALTER TABLE "achievements" ADD CONSTRAINT chk_achievements_nameJson_i18n CHECK ("nameJson" ? 'ar' AND "nameJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_achievements_descriptionJson_i18n') THEN
    ALTER TABLE "achievements" ADD CONSTRAINT chk_achievements_descriptionJson_i18n CHECK ("descriptionJson" ? 'ar' AND "descriptionJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_gallery_images_captionJson_i18n') THEN
    ALTER TABLE "gallery_images" ADD CONSTRAINT chk_gallery_images_captionJson_i18n CHECK ("captionJson" IS NULL OR ("captionJson" ? 'ar' AND "captionJson" ? 'en'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_subscription_plans_nameJson_i18n') THEN
    ALTER TABLE "subscription_plans" ADD CONSTRAINT chk_subscription_plans_nameJson_i18n CHECK ("nameJson" ? 'ar' AND "nameJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_subscription_plans_descriptionJson_i18n') THEN
    ALTER TABLE "subscription_plans" ADD CONSTRAINT chk_subscription_plans_descriptionJson_i18n CHECK ("descriptionJson" ? 'ar' AND "descriptionJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_product_categories_nameJson_i18n') THEN
    ALTER TABLE "product_categories" ADD CONSTRAINT chk_product_categories_nameJson_i18n CHECK ("nameJson" ? 'ar' AND "nameJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_nameJson_i18n') THEN
    ALTER TABLE "products" ADD CONSTRAINT chk_products_nameJson_i18n CHECK ("nameJson" ? 'ar' AND "nameJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_descriptionJson_i18n') THEN
    ALTER TABLE "products" ADD CONSTRAINT chk_products_descriptionJson_i18n CHECK ("descriptionJson" ? 'ar' AND "descriptionJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_vendors_descriptionJson_i18n') THEN
    ALTER TABLE "vendors" ADD CONSTRAINT chk_vendors_descriptionJson_i18n CHECK ("descriptionJson" IS NULL OR ("descriptionJson" ? 'ar' AND "descriptionJson" ? 'en'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_beauty_packages_nameJson_i18n') THEN
    ALTER TABLE "beauty_packages" ADD CONSTRAINT chk_beauty_packages_nameJson_i18n CHECK ("nameJson" ? 'ar' AND "nameJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_beauty_packages_descriptionJson_i18n') THEN
    ALTER TABLE "beauty_packages" ADD CONSTRAINT chk_beauty_packages_descriptionJson_i18n CHECK ("descriptionJson" IS NULL OR ("descriptionJson" ? 'ar' AND "descriptionJson" ? 'en'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_campaigns_nameJson_i18n') THEN
    ALTER TABLE "campaigns" ADD CONSTRAINT chk_campaigns_nameJson_i18n CHECK ("nameJson" ? 'ar' AND "nameJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_campaigns_descriptionJson_i18n') THEN
    ALTER TABLE "campaigns" ADD CONSTRAINT chk_campaigns_descriptionJson_i18n CHECK ("descriptionJson" IS NULL OR ("descriptionJson" ? 'ar' AND "descriptionJson" ? 'en'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_blog_posts_titleJson_i18n') THEN
    ALTER TABLE "blog_posts" ADD CONSTRAINT chk_blog_posts_titleJson_i18n CHECK ("titleJson" ? 'ar' AND "titleJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_blog_posts_bodyJson_i18n') THEN
    ALTER TABLE "blog_posts" ADD CONSTRAINT chk_blog_posts_bodyJson_i18n CHECK ("bodyJson" ? 'ar' AND "bodyJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_technician_badges_nameJson_i18n') THEN
    ALTER TABLE "technician_badges" ADD CONSTRAINT chk_technician_badges_nameJson_i18n CHECK ("nameJson" ? 'ar' AND "nameJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_beauty_events_nameJson_i18n') THEN
    ALTER TABLE "beauty_events" ADD CONSTRAINT chk_beauty_events_nameJson_i18n CHECK ("nameJson" ? 'ar' AND "nameJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_beauty_events_descriptionJson_i18n') THEN
    ALTER TABLE "beauty_events" ADD CONSTRAINT chk_beauty_events_descriptionJson_i18n CHECK ("descriptionJson" IS NULL OR ("descriptionJson" ? 'ar' AND "descriptionJson" ? 'en'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_beauty_courses_titleJson_i18n') THEN
    ALTER TABLE "beauty_courses" ADD CONSTRAINT chk_beauty_courses_titleJson_i18n CHECK ("titleJson" ? 'ar' AND "titleJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_beauty_courses_descJson_i18n') THEN
    ALTER TABLE "beauty_courses" ADD CONSTRAINT chk_beauty_courses_descJson_i18n CHECK ("descJson" IS NULL OR ("descJson" ? 'ar' AND "descJson" ? 'en'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_corporate_plans_nameJson_i18n') THEN
    ALTER TABLE "corporate_plans" ADD CONSTRAINT chk_corporate_plans_nameJson_i18n CHECK ("nameJson" ? 'ar' AND "nameJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_gift_quiz_questions_questionJson_i18n') THEN
    ALTER TABLE "gift_quiz_questions" ADD CONSTRAINT chk_gift_quiz_questions_questionJson_i18n CHECK ("questionJson" ? 'ar' AND "questionJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_gift_quiz_recommendations_nameJson_i18n') THEN
    ALTER TABLE "gift_quiz_recommendations" ADD CONSTRAINT chk_gift_quiz_recommendations_nameJson_i18n CHECK ("nameJson" ? 'ar' AND "nameJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_gift_quiz_recommendations_descJson_i18n') THEN
    ALTER TABLE "gift_quiz_recommendations" ADD CONSTRAINT chk_gift_quiz_recommendations_descJson_i18n CHECK ("descJson" IS NULL OR ("descJson" ? 'ar' AND "descJson" ? 'en'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_compare_products_nameJson_i18n') THEN
    ALTER TABLE "compare_products" ADD CONSTRAINT chk_compare_products_nameJson_i18n CHECK ("nameJson" ? 'ar' AND "nameJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_geo_promotions_titleJson_i18n') THEN
    ALTER TABLE "geo_promotions" ADD CONSTRAINT chk_geo_promotions_titleJson_i18n CHECK ("titleJson" ? 'ar' AND "titleJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_geo_promotions_descriptionJson_i18n') THEN
    ALTER TABLE "geo_promotions" ADD CONSTRAINT chk_geo_promotions_descriptionJson_i18n CHECK ("descriptionJson" IS NULL OR ("descriptionJson" ? 'ar' AND "descriptionJson" ? 'en'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_live_streams_titleJson_i18n') THEN
    ALTER TABLE "live_streams" ADD CONSTRAINT chk_live_streams_titleJson_i18n CHECK ("titleJson" ? 'ar' AND "titleJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_live_streams_descriptionJson_i18n') THEN
    ALTER TABLE "live_streams" ADD CONSTRAINT chk_live_streams_descriptionJson_i18n CHECK ("descriptionJson" IS NULL OR ("descriptionJson" ? 'ar' AND "descriptionJson" ? 'en'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_pricing_rules_labelJson_i18n') THEN
    ALTER TABLE "pricing_rules" ADD CONSTRAINT chk_pricing_rules_labelJson_i18n CHECK ("labelJson" IS NULL OR ("labelJson" ? 'ar' AND "labelJson" ? 'en'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_beauty_bundles_titleJson_i18n') THEN
    ALTER TABLE "beauty_bundles" ADD CONSTRAINT chk_beauty_bundles_titleJson_i18n CHECK ("titleJson" ? 'ar' AND "titleJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_beauty_bundles_descriptionJson_i18n') THEN
    ALTER TABLE "beauty_bundles" ADD CONSTRAINT chk_beauty_bundles_descriptionJson_i18n CHECK ("descriptionJson" IS NULL OR ("descriptionJson" ? 'ar' AND "descriptionJson" ? 'en'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_beauty_plans_nameJson_i18n') THEN
    ALTER TABLE "beauty_plans" ADD CONSTRAINT chk_beauty_plans_nameJson_i18n CHECK ("nameJson" ? 'ar' AND "nameJson" ? 'en');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_beauty_plans_descriptionJson_i18n') THEN
    ALTER TABLE "beauty_plans" ADD CONSTRAINT chk_beauty_plans_descriptionJson_i18n CHECK ("descriptionJson" IS NULL OR ("descriptionJson" ? 'ar' AND "descriptionJson" ? 'en'));
  END IF;
END $$;
