// Booking flow + booking status strings.

export const bookingMessages = {
  'booking.selectService': { ar: 'اختيار الخدمة', en: 'Select Service' },
  'booking.selectTechnician': { ar: 'اختيار الفنية', en: 'Select Technician' },
  'booking.selectTime': { ar: 'اختيار الوقت', en: 'Select Time' },
  'booking.confirm': { ar: 'تأكيد الحجز', en: 'Confirm Booking' },
  'booking.status.REQUESTED': { ar: 'قيد الانتظار', en: 'Requested' },
  'booking.status.ACCEPTED': { ar: 'مقبول', en: 'Accepted' },
  'booking.status.COMPLETED': { ar: 'مكتمل', en: 'Completed' },
  'booking.status.CANCELLED': { ar: 'ملغي', en: 'Cancelled' },
  'booking.status.REJECTED': { ar: 'مرفوض', en: 'Rejected' },
  'booking.service': { ar: 'الخدمة', en: 'Service' },
  'booking.technician': { ar: 'الفنية', en: 'Technician' },
  'booking.dateTime': { ar: 'التاريخ والوقت', en: 'Date & Time' },
  'booking.summary': { ar: 'ملخص الحجز', en: 'Booking Summary' },
  'booking.discount': { ar: 'الخصم', en: 'Discount' },
} as const;
