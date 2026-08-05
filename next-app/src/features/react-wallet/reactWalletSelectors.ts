import type {
  ReactWalletDocumentView,
  ReactWalletSortKey,
  ReactWalletStatusFilter,
} from "./reactWalletTypes";
import type { LegacyDocumentType } from "../../legacy/legacyTypes";
import { getDocumentValidity } from "../../shared/status/documentStatus";

export interface ReactWalletQuery {
  category: LegacyDocumentType;
  search: string;
  filter: ReactWalletStatusFilter;
  sort: ReactWalletSortKey;
}

export interface ReactWalletCounts {
  total: number;
  active: number;
  deleted: number;
  valid: number;
  expiring: number;
  expired: number;
  noExpiry: number;
  favourites: number;
}

export const REACT_WALLET_RENDER_LIMIT = 100;

export function getReactWalletRenderWindow(documents: ReactWalletDocumentView[]) {
  return {
    visible: documents.slice(0, REACT_WALLET_RENDER_LIMIT),
    hiddenCount: Math.max(0, documents.length - REACT_WALLET_RENDER_LIMIT),
  };
}

export function getReactWalletCounts(documents: ReactWalletDocumentView[]): ReactWalletCounts {
  const active = documents.filter((document) => !document.deletedAt);
  return {
    total: documents.length,
    active: active.length,
    deleted: documents.filter((document) => !!document.deletedAt).length,
    valid: active.filter((document) => getDocumentValidity(document).key === "valid").length,
    expiring: active.filter((document) => getDocumentValidity(document).key === "expiring").length,
    expired: active.filter((document) => getDocumentValidity(document).key === "expired").length,
    noExpiry: active.filter((document) => getDocumentValidity(document).key === "no-expiry").length,
    favourites: active.filter((document) => document.favourite).length,
  };
}

export function getReactCategoryCounts(documents: ReactWalletDocumentView[]): Record<LegacyDocumentType, number> {
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
  for (const document of documents) {
    if (!document.deletedAt) counts[document.type] += 1;
  }
  return counts;
}

function matchesSearch(document: ReactWalletDocumentView, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return [
    document.title,
    document.number,
    document.authority,
    document.notes,
    document.flagNotes,
    ...document.tags,
  ].some((value) => value.toLowerCase().includes(q));
}

function sortDocuments(a: ReactWalletDocumentView, b: ReactWalletDocumentView, sort: ReactWalletSortKey): number {
  if (sort === "name") return a.title.localeCompare(b.title);
  if (sort === "category") return a.type.localeCompare(b.type) || a.title.localeCompare(b.title);
  if (sort === "updated") return b.updatedAt.localeCompare(a.updatedAt);
  const aDays = getDocumentValidity(a).days ?? Number.POSITIVE_INFINITY;
  const bDays = getDocumentValidity(b).days ?? Number.POSITIVE_INFINITY;
  return aDays - bDays || a.title.localeCompare(b.title);
}

export function selectReactWalletDocuments(
  documents: ReactWalletDocumentView[],
  query: ReactWalletQuery,
): ReactWalletDocumentView[] {
  return documents
    .filter((document) => (query.filter === "deleted" ? !!document.deletedAt : !document.deletedAt))
    .filter((document) => query.filter === "deleted" || document.type === query.category)
    .filter((document) => {
      if (query.filter === "all" || query.filter === "deleted") return true;
      if (query.filter === "favourites") return document.favourite;
      return getDocumentValidity(document).key === query.filter;
    })
    .filter((document) => matchesSearch(document, query.search))
    .sort((a, b) => sortDocuments(a, b, query.sort));
}
