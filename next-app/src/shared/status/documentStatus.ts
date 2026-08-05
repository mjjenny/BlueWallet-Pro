import { daysUntil } from "../dates/dateUtils";
import type { LegacyNormalizedDocument } from "../../legacy/legacyTypes";

export type DocumentValidityKey = "valid" | "expiring" | "expired" | "no-expiry";

export interface DocumentValidity {
  key: DocumentValidityKey;
  label: string;
  days: number | null;
}

export function getDocumentValidity(
  document: Pick<LegacyNormalizedDocument, "expiryDate" | "noExpiry">,
  now = new Date(),
): DocumentValidity {
  if (document.noExpiry || !document.expiryDate) {
    return { key: "no-expiry", label: "No Expiry", days: null };
  }

  const days = daysUntil(document.expiryDate, now);
  if (days == null) return { key: "no-expiry", label: "No Expiry", days: null };
  if (days < 0) return { key: "expired", label: "Expired", days };
  if (days <= 90) return { key: "expiring", label: `${days}d left`, days };
  return { key: "valid", label: "Valid", days };
}
