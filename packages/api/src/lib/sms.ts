// ── Types ──────────────────────────────────────────────────

interface SmsConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

function getTwilioConfig(): SmsConfig | null {
  const sid = process.env['TWILIO_ACCOUNT_SID'];
  const token = process.env['TWILIO_AUTH_TOKEN'];
  const from = process.env['TWILIO_PHONE_NUMBER'];

  if (!sid || !token || !from) return null;
  return { accountSid: sid, authToken: token, fromNumber: from };
}

// ── SMS Sending ────────────────────────────────────────────

export async function sendSms(
  to: string,
  message: string,
): Promise<boolean> {
  const config = getTwilioConfig();

  if (!config) {
    // Twilio not configured — log for development
    // eslint-disable-next-line no-console
    console.log(`[SMS] Would send to ${to}: "${message.slice(0, 80)}..."`);
    return true;
  }

  try {
    // Use Twilio REST API directly (avoid extra dependency)
    const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64');
    const body = new URLSearchParams({
      To: to,
      From: config.fromNumber,
      Body: message,
    }).toString();

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      },
    );

    return response.ok;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[SMS] Failed to send:', err);
    return false;
  }
}

// ── Templated Messages ─────────────────────────────────────

export async function sendBookingConfirmationSms(
  phone: string,
  bookingCode: string,
  date: string,
  locale: 'ar' | 'en' = 'ar',
): Promise<void> {
  const message = locale === 'ar'
    ? `تم تأكيد حجزك في جالكسي بيوتي!\nرمز الحجز: ${bookingCode}\nالتاريخ: ${date}\nشكراً لثقتك`
    : `Your Galaxy of Beauty booking is confirmed!\nBooking code: ${bookingCode}\nDate: ${date}\nThank you!`;

  await sendSms(phone, message);
}

export async function sendBookingReminderSms(
  phone: string,
  bookingCode: string,
  hoursUntil: number,
  locale: 'ar' | 'en' = 'ar',
): Promise<void> {
  const message = locale === 'ar'
    ? `تذكير: حجزك (${bookingCode}) بعد ${hoursUntil} ساعة. جالكسي بيوتي`
    : `Reminder: Your booking (${bookingCode}) is in ${hoursUntil} hours. Galaxy of Beauty`;

  await sendSms(phone, message);
}

export async function sendOtpSms(
  phone: string,
  code: string,
): Promise<void> {
  const message = `رمز التحقق الخاص بك في جالكسي بيوتي: ${code}\nYour Galaxy of Beauty verification code: ${code}`;
  await sendSms(phone, message);
}
