// Booking flow + booking status strings.

export const bookingMessages = {
  'booking.selectService': { ar: 'اختيار الخدمة', en: 'Select Service' },
  'booking.selectTechnician': { ar: 'اختيار الفنية', en: 'Select Technician' },
  'booking.selectTime': { ar: 'اختيار الوقت', en: 'Select Time' },
  'booking.confirm': { ar: 'تأكيد الحجز', en: 'Confirm Booking' },
  'booking.status.REQUESTED': { ar: 'قيد الطلب', en: 'Requested' },
  'booking.status.ACCEPTED': { ar: 'مقبول', en: 'Accepted' },
  'booking.status.COMPLETED': { ar: 'مكتمل', en: 'Completed' },
  'booking.status.CANCELLED': { ar: 'ملغي', en: 'Cancelled' },
  'booking.status.REJECTED': { ar: 'مرفوض', en: 'Rejected' },
  'booking.status.PAID': { ar: 'مدفوع', en: 'Paid' },
  'booking.status.IN_PROGRESS': { ar: 'قيد التنفيذ', en: 'In Progress' },
  'booking.status.CONFIRMED_OFFLINE': { ar: 'مؤكد', en: 'Confirmed Offline' },
  'booking.status.NO_SHOW': { ar: 'لم تحضر', en: 'No Show' },
  'booking.status.PAYMENT_AUTHORIZED': { ar: 'تم الدفع', en: 'Payment Authorized' },
  'booking.service': { ar: 'الخدمة', en: 'Service' },
  'booking.technician': { ar: 'الفنية', en: 'Technician' },
  'booking.dateTime': { ar: 'التاريخ والوقت', en: 'Date & Time' },
  'booking.summary': { ar: 'ملخص الحجز', en: 'Booking Summary' },
  'booking.discount': { ar: 'الخصم', en: 'Discount' },

  // Customer bookings list
  'booking.my-bookings': { ar: 'حجوزاتي', en: 'My Bookings' },
  'booking.all': { ar: 'الكل', en: 'All' },
  'booking.load-error': { ar: 'فشل تحميل الحجوزات', en: 'Failed to load bookings' },
  'booking.no-bookings': { ar: 'لا توجد حجوزات', en: 'No bookings yet' },
  'booking.browse-services': { ar: 'تصفح الخدمات', en: 'Browse Services' },
  'booking.video': { ar: 'فيديو', en: 'Video' },
  'booking.confirm-cancel': { ar: 'تأكيد الإلغاء', en: 'Confirm Cancellation' },
  'booking.cancel-booking': { ar: 'إلغاء الحجز', en: 'Cancel Booking' },
  'booking.confirm-cancel-question': {
    ar: 'هل أنت متأكد من إلغاء هذا الحجز؟',
    en: 'Are you sure you want to cancel this booking?',
  },

  // Booking detail
  'booking.detail-error': { ar: 'فشل تحميل الحجز', en: 'Failed to load booking' },
  'booking.details': { ar: 'تفاصيل الحجز', en: 'Booking Details' },
  'booking.back-to-bookings': { ar: 'العودة للحجوزات', en: 'Back to Bookings' },
  'booking.code': { ar: 'رمز الحجز', en: 'Booking Code' },
  'booking.status-label': { ar: 'الحالة', en: 'Status' },
  'booking.amount': { ar: 'المبلغ', en: 'Amount' },
  'booking.date': { ar: 'التاريخ', en: 'Date' },
  'booking.time': { ar: 'الوقت', en: 'Time' },
  'booking.notes': { ar: 'ملاحظات', en: 'Notes' },

  // Booking create flow
  'booking.new-booking': { ar: 'حجز جديد', en: 'New Booking' },
  'booking.created-success': { ar: 'تم إنشاء الحجز بنجاح!', en: 'Booking created successfully!' },
  'booking.create-failed': { ar: 'فشل إنشاء الحجز', en: 'Failed to create booking' },
  'booking.select-service-address': {
    ar: 'الرجاء اختيار الخدمة والعنوان',
    en: 'Please select a service and an address',
  },
  'booking.no-technicians': {
    ar: 'لا توجد فنيات متاحة لهذه الخدمة حالياً',
    en: 'No technicians are currently available for this service',
  },
  'booking.step-details': { ar: 'التفاصيل', en: 'Details' },
  'booking.step-confirm': { ar: 'التأكيد', en: 'Confirmation' },
  'booking.choose-service': { ar: 'اختر الخدمة', en: 'Choose Service' },
  'booking.choose-variant': { ar: 'اختر المتغير', en: 'Choose Variant' },
  'booking.base-service': { ar: 'الخدمة الأساسية', en: 'Base Service' },
  'booking.choose-address': { ar: 'اختر العنوان', en: 'Choose Address' },
  'booking.choose-address-placeholder': { ar: 'اختر عنواناً...', en: 'Select an address...' },
  'booking.promo-code': { ar: 'كود الخصم (اختياري)', en: 'Promo Code (optional)' },
  'booking.promo-example': { ar: 'مثال: WELCOME20', en: 'e.g. WELCOME20' },
  'booking.notes-placeholder': { ar: 'أي ملاحظات إضافية...', en: 'Any additional notes...' },
  'booking.previous': { ar: 'السابق', en: 'Previous' },
  'booking.price': { ar: 'السعر', en: 'Price' },
  'booking.duration': { ar: 'المدة', en: 'Duration' },
  'booking.technician-confirm-note': {
    ar: '* ستقوم الفنية بتأكيد الموعد النهائي بعد مراجعة الحجز.',
    en: '* The technician will confirm the final appointment after reviewing your booking.',
  },

  // Booking confirmation page
  'booking.success-title': { ar: 'تم الحجز بنجاح!', en: 'Booking Confirmed!' },
  'booking.success-message': {
    ar: 'تم إنشاء حجزكِ بنجاح. سيتم تأكيد الموعد من قبل الفنية قريباً.',
    en: 'Your booking was created successfully. The technician will confirm the appointment shortly.',
  },
  'booking.calendar-title': {
    ar: 'حجز جالكسي بيوتي - {code}',
    en: 'Galaxy of Beauty booking - {code}',
  },
  'booking.view-my-bookings': { ar: 'عرض حجوزاتي', en: 'View My Bookings' },
  'booking.book-another-service': { ar: 'احجزي خدمة أخرى', en: 'Book Another Service' },
  'booking.back-to-dashboard': { ar: 'العودة للوحة التحكم', en: 'Back to Dashboard' },
} as const;
