import type {
  LegacyCompatibilityIssue,
  LegacyEncryptedDocumentRecord,
  LegacyNormalizedDocument,
} from "../../legacy/legacyTypes";
import { getDocumentValidity, type DocumentValidity } from "../../shared/status/documentStatus";

export type LegacySourceFormat =
  | "plaintext"
  | "single-file legacy"
  | "multi-file"
  | "encrypted/unavailable";

export interface ReadableWalletDocument {
  kind: "readable";
  sourceFormat: Exclude<LegacySourceFormat, "encrypted/unavailable">;
  document: LegacyNormalizedDocument;
  validity: DocumentValidity;
}

export interface EncryptedWalletRecord {
  kind: "encrypted";
  sourceFormat: "encrypted/unavailable";
  id: string;
  record: LegacyEncryptedDocumentRecord;
}

export type WalletRecord = ReadableWalletDocument | EncryptedWalletRecord;

export interface MalformedWalletRecord {
  raw: unknown;
  issues: LegacyCompatibilityIssue[];
}

export function getLegacySourceFormat(raw: unknown, document: LegacyNormalizedDocument): ReadableWalletDocument["sourceFormat"] {
  if (typeof raw === "object" && raw && "fileData" in raw && document.files.length <= 1) {
    return "single-file legacy";
  }
  if (document.files.length > 1) return "multi-file";
  return "plaintext";
}

export function createReadableWalletDocument(
  raw: unknown,
  document: LegacyNormalizedDocument,
  now = new Date(),
): ReadableWalletDocument {
  return {
    kind: "readable",
    sourceFormat: getLegacySourceFormat(raw, document),
    document,
    validity: getDocumentValidity(document, now),
  };
}
