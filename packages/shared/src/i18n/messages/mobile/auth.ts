// Mobile auth screen strings (Stack headers + screens). Populated by
// the mobile sweep; seeded with the Stack title strings from _layout.

export const mobileAuthMessages = {
  'mobile.auth.loginTitle': { ar: 'تسجيل الدخول', en: 'Login' },
  'mobile.auth.registerTitle': { ar: 'إنشاء حساب', en: 'Register' },
  'mobile.auth.forgotTitle': { ar: 'نسيت كلمة المرور', en: 'Forgot Password' },
  'mobile.auth.resetTitle': { ar: 'إعادة تعيين كلمة المرور', en: 'Reset Password' },
  'mobile.auth.verifyTitle': { ar: 'توثيق البريد الإلكتروني', en: 'Verify Email' },
  'mobile.auth.twoFactorTitle': { ar: 'المصادقة الثنائية', en: 'Two-Factor Authentication' },
  'mobile.auth.quickLogin': { ar: ' دخول سريع', en: 'Quick Login' },
  'mobile.auth.createNewAccount': { ar: 'إنشاء حساب جديد', en: 'Create New Account' },
  'mobile.auth.biometricSuccess': {
    ar: 'تم التحقق البيومتري بنجاح',
    en: 'Biometric verification successful',
  },
  'mobile.auth.loginFailed': { ar: 'فشل تسجيل الدخول', en: 'Login failed' },
  'mobile.auth.accountCreated': { ar: 'تم إنشاء الحساب بنجاح', en: 'Account created successfully' },
  'mobile.auth.registerFailed': { ar: 'فشل إنشاء الحساب', en: 'Registration failed' },
  'mobile.auth.phonePlaceholder': {
    ar: 'رقم الجوال (+9665xxxxxxxx)',
    en: 'Mobile number (+9665xxxxxxxx)',
  },
  'mobile.auth.registering': { ar: 'جاري الإنشاء...', en: 'Creating account...' },
  'mobile.auth.hasAccountLogin': {
    ar: 'لديك حساب؟ تسجيل الدخول',
    en: 'Already have an account? Log in',
  },
  'mobile.auth.setupFailed': { ar: 'فشل الإعداد', en: 'Setup failed' },
  'mobile.auth.invalidCode': { ar: 'رمز غير صحيح', en: 'Invalid code' },
  'mobile.auth.disableFailed': { ar: 'فشل التعطيل', en: 'Failed to disable' },
  'mobile.auth.statusLoadFailed': {
    ar: 'فشل تحميل حالة المصادقة',
    en: 'Failed to load authentication status',
  },
  'mobile.auth.twoFactorActiveHint': {
    ar: 'حسابك محمي برمز تحقق إضافي عند تسجيل الدخول',
    en: 'Your account is protected by an extra verification code at login',
  },
  'mobile.auth.secretHint': {
    ar: 'انسخ الرمز السري إلى تطبيق المصادقة، ثم أدخل رمز التحقق للتأكيد',
    en: 'Copy the secret code into your authenticator app, then enter the verification code to confirm',
  },
  'mobile.auth.setupHint': {
    ar: 'أضف طبقة حماية إضافية لحسابك باستخدام تطبيق المصادقة',
    en: 'Add an extra layer of protection to your account using an authenticator app',
  },
  'mobile.auth.forgotSentMsg': {
    ar: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني',
    en: 'A password reset link has been sent to your email',
  },
  'mobile.auth.forgotSendFailed': {
    ar: 'فشل إرسال رابط إعادة التعيين',
    en: 'Failed to send the reset link',
  },
  'mobile.auth.emailRequired': {
    ar: 'يرجى إدخال البريد الإلكتروني',
    en: 'Please enter your email',
  },
  'mobile.auth.sendLink': { ar: 'إرسال الرابط', en: 'Send Link' },
  'mobile.auth.resetFailed': {
    ar: 'فشل إعادة تعيين كلمة المرور',
    en: 'Failed to reset the password',
  },
  'mobile.auth.allFieldsRequired': { ar: 'جميع الحقول مطلوبة', en: 'All fields are required' },
  'mobile.auth.passwordTooShort': {
    ar: 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل',
    en: 'Password must be at least 8 characters',
  },
  'mobile.auth.resetHint': {
    ar: 'أدخل رمز إعادة التعيين المرسل إلى بريدك الإلكتروني وكلمة المرور الجديدة',
    en: 'Enter the reset code sent to your email and your new password',
  },
  'mobile.auth.resetCodePlaceholder': { ar: 'رمز إعادة التعيين', en: 'Reset code' },
  'mobile.auth.changePassword': { ar: 'تغيير كلمة المرور', en: 'Change Password' },
  'mobile.auth.emailVerified': {
    ar: 'تم توثيق البريد الإلكتروني بنجاح',
    en: 'Email verified successfully',
  },
  'mobile.auth.verifyEmailFailed': {
    ar: 'فشل توثيق البريد الإلكتروني',
    en: 'Email verification failed',
  },
  'mobile.auth.codeRequired': {
    ar: 'يرجى إدخال رمز التحقق',
    en: 'Please enter the verification code',
  },
  'mobile.auth.verifyHint': {
    ar: 'أدخل رمز التحقق المرسل إلى بريدك الإلكتروني لتوثيق حسابك',
    en: 'Enter the verification code sent to your email to verify your account',
  },
  'mobile.auth.verifyAction': { ar: 'توثيق', en: 'Verify' },
  'mobile.auth.back': { ar: 'العودة', en: 'Back' },
} as const;
