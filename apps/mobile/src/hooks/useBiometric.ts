import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';

interface BiometricResult {
  success: boolean;
  error?: string;
}

type BiometricType = 'fingerprint' | 'facial' | 'iris' | null;

export function useBiometric() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>(null);

  const checkAvailability = useCallback(async () => {
    try {
      // Dynamically require expo-local-authentication
      const LocalAuth = require('expo-local-authentication');

      const compatible = await LocalAuth.hasHardwareAsync?.();
      if (!compatible) {
        setIsAvailable(false);
        setBiometricType(null);
        return;
      }

      const enrolled = await LocalAuth.isEnrolledAsync?.();
      if (!enrolled) {
        setIsAvailable(false);
        setBiometricType(null);
        return;
      }

      // Determine biometric type
      const types: number[] = await LocalAuth.supportedAuthenticationTypesAsync?.() || [];
      if (types.includes(LocalAuth.AuthenticationType?.FACIAL_RECOGNITION)) {
        setBiometricType('facial');
      } else if (types.includes(LocalAuth.AuthenticationType?.FINGERPRINT)) {
        setBiometricType('fingerprint');
      } else if (types.includes(LocalAuth.AuthenticationType?.IRIS)) {
        setBiometricType('iris');
      } else {
        setBiometricType(Platform.OS === 'ios' ? 'facial' : 'fingerprint');
      }

      setIsAvailable(true);
    } catch {
      // expo-local-authentication not installed
      setIsAvailable(false);
      setBiometricType(null);
    }
  }, []);

  const authenticate = useCallback(async (): Promise<BiometricResult> => {
    if (!isAvailable) {
      return { success: false, error: 'المصادقة البيومترية غير متوفرة على هذا الجهاز' };
    }

    try {
      const LocalAuth = require('expo-local-authentication');

      const result = await LocalAuth.authenticateAsync?.({
        promptMessage: 'تسجيل الدخول بالبصمة',
        fallbackLabel: 'استخدام كلمة المرور',
        cancelLabel: 'إلغاء',
        disableDeviceFallback: false,
      });

      if (result?.success) {
        return { success: true };
      }

      return {
        success: false,
        error: result?.error || 'فشلت المصادقة البيومترية',
      };
    } catch {
      return { success: false, error: 'تعذر الوصول إلى المصادقة البيومترية' };
    }
  }, [isAvailable]);

  // Check on mount
  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return { isAvailable, biometricType, checkAvailability, authenticate };
}
