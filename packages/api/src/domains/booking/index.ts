// ── Booking Domain ──
// Booking lifecycle, slots/availability, calendar sync, reschedule, recurring, group, emergency
export { bookingRouter } from '../../routers/bookings';
export { slotRouter } from '../../routers/slots';
export { calendarRouter } from '../../routers/calendar';
export { rescheduleRouter } from '../../routers/reschedule';
export { recurringBookingRouter } from '../../routers/recurringBookings';
export { emergencyBookingRouter } from '../../routers/emergencyBooking';
export { advancedBookingRouter } from '../../routers/advancedBooking';
export { groupBookingRouter } from '../../routers/groupBookings';
export { waitlistRouter } from '../../routers/waitlist';
export { calendarSyncRouter } from '../../routers/calendarSync';
export { bookingChecklistRouter } from '../../routers/bookingChecklist';
export { bookingHeatmapRouter } from '../../routers/bookingHeatmap';
export { serviceQueueRouter } from '../../routers/serviceQueue';
