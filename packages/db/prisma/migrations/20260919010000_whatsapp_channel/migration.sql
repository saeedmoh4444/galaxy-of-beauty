-- 6.5 WhatsApp Business — per-channel opt-in for proactive WhatsApp sends.
-- Defaults to false: WhatsApp reminders are opt-in, unlike in_app/push.
ALTER TABLE "notification_preferences" ADD COLUMN "whatsappAlerts" BOOLEAN NOT NULL DEFAULT false;
