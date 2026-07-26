import i18next from 'i18next';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Supported languages.
 */
export const SUPPORTED_LANGUAGES = ['ar', 'en'];
export const DEFAULT_LANGUAGE = 'ar';

/**
 * i18next configuration for backend localization.
 */
await i18next.init({
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  defaultNS: 'common',
  ns: ['common', 'errors', 'notifications', 'email'],
  backend: {
    loadPath: path.join(__dirname, '..', '..', 'locales', '{{lng}}', '{{ns}}.json'),
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
