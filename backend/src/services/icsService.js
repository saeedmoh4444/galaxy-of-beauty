/**
 * iCalendar (.ics) File Generator
 *
 * Generates .ics files so customers can add bookings to
 * Google Calendar, Apple Calendar, Outlook, etc.
 *
 * Also generates a calendar feed URL for ongoing sync.
 */

/**
 * Generate an .ics file for a booking.
 *
 * @param {object} booking - Booking with customer, technician, service, and slot data
 * @returns {string} .ics file content
 */
export function generateBookingIcs(booking) {
  const now = formatICSDate(new Date());
  const startAt = formatICSDate(new Date(booking.startAt));
  const endAt = formatICSDate(new Date(booking.endAt));
  const uid = `gob-${booking.bookingCode}@galaxyofbeauty.sa`;

  const serviceName = booking.service?.titleJson?.ar
    || booking.service?.titleJson?.en
    || 'Beauty Service';

  const technicianName = booking.technician?.name || 'Technician';
  const location = booking.address
    ? `${booking.address.street || ''}, ${booking.address.area || ''}, ${booking.address.city || ''}`
    : '';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Galaxy of Beauty//Booking Calendar//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${startAt}`,
    `DTEND:${endAt}`,
    `SUMMARY:${escapeICS(serviceName)} - Galaxy of Beauty`,
    `DESCRIPTION:${escapeICS(`✨ ${serviceName} مع ${technicianName}\\n\\nرقم الحجز: ${booking.bookingCode}\\nللاستفسار: support@galaxyofbeauty.sa`)}`,
    `LOCATION:${escapeICS(location)}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeICS(`تذكير: موعد ${serviceName} بعد ساعة`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Generate an .ics file for a technician's availability slot.
 */
export function generateSlotIcs(slot, technicianName) {
  const now = formatICSDate(new Date());
  const startAt = formatICSDate(new Date(slot.startAt));
  const endAt = formatICSDate(new Date(slot.endAt));
  const uid = `gob-slot-${slot.id}@galaxyofbeauty.sa`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Galaxy of Beauty//Availability//AR',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${startAt}`,
    `DTEND:${endAt}`,
    `SUMMARY:⛔ محجوز - ${escapeICS(technicianName || 'Galaxy of Beauty')}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Format a Date to iCalendar format: YYYYMMDDTHHmmssZ
 */
function formatICSDate(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Escape special characters for iCalendar text fields.
 */
function escapeICS(text) {
  return (text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export default { generateBookingIcs, generateSlotIcs };
