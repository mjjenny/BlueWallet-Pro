import { parseLegacyDocumentRecord, normalizeLegacyReminders } from "./legacyBackup";
import {
  LEGACY_LOCAL_STORAGE_KEYS,
  LEGACY_SESSION_STORAGE_KEYS,
} from "./legacyStorageKeys";
import type {
  LegacyCompatibilityIssue,
  LegacyDocumentParseResult,
  LegacySettingsSnapshot,
} from "./legacyTypes";
import { isLegacyEncryptedProfileRecord } from "./legacyCryptoRecords";

export const LEGACY_DATABASE_NAME = "SeafarerWalletDB";
export const LEGACY_DATABASE_VERSION = 2;
export const LEGACY_OBJECT_STORES = {
  documents: "documents",
  profile: "profile",
} as const;

export interface LegacyDatabaseDetection {
  name: typeof LEGACY_DATABASE_NAME;
  expectedVersion: typeof LEGACY_DATABASE_VERSION;
  status: "present" | "absent" | "unknown";
  actualVersion?: number;
  objectStores?: string[];
  reason?: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
}

function issue(
  severity: "warning" | "error",
  code: string,
  message: string,
  path?: string,
): LegacyCompatibilityIssue {
  return { severity, code, message, path };
}

function parseJsonKey(storage: StorageLike, key: string, fallback: unknown): {
  value: unknown;
  issue?: LegacyCompatibilityIssue;
} {
  const raw = storage.getItem(key);
  if (raw == null) return { value: fallback };
  try {
    return { value: JSON.parse(raw) as unknown };
  } catch {
    return {
      value: fallback,
      issue: issue("warning", "storage.invalidJson", `Could not parse ${key}`, key),
    };
  }
}

function numberFromStorage(storage: StorageLike, key: string, fallback = 0): number {
  const raw = storage.getItem(key);
  if (raw == null || raw === "") return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function detectLegacyDatabase(
  factory: IDBFactory | undefined = globalThis.indexedDB,
): Promise<LegacyDatabaseDetection> {
  if (!factory) {
    return {
      name: LEGACY_DATABASE_NAME,
      expectedVersion: LEGACY_DATABASE_VERSION,
      status: "unknown",
      reason: "IndexedDB is not available",
    };
  }

  if (typeof factory.databases !== "function") {
    return {
      name: LEGACY_DATABASE_NAME,
      expectedVersion: LEGACY_DATABASE_VERSION,
      status: "unknown",
      reason: "indexedDB.databases() is unavailable; opening would create a database",
    };
  }

  const databases = await factory.databases();
  const found = databases.find((db) => db.name === LEGACY_DATABASE_NAME);
  if (!found) {
    return {
      name: LEGACY_DATABASE_NAME,
      expectedVersion: LEGACY_DATABASE_VERSION,
      status: "absent",
    };
  }

  return {
    name: LEGACY_DATABASE_NAME,
    expectedVersion: LEGACY_DATABASE_VERSION,
    status: "present",
    actualVersion: found.version,
  };
}

export function readLegacyDocumentsFromDatabase(
  db: IDBDatabase,
): Promise<LegacyDocumentParseResult[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LEGACY_OBJECT_STORES.documents, "readonly");
    const request = tx.objectStore(LEGACY_OBJECT_STORES.documents).getAll();
    request.onsuccess = () => {
      const rows = Array.isArray(request.result) ? request.result : [];
      resolve(rows.map((row) => parseLegacyDocumentRecord(row)));
    };
    request.onerror = () => reject(request.error);
  });
}

export function readLegacyProfileFromDatabase(db: IDBDatabase): Promise<{
  kind: "missing" | "plaintext" | "encrypted" | "malformed";
  value?: string | null;
  issues: LegacyCompatibilityIssue[];
}> {
  return new Promise((resolve) => {
    const tx = db.transaction(LEGACY_OBJECT_STORES.profile, "readonly");
    const request = tx.objectStore(LEGACY_OBJECT_STORES.profile).get("photo");
    request.onsuccess = () => {
      const row = request.result as unknown;
      if (!row) return resolve({ kind: "missing", issues: [] });
      if (isLegacyEncryptedProfileRecord(row)) {
        return resolve({ kind: "encrypted", issues: [] });
      }
      if (typeof row === "object" && row && "data" in row) {
        return resolve({
          kind: "plaintext",
          value: (row as { data?: string | null }).data ?? null,
          issues: [],
        });
      }
      return resolve({
        kind: "malformed",
        issues: [issue("error", "profile.malformed", "Profile record is not readable")],
      });
    };
    request.onerror = () =>
      resolve({
        kind: "malformed",
        issues: [issue("error", "profile.readFailed", "Profile record read failed")],
      });
  });
}

export function readFallbackDocumentsFromStorage(
  storage: StorageLike,
): LegacyDocumentParseResult[] {
  const parsed = parseJsonKey(storage, LEGACY_LOCAL_STORAGE_KEYS.fallbackDocuments, []);
  if (!Array.isArray(parsed.value)) {
    return [
      {
        kind: "malformed",
        raw: parsed.value,
        issues: [
          issue(
            "error",
            "fallbackDocuments.notArray",
            "Fallback document storage is not an array",
            LEGACY_LOCAL_STORAGE_KEYS.fallbackDocuments,
          ),
        ],
      },
    ];
  }
  return parsed.value.map((row) => parseLegacyDocumentRecord(row));
}

export function readLegacySettingsFromStorage(
  local: StorageLike,
  session?: StorageLike,
): LegacySettingsSnapshot {
  const issues: LegacyCompatibilityIssue[] = [];
  const seafarer = parseJsonKey(local, LEGACY_LOCAL_STORAGE_KEYS.seafarer, null);
  const packs = parseJsonKey(local, LEGACY_LOCAL_STORAGE_KEYS.packs, null);
  const seatime = parseJsonKey(local, LEGACY_LOCAL_STORAGE_KEYS.seatime, null);
  const vaccines = parseJsonKey(local, LEGACY_LOCAL_STORAGE_KEYS.vaccines, null);
  const reminders = parseJsonKey(local, LEGACY_LOCAL_STORAGE_KEYS.reminders, {});

  for (const item of [seafarer, packs, seatime, vaccines, reminders]) {
    if (item.issue) issues.push(item.issue);
  }

  return {
    seafarer: typeof seafarer.value === "object" ? seafarer.value : null,
    packs: Array.isArray(packs.value) ? packs.value : null,
    seatime: Array.isArray(seatime.value) ? seatime.value : null,
    vaccines: Array.isArray(vaccines.value) ? vaccines.value : null,
    reminders: normalizeLegacyReminders(reminders.value),
    idleMins: numberFromStorage(local, LEGACY_LOCAL_STORAGE_KEYS.idleMins, 5),
    pin: {
      hash: local.getItem(LEGACY_LOCAL_STORAGE_KEYS.pinHash),
      hashVersion: local.getItem(LEGACY_LOCAL_STORAGE_KEYS.pinHashVersion),
      required: local.getItem(LEGACY_LOCAL_STORAGE_KEYS.pinRequired) === "1",
      salt: local.getItem(LEGACY_LOCAL_STORAGE_KEYS.pinSalt),
      failCount: numberFromStorage(local, LEGACY_LOCAL_STORAGE_KEYS.pinFails, 0),
      lockUntil: numberFromStorage(local, LEGACY_LOCAL_STORAGE_KEYS.pinLockUntil, 0),
    },
    encryption: {
      enabled: local.getItem(LEGACY_LOCAL_STORAGE_KEYS.encryptionEnabled) === "1",
      salt: local.getItem(LEGACY_LOCAL_STORAGE_KEYS.encryptionSalt),
    },
    biometric: {
      enabled: local.getItem(LEGACY_LOCAL_STORAGE_KEYS.biometricEnabled) === "1",
      credentialId: local.getItem(LEGACY_LOCAL_STORAGE_KEYS.webAuthnCredentialId),
    },
    app: {
      mode: local.getItem(LEGACY_LOCAL_STORAGE_KEYS.appMode) || "full",
      theme:
        local.getItem(LEGACY_LOCAL_STORAGE_KEYS.theme) ||
        local.getItem(LEGACY_LOCAL_STORAGE_KEYS.legacyTheme) ||
        "ocean",
      legacyTheme: local.getItem(LEGACY_LOCAL_STORAGE_KEYS.legacyTheme),
      iosBannerDismissed:
        local.getItem(LEGACY_LOCAL_STORAGE_KEYS.iosBannerDismissed) === "1",
      onboardingDone: local.getItem(LEGACY_LOCAL_STORAGE_KEYS.onboardingDone) === "1",
    },
    session: {
      unlocked: session?.getItem(LEGACY_SESSION_STORAGE_KEYS.unlocked) === "1",
    },
    issues,
  };
}
