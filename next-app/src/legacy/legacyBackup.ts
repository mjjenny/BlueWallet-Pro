import {
  LEGACY_ALLOWED_DOCUMENT_TYPES,
  type LegacyBackupPayload,
  type LegacyCompatibilityIssue,
  type LegacyDocumentFile,
  type LegacyDocumentParseResult,
  type LegacyDocumentType,
  type LegacyNormalizedDocument,
  type LegacyReminderSettings,
} from "./legacyTypes";
import { isLegacyEncryptedDocumentRecord } from "./legacyCryptoRecords";

const DEFAULT_REMINDERS: LegacyReminderSettings = {
  primary: 183,
  secondary: 90,
  urgent: 30,
  critical: 7,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function issue(
  severity: "warning" | "error",
  code: string,
  message: string,
  path?: string,
): LegacyCompatibilityIssue {
  return { severity, code, message, path };
}

function coerceString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function coerceNullableString(value: unknown): string | null {
  if (value == null || value === "") return null;
  return String(value);
}

function sanitizeId(id: unknown): string {
  return String(id ?? "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 80);
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).slice(0, 40)).slice(0, 20);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.slice(0, 40))
      .slice(0, 20);
  }
  return [];
}

function normalizeFile(value: unknown): LegacyDocumentFile | null {
  if (!isRecord(value)) return null;
  const data = coerceString(value.data);
  if (!data.startsWith("data:")) return null;
  return {
    data,
    name: coerceString(value.name, "scan").slice(0, 120),
    type: coerceString(value.type, "application/octet-stream").slice(0, 80),
  };
}

function normalizeFiles(raw: Record<string, unknown>): LegacyDocumentFile[] {
  if (Array.isArray(raw.files)) {
    return raw.files
      .map((file) => normalizeFile(file))
      .filter((file): file is LegacyDocumentFile => !!file);
  }

  if (typeof raw.fileData === "string" && raw.fileData.startsWith("data:")) {
    return [
      {
        data: raw.fileData,
        name: coerceString(raw.fileName, "scan").slice(0, 120),
        type: coerceString(raw.fileType, "image/jpeg").slice(0, 80),
      },
    ];
  }

  return [];
}

export function parseLegacyDocumentRecord(raw: unknown): LegacyDocumentParseResult {
  if (isLegacyEncryptedDocumentRecord(raw)) {
    return { kind: "encrypted", raw, record: raw, issues: [] };
  }

  if (!isRecord(raw)) {
    return {
      kind: "malformed",
      raw,
      issues: [issue("error", "document.notObject", "Document record is not an object")],
    };
  }

  const issues: LegacyCompatibilityIssue[] = [];
  const id = sanitizeId(raw.id);
  if (!id) {
    return {
      kind: "malformed",
      raw,
      issues: [
        issue("error", "document.missingId", "Plaintext document has no usable id", "id"),
      ],
    };
  }

  let type = coerceString(raw.type, "other") as LegacyDocumentType;
  if (!LEGACY_ALLOWED_DOCUMENT_TYPES.includes(type)) {
    issues.push(
      issue(
        "warning",
        "document.unknownType",
        `Unknown document type "${String(raw.type)}"; normalized to "other"`,
        "type",
      ),
    );
    type = "other";
  }

  if (raw.files && !Array.isArray(raw.files)) {
    issues.push(issue("warning", "document.invalidFiles", "files is not an array", "files"));
  }

  const normalized: LegacyNormalizedDocument = {
    id,
    type,
    title: coerceString(raw.title, "Untitled").slice(0, 200) || "Untitled",
    number: coerceString(raw.number).slice(0, 80),
    authority: coerceString(raw.authority).slice(0, 120),
    issueDate: coerceNullableString(raw.issueDate)?.slice(0, 32) ?? null,
    expiryDate: coerceNullableString(raw.expiryDate)?.slice(0, 32) ?? null,
    noExpiry: !!raw.noExpiry,
    notes: coerceString(raw.notes).slice(0, 2000),
    flagNotes: coerceString(raw.flagNotes).slice(0, 1000),
    tags: normalizeTags(raw.tags),
    favourite: !!raw.favourite,
    files: normalizeFiles(raw),
  };

  if (typeof raw.createdAt === "string") normalized.createdAt = raw.createdAt;
  if (typeof raw.updatedAt === "string") normalized.updatedAt = raw.updatedAt;

  return { kind: "plaintext", raw, document: normalized, issues };
}

export function normalizeLegacyReminders(value: unknown): LegacyReminderSettings {
  if (!isRecord(value)) return { ...DEFAULT_REMINDERS };
  return {
    primary: Number(value.primary) || DEFAULT_REMINDERS.primary,
    secondary: Number(value.secondary) || DEFAULT_REMINDERS.secondary,
    urgent: Number(value.urgent) || DEFAULT_REMINDERS.urgent,
    critical: Number(value.critical) || DEFAULT_REMINDERS.critical,
  };
}

export function validateLegacyBackupVersion(value: unknown): {
  exportedVersion: "v4" | "unversioned" | "unknown";
  rootImportCompatible: boolean;
  issues: LegacyCompatibilityIssue[];
} {
  const issues: LegacyCompatibilityIssue[] = [];
  if (!isRecord(value)) {
    return {
      exportedVersion: "unknown",
      rootImportCompatible: false,
      issues: [issue("error", "backup.notObject", "Backup payload is not an object")],
    };
  }

  const hasDocuments = Array.isArray(value.documents) && value.documents.length > 0;
  if (!hasDocuments) {
    issues.push(
      issue(
        "error",
        "backup.missingDocuments",
        "Root import requires a non-empty documents array",
        "documents",
      ),
    );
  }

  if (value.version === 4) {
    return { exportedVersion: "v4", rootImportCompatible: hasDocuments, issues };
  }

  if (value.version == null) {
    issues.push(
      issue("warning", "backup.unversioned", "Backup has no version field but root import can accept it"),
    );
    return { exportedVersion: "unversioned", rootImportCompatible: hasDocuments, issues };
  }

  issues.push(
    issue(
      "warning",
      "backup.unknownVersion",
      `Backup version ${String(value.version)} is not exported by the active root PWA`,
      "version",
    ),
  );
  return { exportedVersion: "unknown", rootImportCompatible: hasDocuments, issues };
}

export function parseLegacyBackupJson(input: string | unknown): {
  ok: boolean;
  payload?: LegacyBackupPayload;
  documents: LegacyDocumentParseResult[];
  issues: LegacyCompatibilityIssue[];
} {
  let parsed: unknown = input;
  const issues: LegacyCompatibilityIssue[] = [];

  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input) as unknown;
    } catch {
      return {
        ok: false,
        documents: [],
        issues: [issue("error", "backup.invalidJson", "Backup JSON could not be parsed")],
      };
    }
  }

  const version = validateLegacyBackupVersion(parsed);
  issues.push(...version.issues);
  if (!isRecord(parsed) || !Array.isArray(parsed.documents)) {
    return { ok: false, documents: [], issues };
  }

  const payload = { ...parsed, documents: parsed.documents } as unknown as LegacyBackupPayload;
  const documents = parsed.documents.map((record) => parseLegacyDocumentRecord(record));
  const hasDocumentErrors = documents.some((result) =>
    result.issues.some((item) => item.severity === "error"),
  );

  return {
    ok: version.rootImportCompatible && !hasDocumentErrors,
    payload,
    documents,
    issues,
  };
}
