-- P3-01: Archive the Affirmation feature.
--
-- The affirmations router had zero web/mobile consumers, zero tests, and
-- zero rows (both tables verified empty before dropping). Sisterhood
-- Compliments is the live replacement surface. BeautySanta and
-- BeautyQuest were already removed from the schema in earlier work.
DROP TABLE "affirmation_favorites";
DROP TABLE "affirmations";
