-- F4 — tech gallery video items.
-- imageUrl becomes nullable (a gallery item can be a video instead);
-- videoUrl stores the video source for inline playback.
ALTER TABLE "gallery_images" ALTER COLUMN "imageUrl" DROP NOT NULL;
ALTER TABLE "gallery_images" ADD COLUMN "videoUrl" TEXT;
