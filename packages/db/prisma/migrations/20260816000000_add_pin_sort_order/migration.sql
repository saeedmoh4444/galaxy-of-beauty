-- AlterTable
ALTER TABLE "inspiration_pins" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "mood_board_pins" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
