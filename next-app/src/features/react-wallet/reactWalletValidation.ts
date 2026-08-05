import type { ReactWalletDocumentInput, ReactWalletValidationResult } from "./reactWalletTypes";
import { LEGACY_ALLOWED_DOCUMENT_TYPES } from "../../legacy/legacyTypes";

export function normalizeTags(tags: string[] | string | undefined): string[] {
  if (Array.isArray(tags)) return tags.map((tag) => tag.trim()).filter(Boolean).slice(0, 20);
  return String(tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function validateDocumentInput(input: ReactWalletDocumentInput): ReactWalletValidationResult {
  const errors: string[] = [];
  if (!LEGACY_ALLOWED_DOCUMENT_TYPES.includes(input.type)) errors.push("Choose a valid category.");
  if (!input.title.trim()) errors.push("Title is required.");
  if (!input.noExpiry && !input.expiryDate) errors.push("Expiry date is required unless No Expiry is enabled.");
  if (input.issueDate && input.expiryDate && !input.noExpiry && input.issueDate > input.expiryDate) {
    errors.push("Issue date cannot be after expiry date.");
  }
  return { ok: errors.length === 0, errors };
}

export function sanitizeDocumentInput(input: ReactWalletDocumentInput): ReactWalletDocumentInput {
  return {
    type: input.type,
    title: input.title.trim().slice(0, 200),
    number: String(input.number ?? "").trim().slice(0, 80),
    authority: String(input.authority ?? "").trim().slice(0, 120),
    issueDate: input.issueDate || null,
    expiryDate: input.noExpiry ? null : input.expiryDate || null,
    noExpiry: !!input.noExpiry,
    notes: String(input.notes ?? "").trim().slice(0, 2000),
    flagNotes: String(input.flagNotes ?? "").trim().slice(0, 1000),
    tags: normalizeTags(input.tags).map((tag) => tag.slice(0, 40)),
    favourite: !!input.favourite,
  };
}
