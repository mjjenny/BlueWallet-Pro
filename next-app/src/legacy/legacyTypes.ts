export const LEGACY_ALLOWED_DOCUMENT_TYPES = [
  "passport",
  "cdc",
  "coc",
  "visa",
  "certificate",
  "medical",
  "yellowfever",
  "contract",
  "other",
] as const;

export type LegacyDocumentType = (typeof LEGACY_ALLOWED_DOCUMENT_TYPES)[number];

export type LegacyIssueSeverity = "warning" | "error";

export interface LegacyCompatibilityIssue {
  severity: LegacyIssueSeverity;
  code: string;
  message: string;
  path?: string;
}

export interface LegacyDocumentFile {
  data: string;
  name: string;
  type: string;
}

export interface LegacySingleFileFields {
  fileData?: string;
  fileName?: string;
  fileType?: string;
}

export interface LegacyPlaintextDocument extends LegacySingleFileFields {
  id: string;
  type: LegacyDocumentType | string;
  title: string;
  number?: string;
  authority?: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  noExpiry?: boolean;
  notes?: string;
  flagNotes?: string;
  tags?: string[] | string;
  favourite?: boolean;
  files?: LegacyDocumentFile[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LegacyNormalizedDocument {
  id: string;
  type: LegacyDocumentType;
  title: string;
  number: string;
  authority: string;
  issueDate: string | null;
  expiryDate: string | null;
  noExpiry: boolean;
  notes: string;
  flagNotes: string;
  tags: string[];
  favourite: boolean;
  files: LegacyDocumentFile[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LegacyEncryptedDocumentRecord {
  _enc: number;
  id: string;
  iv: string;
  data: string;
}

export type LegacyDocumentRecord =
  | LegacyPlaintextDocument
  | LegacyEncryptedDocumentRecord;

export interface LegacyPlaintextProfileRecord {
  key: "photo";
  data: string | null;
}

export interface LegacyEncryptedProfileRecord {
  key: "photo";
  _enc: number;
  iv: string;
  data: string;
}

export type LegacyProfileRecord =
  | LegacyPlaintextProfileRecord
  | LegacyEncryptedProfileRecord;

export interface LegacySeafarerProfile {
  name?: string;
  rank?: string;
  nationality?: string;
  cdc?: string;
  passport?: string;
  nok?: string;
  nokPhone?: string;
}

export interface LegacyPack {
  id: string;
  name: string;
  docIds: string[];
}

export interface LegacySeaTimeEntry {
  id: string;
  vessel: string;
  rank?: string;
  signOn?: string;
  signOff?: string;
  notes?: string;
}

export interface LegacyVaccineEntry {
  id: string;
  name: string;
  dose?: string;
  date?: string;
  expiry?: string;
  notes?: string;
}

export interface LegacyReminderSettings {
  primary: number;
  secondary: number;
  urgent: number;
  critical: number;
}

export interface LegacyExportSettings {
  idleMins: number;
  appMode: "lite" | "full" | string;
  theme: string;
  pinRequired: boolean;
}

export interface LegacyBackupPayload {
  version?: number | string;
  exportedAt?: string;
  documents: unknown[];
  profile?: string | null | Record<string, unknown>;
  seafarer?: LegacySeafarerProfile;
  packs?: LegacyPack[];
  seatime?: LegacySeaTimeEntry[];
  vaccines?: LegacyVaccineEntry[];
  reminders?: Partial<LegacyReminderSettings>;
  settings?: Partial<LegacyExportSettings>;
}

export type LegacyDocumentParseResult =
  | {
      kind: "plaintext";
      raw: unknown;
      document: LegacyNormalizedDocument;
      issues: LegacyCompatibilityIssue[];
    }
  | {
      kind: "encrypted";
      raw: unknown;
      record: LegacyEncryptedDocumentRecord;
      issues: LegacyCompatibilityIssue[];
    }
  | {
      kind: "malformed";
      raw: unknown;
      issues: LegacyCompatibilityIssue[];
    };

export interface LegacySettingsSnapshot {
  seafarer: LegacySeafarerProfile | null;
  packs: unknown[] | null;
  seatime: unknown[] | null;
  vaccines: unknown[] | null;
  reminders: LegacyReminderSettings;
  idleMins: number;
  pin: {
    hash: string | null;
    hashVersion: string | null;
    required: boolean;
    salt: string | null;
    failCount: number;
    lockUntil: number;
  };
  encryption: {
    enabled: boolean;
    salt: string | null;
  };
  biometric: {
    enabled: boolean;
    credentialId: string | null;
  };
  app: {
    mode: "lite" | "full" | string;
    theme: string;
    legacyTheme: string | null;
    iosBannerDismissed: boolean;
    onboardingDone: boolean;
  };
  session: {
    unlocked: boolean;
  };
  issues: LegacyCompatibilityIssue[];
}
