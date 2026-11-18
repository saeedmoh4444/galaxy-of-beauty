import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { useLocale } from '@/components/LocaleProvider';

interface BiometricResult {
  success: boolean;
  error?: string;
}

type BiometricType = 'fingerprint' | 'facial' | 'iris' | null;

export function useBiometric() {
  // W4-8 — strings moved to the mobile i18n bundle (was hardcoded Arabic).
  const { t } = useLocale();
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>(null);

  const checkAvailability = useCallback(async () => {
    try {
      // Dynamically require expo-local-authentication (optional dependency)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
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
      const types: number[] = (await LocalAuth.supportedAuthenticationTypesAsync?.()) || [];
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
      return { success: false, error: t('mobile.auth.biometricUnavailable') };
    }

    try {
      // expo-local-authentication is an optional dependency — require dynamically
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const LocalAuth = require('expo-local-authentication');

      const result = await LocalAuth.authenticateAsync?.({
        promptMessage: t('mobile.auth.biometricPrompt'),
        fallbackLabel: t('mobile.auth.usePassword'),
        cancelLabel: t('button.cancel'),
        disableDeviceFallback: false,
      });

      if (result?.success) {
        return { success: true };
      }

      return {
        success: false,
        error: result?.error || t('mobile.auth.biometricFailure'),
      };
    } catch {
      return { success: false, error: t('mobile.auth.biometricAccessError') };
    }
  }, [isAvailable, t]);

  // Check on mount
  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return { isAvailable, biometricType, checkAvailability, authenticate };
}
