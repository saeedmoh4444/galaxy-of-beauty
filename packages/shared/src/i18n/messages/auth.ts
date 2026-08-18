// Authentication flow strings.

export const authMessages = {
  'auth.login': { ar: 'تسجيل الدخول', en: 'Login' },
  'auth.loginShort': { ar: 'دخول', en: 'Login' },
  'auth.register': { ar: 'إنشاء حساب', en: 'Register' },
  'auth.logout': { ar: 'تسجيل الخروج', en: 'Logout' },
  'auth.email': { ar: 'البريد الإلكتروني', en: 'Email' },
  'auth.password': { ar: 'كلمة المرور', en: 'Password' },
  'auth.forgotPassword': { ar: 'نسيت كلمة المرور؟', en: 'Forgot Password?' },
  'auth.noAccount': { ar: 'ليس لديك حساب؟', en: "Don't have an account?" },
  'auth.hasAccount': { ar: 'لديك حساب؟', en: 'Already have an account?' },

  // Login — 2FA step
  'auth.otp-invalid': {
    ar: 'يرجى إدخال رمز التحقق المكون من 6 أرقام',
    en: 'Please enter the 6-digit verification code',
  },
  'auth.totp-prompt': {
    ar: 'تم تفعيل المصادقة الثنائية. أدخل رمز التحقق من تطبيق المصادقة:',
    en: 'Two-factor authentication is enabled. Enter the verification code from your authenticator app:',
  },
  'auth.totp-code-label': { ar: 'رمز التحقق (6 أرقام)', en: 'Verification Code (6 digits)' },
  'auth.cancel-2fa': { ar: '← العودة لتسجيل الدخول', en: '← Back to Login' },
  'auth.verify': { ar: 'تحقق', en: 'Verify' },

  // Register
  'auth.name': { ar: 'الاسم', en: 'Name' },
  'auth.phone': { ar: 'رقم الجوال', en: 'Mobile Number' },
  'auth.confirm-password': { ar: 'تأكيد كلمة المرور', en: 'Confirm Password' },
  'auth.account-type': { ar: 'نوع الحساب', en: 'Account Type' },
  'auth.role-customer': { ar: 'عميلة', en: 'Customer' },
  'auth.role-technician': { ar: 'فنية', en: 'Technician' },
  'auth.city': { ar: 'المدينة', en: 'City' },
  'auth.agree-terms': { ar: 'أوافق على', en: 'I agree to the' },
  'auth.terms': { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },
  'auth.password-mismatch': { ar: 'كلمات المرور غير متطابقة', en: 'Passwords do not match' },
  'auth.terms-required': {
    ar: 'يجب الموافقة على الشروط والأحكام',
    en: 'You must accept the terms and conditions',
  },

  // Two-factor authentication page
  'auth.2fa-title': { ar: 'المصادقة الثنائية', en: 'Two-Factor Authentication' },
  'auth.2fa-subtitle': {
    ar: 'أضف طبقة أمان إضافية لحسابك',
    en: 'Add an extra layer of security to your account',
  },
  'auth.2fa-load-error': { ar: 'فشل تحميل معلومات المستخدم', en: 'Failed to load user info' },
  'auth.2fa-enabled': { ar: 'المصادقة الثنائية مفعلة', en: 'Two-Factor Authentication Enabled' },
  'auth.2fa-enabled-desc': {
    ar: 'حسابك محمي بالمصادقة الثنائية. سيُطلب منك رمز التحقق عند تسجيل الدخول.',
    en: 'Your account is protected with two-factor authentication. You will be asked for a verification code when logging in.',
  },
  'auth.2fa-disabled': {
    ar: 'تم تعطيل المصادقة الثنائية',
    en: 'Two-factor authentication disabled',
  },
  'auth.2fa-disable': { ar: 'تعطيل المصادقة الثنائية', en: 'Disable Two-Factor Authentication' },
  'auth.2fa-setup-title': { ar: 'إعداد المصادقة الثنائية', en: 'Set Up Two-Factor Authentication' },
  'auth.2fa-setup-desc': {
    ar: 'المصادقة الثنائية تضيف طبقة حماية إضافية لحسابك. عند تفعيلها، ستحتاج إلى إدخال رمز تحقق من تطبيق المصادقة بالإضافة إلى كلمة المرور.',
    en: 'Two-factor authentication adds an extra layer of protection to your account. Once enabled, you will need to enter a code from your authenticator app in addition to your password.',
  },
  'auth.2fa-start-setup': { ar: 'بدء الإعداد', en: 'Start Setup' },
  'auth.2fa-scan-qr': {
    ar: 'امسح رمز QR باستخدام تطبيق المصادقة',
    en: 'Scan the QR code with your authenticator app',
  },
  'auth.2fa-secret': { ar: 'الرمز السري (Secret):', en: 'Secret code:' },
  'auth.2fa-manual-entry': {
    ar: 'أو أدخل الرمز السري يدوياً في التطبيق',
    en: 'Or enter the secret code manually in the app',
  },
  'auth.2fa-verify-prompt': {
    ar: 'أدخل رمز التحقق من التطبيق لتأكيد الإعداد:',
    en: 'Enter the code from your app to confirm the setup:',
  },
  'auth.2fa-verify-success': {
    ar: 'تم تفعيل المصادقة الثنائية بنجاح',
    en: 'Two-factor authentication enabled successfully',
  },
  'auth.2fa-code-label': { ar: 'رمز التحقق', en: 'Verification Code' },
  'auth.2fa-confirm-enable': { ar: 'تأكيد وتفعيل', en: 'Confirm & Enable' },
  'auth.otp6-error': { ar: 'يرجى إدخال رمز مكون من 6 أرقام', en: 'Please enter a 6-digit code' },

  // Forgot password
  'auth.forgot-title': { ar: 'نسيت كلمة المرور', en: 'Forgot Password' },
  'auth.forgot-desc': {
    ar: 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور',
    en: 'Enter your email and we will send you a password reset link',
  },
  'auth.forgot-sent': {
    ar: 'تم إرسال رابط إعادة تعيين كلمة المرور',
    en: 'Password reset link sent',
  },
  'auth.forgot-sent-desc': {
    ar: 'إذا كان البريد الإلكتروني مسجلاً لدينا، ستتلقى رسالة تحتوي على رابط إعادة تعيين كلمة المرور.',
    en: 'If the email is registered with us, you will receive a message containing a password reset link.',
  },
  'auth.forgot-submit': { ar: 'إرسال رابط إعادة التعيين', en: 'Send Reset Link' },
  'auth.back-to-login': { ar: 'العودة إلى تسجيل الدخول', en: 'Back to Login' },

  // Reset password
  'auth.reset-title': { ar: 'إعادة تعيين كلمة المرور', en: 'Reset Password' },
  'auth.reset-success': {
    ar: 'تم إعادة تعيين كلمة المرور بنجاح',
    en: 'Password reset successfully',
  },
  'auth.reset-failed': { ar: 'فشل إعادة التعيين', en: 'Reset failed' },
  'auth.new-password': { ar: 'كلمة المرور الجديدة', en: 'New Password' },
  'auth.reset-submit': { ar: 'إعادة تعيين', en: 'Reset' },
  'auth.password-mismatch-reset': {
    ar: 'كلمتا المرور غير متطابقتين',
    en: 'Passwords do not match',
  },
  'auth.back-to-login-short': { ar: 'العودة لتسجيل الدخول', en: 'Back to Login' },

  // Verify email
  'auth.verify-email-title': { ar: 'تأكيد البريد الإلكتروني', en: 'Confirm Email' },
  'auth.verify-email-success': {
    ar: 'تم تأكيد البريد الإلكتروني بنجاح!',
    en: 'Email confirmed successfully!',
  },
  'auth.verify-email-failed': {
    ar: 'فشل التحقق من البريد الإلكتروني',
    en: 'Email verification failed',
  },
  'auth.verify-token-missing': { ar: 'رمز التحقق غير موجود', en: 'Verification code not found' },
  'auth.verify-redirecting': {
    ar: 'جاري تحويلك لصفحة تسجيل الدخول...',
    en: 'Redirecting you to the login page...',
  },
  'auth.verifying': { ar: 'جاري التحقق...', en: 'Verifying...' },

  // Social login
  'auth.login-or': { ar: 'أو سجلي الدخول عبر', en: 'or log in with' },
  'auth.google-continue': { ar: 'متابعة باستخدام Google', en: 'Continue with Google' },
} as const;
