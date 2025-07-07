type Translations = Record<string, string>;

interface I18nDict {
  [lang: string]: Translations;
}

const i18nDict: I18nDict = {
  en: {
    'error.user_exists': 'User already exists',
    'error.user_not_found': 'User not found',
    'error.invalid_password': 'Invalid password',
    'error.too_many_attempts': 'Too many login attempts. Please try again later.',
    'error.email_not_verified': 'Email not verified',
    'error.user_blocked': 'User is blocked',
    'error.otp_expired': 'OTP expired',
    'error.otp_invalid': 'Invalid OTP',
    'error.magiclink_expired': 'Magic link expired',
    'error.magiclink_invalid': 'Invalid or corrupted magic link',
    'error.token_revoked': 'Token revoked',
    'error.token_invalid': 'Invalid or expired token',
    'error.rate_limit': 'Too many requests. Please try again later.',
    // ...add more as needed
  },
  // Example: Spanish
  es: {
    'error.user_exists': 'El usuario ya existe',
    'error.user_not_found': 'Usuario no encontrado',
    'error.invalid_password': 'Contraseña inválida',
    'error.too_many_attempts': 'Demasiados intentos de inicio de sesión. Inténtalo más tarde.',
    'error.email_not_verified': 'Correo electrónico no verificado',
    'error.user_blocked': 'Usuario bloqueado',
    'error.otp_expired': 'OTP caducado',
    'error.otp_invalid': 'OTP inválido',
    'error.magiclink_expired': 'Enlace mágico caducado',
    'error.magiclink_invalid': 'Enlace mágico inválido o corrupto',
    'error.token_revoked': 'Token revocado',
    'error.token_invalid': 'Token inválido o caducado',
    'error.rate_limit': 'Demasiadas solicitudes. Inténtalo más tarde.',
    // ...add more as needed
  },
};

let currentLang = 'en';

export function setLanguage(lang: string) {
  if (i18nDict[lang]) currentLang = lang;
}

export function t(key: string): string {
  return i18nDict[currentLang][key] || i18nDict['en'][key] || key;
}

export function addTranslations(lang: string, translations: Translations) {
  i18nDict[lang] = { ...i18nDict[lang], ...translations };
}

// Usage:
// setLanguage('es');
// t('error.user_exists');
// addTranslations('fr', { 'error.user_exists': 'Utilisateur existe déjà' }); 