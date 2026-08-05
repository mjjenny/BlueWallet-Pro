import { describe, expect, it, vi } from "vitest";
import {
  parseLegacyBackupJson,
  parseLegacyDocumentRecord,
  validateLegacyBackupVersion,
} from "../legacyBackup";
import {
  detectLegacyDatabase,
  readFallbackDocumentsFromStorage,
  readLegacySettingsFromStorage,
} from "../legacyDatabase";
import { isLegacyEncryptedDocumentRecord } from "../legacyCryptoRecords";
import {
  LEGACY_LOCAL_STORAGE_KEYS,
  LEGACY_LOCAL_STORAGE_KEY_GROUPS,
  LEGACY_SESSION_STORAGE_KEYS,
} from "../legacyStorageKeys";
import {
  backupV4Fixture,
  encryptedDocumentFixture,
  legacySingleFileDocumentFixture,
  malformedDocumentFixture,
  multiFileDocumentFixture,
  plaintextDocumentFixture,
} from "../__fixtures__/legacyRecordFixtures";

class MemoryStorage {
  private readonly data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

describe("legacy document contracts", () => {
  it("parses plaintext document records", () => {
    const result = parseLegacyDocumentRecord(plaintextDocumentFixture);

    expect(result.kind).toBe("plaintext");
    if (result.kind !== "plaintext") throw new Error("expected plaintext");
    expect(result.document.id).toBe("doc_passport_demo");
    expect(result.document.type).toBe("passport");
    expect(result.document.files).toHaveLength(1);
    expect(result.issues).toEqual([]);
  });

  it("detects encrypted records without decrypting", () => {
    const result = parseLegacyDocumentRecord(encryptedDocumentFixture);

    expect(isLegacyEncryptedDocumentRecord(encryptedDocumentFixture)).toBe(true);
    expect(result.kind).toBe("encrypted");
    if (result.kind !== "encrypted") throw new Error("expected encrypted");
    expect(result.record.data).toBe(encryptedDocumentFixture.data);
  });

  it("normalizes legacy single-file documents into files[]", () => {
    const result = parseLegacyDocumentRecord(legacySingleFileDocumentFixture);

    expect(result.kind).toBe("plaintext");
    if (result.kind !== "plaintext") throw new Error("expected plaintext");
    expect(result.document.files).toEqual([
      {
        data: legacySingleFileDocumentFixture.fileData,
        name: legacySingleFileDocumentFixture.fileName,
        type: legacySingleFileDocumentFixture.fileType,
      },
    ]);
  });

  it("keeps multi-file documents and normalizes comma-separated tags", () => {
    const result = parseLegacyDocumentRecord(multiFileDocumentFixture);

    expect(result.kind).toBe("plaintext");
    if (result.kind !== "plaintext") throw new Error("expected plaintext");
    expect(result.document.files).toHaveLength(2);
    expect(result.document.tags).toEqual(["stcw", "joining"]);
  });

  it("represents no-expiry documents exactly", () => {
    const result = parseLegacyDocumentRecord(multiFileDocumentFixture);

    expect(result.kind).toBe("plaintext");
    if (result.kind !== "plaintext") throw new Error("expected plaintext");
    expect(result.document.noExpiry).toBe(true);
    expect(result.document.expiryDate).toBeNull();
  });

  it("reports malformed records clearly", () => {
    const result = parseLegacyDocumentRecord(malformedDocumentFixture);

    expect(result.kind).toBe("malformed");
    expect(result.issues[0]?.code).toBe("document.missingId");
    expect(result.issues[0]?.severity).toBe("error");
  });

  it("does not mutate legacy records while normalizing", () => {
    const original = { ...legacySingleFileDocumentFixture };
    const before = JSON.stringify(original);

    parseLegacyDocumentRecord(original);

    expect(JSON.stringify(original)).toBe(before);
    expect("files" in original).toBe(false);
  });
});

describe("legacy backup contracts", () => {
  it("accepts the active root PWA version 4 backup format", () => {
    const result = parseLegacyBackupJson(JSON.stringify(backupV4Fixture));

    expect(result.ok).toBe(true);
    expect(result.payload?.version).toBe(4);
    expect(result.documents).toHaveLength(3);
  });

  it("marks unversioned backups as root-import-compatible when documents exist", () => {
    const backup = { documents: [plaintextDocumentFixture] };
    const validation = validateLegacyBackupVersion(backup);

    expect(validation.exportedVersion).toBe("unversioned");
    expect(validation.rootImportCompatible).toBe(true);
    expect(validation.issues.some((item) => item.code === "backup.unversioned")).toBe(true);
  });

  it("warns for unknown backup versions while matching root import permissiveness", () => {
    const backup = { version: 3, documents: [plaintextDocumentFixture] };
    const validation = validateLegacyBackupVersion(backup);

    expect(validation.exportedVersion).toBe("unknown");
    expect(validation.rootImportCompatible).toBe(true);
    expect(validation.issues[0]?.code).toBe("backup.unknownVersion");
  });

  it("rejects backups without non-empty documents arrays", () => {
    const result = parseLegacyBackupJson({ version: 4, documents: [] });

    expect(result.ok).toBe(false);
    expect(result.issues[0]?.code).toBe("backup.missingDocuments");
  });
});

describe("legacy storage adapters", () => {
  it("maps all known localStorage and sessionStorage keys", () => {
    expect(LEGACY_LOCAL_STORAGE_KEYS.fallbackDocuments).toBe("bwFallbackDocuments");
    expect(LEGACY_LOCAL_STORAGE_KEYS.pinHashVersion).toBe("bwPinHashV");
    expect(LEGACY_LOCAL_STORAGE_KEYS.legacyTheme).toBe("greenVaultTheme");
    expect(LEGACY_SESSION_STORAGE_KEYS.unlocked).toBe("bwUnlocked");
    expect(LEGACY_LOCAL_STORAGE_KEY_GROUPS.encryption).toContain("bwEncEnabled");
  });

  it("reads profile and settings metadata without writing", () => {
    const local = new MemoryStorage();
    const session = new MemoryStorage();
    const setSpy = vi.spyOn(local, "setItem");
    local.setItem(LEGACY_LOCAL_STORAGE_KEYS.seafarer, JSON.stringify({ rank: "2E" }));
    local.setItem(LEGACY_LOCAL_STORAGE_KEYS.packs, JSON.stringify([{ id: "pack", docIds: [] }]));
    local.setItem(LEGACY_LOCAL_STORAGE_KEYS.reminders, JSON.stringify({ urgent: 14 }));
    local.setItem(LEGACY_LOCAL_STORAGE_KEYS.pinHash, "hash");
    local.setItem(LEGACY_LOCAL_STORAGE_KEYS.pinHashVersion, "2");
    local.setItem(LEGACY_LOCAL_STORAGE_KEYS.pinRequired, "1");
    local.setItem(LEGACY_LOCAL_STORAGE_KEYS.encryptionEnabled, "1");
    local.setItem(LEGACY_LOCAL_STORAGE_KEYS.biometricEnabled, "1");
    local.setItem(LEGACY_LOCAL_STORAGE_KEYS.webAuthnCredentialId, "credential");
    local.setItem(LEGACY_LOCAL_STORAGE_KEYS.appMode, "lite");
    session.setItem(LEGACY_SESSION_STORAGE_KEYS.unlocked, "1");
    setSpy.mockClear();

    const snapshot = readLegacySettingsFromStorage(local, session);

    expect(snapshot.seafarer).toEqual({ rank: "2E" });
    expect(snapshot.reminders.urgent).toBe(14);
    expect(snapshot.pin.required).toBe(true);
    expect(snapshot.encryption.enabled).toBe(true);
    expect(snapshot.biometric.credentialId).toBe("credential");
    expect(snapshot.app.mode).toBe("lite");
    expect(snapshot.session.unlocked).toBe(true);
    expect(setSpy).not.toHaveBeenCalled();
  });

  it("reads fallback documents without mutating localStorage", () => {
    const local = new MemoryStorage();
    const setSpy = vi.spyOn(local, "setItem");
    local.setItem(
      LEGACY_LOCAL_STORAGE_KEYS.fallbackDocuments,
      JSON.stringify([plaintextDocumentFixture, encryptedDocumentFixture]),
    );
    setSpy.mockClear();

    const rows = readFallbackDocumentsFromStorage(local);

    expect(rows.map((row) => row.kind)).toEqual(["plaintext", "encrypted"]);
    expect(setSpy).not.toHaveBeenCalled();
  });

  it("does not open IndexedDB when database discovery is unavailable", async () => {
    const factory = {
      open: vi.fn(),
    } as unknown as IDBFactory;

    const detection = await detectLegacyDatabase(factory);

    expect(detection.status).toBe("unknown");
    expect(factory.open).not.toHaveBeenCalled();
  });
});
