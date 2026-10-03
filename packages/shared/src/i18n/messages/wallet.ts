// Wallet strings.

export const walletMessages = {
  'wallet.bonus': { ar: 'رصيد المكافآت', en: 'Bonus Balance' },
  'wallet.transactions': { ar: 'المعاملات', en: 'Transactions' },

  // Wallet page
  'wallet.title': { ar: 'المحفظة', en: 'Wallet' },
  'wallet.load-error': { ar: 'فشل تحميل المحفظة', en: 'Failed to load wallet' },
  'wallet.total-balance': { ar: 'الرصيد الكلي', en: 'Total Balance' },
  'wallet.withdrawable-balance': { ar: 'الرصيد القابل للسحب', en: 'Withdrawable Balance' },
  'wallet.request-withdraw': { ar: 'طلب سحب', en: 'Request Withdrawal' },
  'wallet.transactions-error': { ar: 'فشل تحميل المعاملات', en: 'Failed to load transactions' },
  'wallet.no-transactions': { ar: 'لا توجد معاملات', en: 'No transactions yet' },
  'wallet.no-transactions-desc': {
    ar: 'ستظهر هنا عمليات الدفع والإيداع والسحب',
    en: 'Payments, top-ups, and withdrawals will appear here',
  },
  'wallet.amount-label': { ar: 'المبلغ (ر.س)', en: 'Amount (SAR)' },
  'wallet.min-withdraw': { ar: 'الحد الأدنى ١٠٠ ر.س', en: 'Minimum withdrawal is 100 SAR' },
  'wallet.confirm-withdraw': { ar: 'تأكيد السحب', en: 'Confirm Withdrawal' },

  // Wallet top-up
  'wallet.min-top-up': { ar: 'الحد الأدنى ٥٠ ر.س', en: 'Minimum top-up is 50 SAR' },
  'wallet.redirect-to-payment': {
    ar: 'سيتم تحويلك لبوابة الدفع لإضافة {amount}',
    en: 'You will be redirected to the payment gateway to add {amount}',
  },
  'wallet.top-up': { ar: 'شحن المحفظة', en: 'Top Up Wallet' },
  'wallet.current-balance': { ar: 'الرصيد الحالي', en: 'Current Balance' },
  'wallet.bonus-label': { ar: 'رصيد مكافآت', en: 'bonus balance' },
  'wallet.choose-amount': { ar: 'اختر المبلغ', en: 'Choose Amount' },
  'wallet.custom-amount': { ar: 'أو أدخل مبلغ مخصص', en: 'Or enter a custom amount' },
  'wallet.top-up-button': { ar: 'شحن {amount}', en: 'Top Up {amount}' },
  'wallet.back-to-wallet': { ar: 'العودة للمحفظة', en: 'Back to Wallet' },

  // Checkout
  'wallet.checkout': { ar: 'إتمام الشراء', en: 'Checkout' },
  'wallet.checkout-subtitle': {
    ar: 'مراجعة الطلب واختيار طريقة الدفع',
    en: 'Review your order and choose a payment method',
  },
  'wallet.empty-cart': { ar: 'سلتكِ فاضية', en: 'Your cart is empty' },
  'wallet.order-placed': { ar: 'تم تقديم الطلب بنجاح', en: 'Order placed successfully' },
  'wallet.order-confirm-message': {
    ar: 'سنتواصل معكِ لتأكيد الطلب',
    en: 'We will contact you to confirm your order',
  },
  'wallet.order-summary': { ar: 'ملخص الطلب', en: 'Order Summary' },
  'wallet.subtotal': { ar: 'المجموع', en: 'Subtotal' },
  'wallet.platform-fee': { ar: 'رسوم المنصة', en: 'Platform Fee' },
  'wallet.total': { ar: 'الإجمالي', en: 'Total' },
  'wallet.payment-method': { ar: 'طريقة الدفع', en: 'Payment Method' },
  'wallet.online-payment': { ar: 'دفع إلكتروني', en: 'Online Payment' },
  'wallet.card-brands': {
    ar: 'مدى · فيزا · ماستركارد',
    en: 'Mada · Visa · Mastercard',
  },
  'wallet.your-balance': { ar: 'رصيدكِ: {balance}', en: 'Your balance: {balance}' },
  'wallet.insufficient-balance': { ar: '(الرصيد غير كاف)', en: '(Insufficient balance)' },
  'wallet.pay-now': { ar: 'ادفعي {amount}', en: 'Pay {amount}' },

  // Checkout — MyFatoorah shipping
  'wallet.shipping-title': { ar: 'عنوان الشحن', en: 'Shipping Address' },
  'wallet.shipping-person-name': { ar: 'اسم المستلم', en: 'Recipient name' },
  'wallet.shipping-mobile': { ar: 'رقم الجوال', en: 'Mobile number' },
  'wallet.shipping-line-address': { ar: 'العنوان', en: 'Address' },
  'wallet.shipping-city': { ar: 'المدينة', en: 'City' },
  'wallet.shipping-city-placeholder': {
    ar: 'ابحثي عن مدينتكِ',
    en: 'Search for your city',
  },
  'wallet.shipping-postal-code': { ar: 'الرمز البريدي', en: 'Postal code' },
  'wallet.shipping-country': { ar: 'الدولة', en: 'Country' },
  'wallet.shipping-method': { ar: 'شركة الشحن', en: 'Shipping courier' },
  'wallet.shipping-method-dhl': { ar: 'دي إتش إل', en: 'DHL' },
  'wallet.shipping-method-aramex': { ar: 'أرامكس', en: 'Aramex' },
  'wallet.shipping-charge': { ar: 'رسوم الشحن', en: 'Shipping' },
  'wallet.shipping-required': {
    ar: 'أكملي بيانات الشحن للمتابعة',
    en: 'Complete the shipping details to continue',
  },
  'wallet.redirecting-gateway': {
    ar: 'جارٍ تحويلك إلى بوابة الدفع…',
    en: 'Redirecting you to the payment gateway…',
  },
  'wallet.payment-pending': {
    ar: 'الدفع قيد المعالجة',
    en: 'Payment is still processing',
  },
  'wallet.payment-failed': { ar: 'فشلت عملية الدفع', en: 'Payment failed' },
  'wallet.payment-success': { ar: 'تم الدفع بنجاح', en: 'Payment successful' },
  'wallet.check-payment-status': {
    ar: 'التحقق من حالة الدفع',
    en: 'Check payment status',
  },
} as const;
