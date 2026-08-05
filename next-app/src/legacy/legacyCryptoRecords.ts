import type {
  LegacyEncryptedDocumentRecord,
  LegacyEncryptedProfileRecord,
} from "./legacyTypes";

export const LEGACY_ENCRYPTION_VERSION = 1;
export const LEGACY_PBKDF2_ITERATIONS = 210_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function hasString(value: Record<string, unknown>, key: string): boolean {
  return typeof value[key] === "string" && value[key].length > 0;
}

export function isLegacyEncryptedDocumentRecord(
  value: unknown,
): value is LegacyEncryptedDocumentRecord {
  if (!isRecord(value)) return false;
  return (
    !!value._enc &&
    hasString(value, "id") &&
    hasString(value, "iv") &&
    hasString(value, "data") &&
    !("title" in value) &&
    !("files" in value)
  );
}

export function isLegacyEncryptedProfileRecord(
  value: unknown,
): value is LegacyEncryptedProfileRecord {
  if (!isRecord(value)) return false;
  return (
    value.key === "photo" &&
    !!value._enc &&
    hasString(value, "iv") &&
    hasString(value, "data")
  );
}
