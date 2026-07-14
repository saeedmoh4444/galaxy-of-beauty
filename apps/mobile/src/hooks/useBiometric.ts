import { useState, useCallback } from 'react';
import { Platform } from 'react-native';

// Stub — in production, use expo-local-authentication
// import * as LocalAuthentication from 'expo-local-authentication';

interface BiometricResult {
  success: boolean;
  error?: string;
}

export function useBiometric() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | 'iris' | null>(null);

  const checkAvailability = useCallback(async () => {
    // Stub: expo-local-authentication provides:
    // const hasHardware = await LocalAuthentication.hasHardwareAsync();
    // const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    // const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    setIsAvailable(false);
    setBiometricType(Platform.OS === 'ios' ? 'facial' : 'fingerprint');
  }, []);

  const authenticate = useCallback(async (): Promise<BiometricResult> => {
    // Stub: const result = await LocalAuthentication.authenticateAsync({
    //   promptMessage: 'تسجيل الدخول بالبصمة',
    //   fallbackLabel: 'استخدام كلمة المرور',
    // });
    return { success: false, error: 'Biometric auth requires expo-local-authentication' };
  }, []);

  return { isAvailable, biometricType, checkAvailability, authenticate };
}
