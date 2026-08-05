import type { LegacyDocumentType } from "../../legacy/legacyTypes";

export interface DocumentCategory {
  id: LegacyDocumentType;
  label: string;
  shortLabel: string;
}

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  { id: "passport", label: "Passport", shortLabel: "Passport" },
  { id: "cdc", label: "CDC", shortLabel: "CDC" },
  { id: "coc", label: "COC", shortLabel: "COC" },
  { id: "visa", label: "Visa", shortLabel: "Visa" },
  { id: "certificate", label: "Certificate", shortLabel: "Cert" },
  { id: "medical", label: "Medical", shortLabel: "Medical" },
  { id: "yellowfever", label: "Yellow Fever", shortLabel: "YF" },
  { id: "contract", label: "Contract", shortLabel: "Contract" },
  { id: "other", label: "Other", shortLabel: "Other" },
];

export function getCategoryLabel(type: string): string {
  return DOCUMENT_CATEGORIES.find((category) => category.id === type)?.label ?? "Other";
}
