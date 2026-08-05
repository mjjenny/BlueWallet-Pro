import type { LegacyDocumentType } from "../../legacy/legacyTypes";
import type { EncryptedWalletRecord, ReadableWalletDocument, WalletRecord } from "./documentModel";

export type DocumentStatusFilter =
  | "all"
  | "valid"
  | "expiring"
  | "expired"
  | "no-expiry"
  | "encrypted";

export type DocumentSortKey = "expiry" | "name" | "category" | "updated";

export interface DocumentQuery {
  category: LegacyDocumentType;
  search: string;
  filter: DocumentStatusFilter;
  sort: DocumentSortKey;
}

export interface DashboardCounts {
  readable: number;
  encrypted: number;
  valid: number;
  expiring: number;
  expired: number;
  noExpiry: number;
  malformed: number;
}

export function getDashboardCounts(records: WalletRecord[], malformedCount = 0): DashboardCounts {
  const readable = records.filter((record): record is ReadableWalletDocument => record.kind === "readable");
  return {
    readable: readable.length,
    encrypted: records.filter((record): record is EncryptedWalletRecord => record.kind === "encrypted").length,
    valid: readable.filter((record) => record.validity.key === "valid").length,
    expiring: readable.filter((record) => record.validity.key === "expiring").length,
    expired: readable.filter((record) => record.validity.key === "expired").length,
    noExpiry: readable.filter((record) => record.validity.key === "no-expiry").length,
    malformed: malformedCount,
  };
}

export function getCategoryCounts(records: WalletRecord[]): Record<LegacyDocumentType, number> {
  const counts = {
    passport: 0,
    cdc: 0,
    coc: 0,
    visa: 0,
    certificate: 0,
    medical: 0,
    yellowfever: 0,
    contract: 0,
    other: 0,
  };

  for (const record of records) {
    if (record.kind === "readable") counts[record.document.type] += 1;
  }

  return counts;
}

function matchesSearch(record: ReadableWalletDocument, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  const doc = record.document;
  return [
    doc.title,
    doc.number,
    doc.authority,
    doc.notes,
    doc.flagNotes,
    ...doc.tags,
  ].some((value) => value.toLowerCase().includes(q));
}

function sortReadable(a: ReadableWalletDocument, b: ReadableWalletDocument, sort: DocumentSortKey): number {
  if (sort === "name") return a.document.title.localeCompare(b.document.title);
  if (sort === "category") return a.document.type.localeCompare(b.document.type) || a.document.title.localeCompare(b.document.title);
  if (sort === "updated") {
    return String(b.document.updatedAt ?? b.document.createdAt ?? "").localeCompare(
      String(a.document.updatedAt ?? a.document.createdAt ?? ""),
    );
  }

  const aDays = a.validity.days ?? Number.POSITIVE_INFINITY;
  const bDays = b.validity.days ?? Number.POSITIVE_INFINITY;
  return aDays - bDays || a.document.title.localeCompare(b.document.title);
}

export function selectDocuments(records: WalletRecord[], query: DocumentQuery): WalletRecord[] {
  if (query.filter === "encrypted") {
    return records.filter((record) => record.kind === "encrypted");
  }

  return records
    .filter((record): record is ReadableWalletDocument => record.kind === "readable")
    .filter((record) => record.document.type === query.category)
    .filter((record) => query.filter === "all" || record.validity.key === query.filter)
    .filter((record) => matchesSearch(record, query.search))
    .sort((a, b) => sortReadable(a, b, query.sort));
}
