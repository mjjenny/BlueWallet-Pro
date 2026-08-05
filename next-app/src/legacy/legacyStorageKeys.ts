export const LEGACY_LOCAL_STORAGE_KEYS = {
  fallbackDocuments: "bwFallbackDocuments",
  fallbackProfile: "bwFallbackProfile",
  seafarer: "bwSeafarer",
  packs: "bwPacks",
  seatime: "bwSeatime",
  vaccines: "bwVaccines",
  reminders: "bwReminders",
  idleMins: "bwIdleMins",
  pinHash: "bwPinHash",
  pinHashVersion: "bwPinHashV",
  pinRequired: "bwPinRequired",
  pinSalt: "bwPinSalt",
  pinFails: "bwPinFails",
  pinLockUntil: "bwPinLockUntil",
  encryptionSalt: "bwEncSalt",
  encryptionEnabled: "bwEncEnabled",
  biometricEnabled: "bwBio",
  webAuthnCredentialId: "bwWebAuthnId",
  appMode: "bwAppMode",
  theme: "bwTheme",
  legacyTheme: "greenVaultTheme",
  iosBannerDismissed: "bwIosBannerDismiss",
  onboardingDone: "bwOnboardDone",
} as const;

export const LEGACY_SESSION_STORAGE_KEYS = {
  unlocked: "bwUnlocked",
} as const;

export const LEGACY_LOCAL_STORAGE_KEY_GROUPS = {
  fallback: [
    LEGACY_LOCAL_STORAGE_KEYS.fallbackDocuments,
    LEGACY_LOCAL_STORAGE_KEYS.fallbackProfile,
  ],
  metadata: [
    LEGACY_LOCAL_STORAGE_KEYS.seafarer,
    LEGACY_LOCAL_STORAGE_KEYS.packs,
    LEGACY_LOCAL_STORAGE_KEYS.seatime,
    LEGACY_LOCAL_STORAGE_KEYS.vaccines,
    LEGACY_LOCAL_STORAGE_KEYS.reminders,
    LEGACY_LOCAL_STORAGE_KEYS.idleMins,
  ],
  pin: [
    LEGACY_LOCAL_STORAGE_KEYS.pinHash,
    LEGACY_LOCAL_STORAGE_KEYS.pinHashVersion,
    LEGACY_LOCAL_STORAGE_KEYS.pinRequired,
    LEGACY_LOCAL_STORAGE_KEYS.pinSalt,
    LEGACY_LOCAL_STORAGE_KEYS.pinFails,
    LEGACY_LOCAL_STORAGE_KEYS.pinLockUntil,
  ],
  encryption: [
    LEGACY_LOCAL_STORAGE_KEYS.encryptionSalt,
    LEGACY_LOCAL_STORAGE_KEYS.encryptionEnabled,
  ],
  biometric: [
    LEGACY_LOCAL_STORAGE_KEYS.biometricEnabled,
    LEGACY_LOCAL_STORAGE_KEYS.webAuthnCredentialId,
  ],
  app: [
    LEGACY_LOCAL_STORAGE_KEYS.appMode,
    LEGACY_LOCAL_STORAGE_KEYS.theme,
    LEGACY_LOCAL_STORAGE_KEYS.legacyTheme,
    LEGACY_LOCAL_STORAGE_KEYS.iosBannerDismissed,
    LEGACY_LOCAL_STORAGE_KEYS.onboardingDone,
  ],
} as const;

export type LegacyLocalStorageKey =
  (typeof LEGACY_LOCAL_STORAGE_KEYS)[keyof typeof LEGACY_LOCAL_STORAGE_KEYS];

export type LegacySessionStorageKey =
  (typeof LEGACY_SESSION_STORAGE_KEYS)[keyof typeof LEGACY_SESSION_STORAGE_KEYS];
