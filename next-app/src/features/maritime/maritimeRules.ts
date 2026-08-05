import { getDocumentValidity } from "../../shared/status/documentStatus";
import type { ReactWalletDocumentView } from "../react-wallet/reactWalletTypes";

export interface MaritimeRequirement {
  id: string;
  label: string;
  group: "identity" | "certification" | "medical" | "travel" | "contract";
  matcher: (document: ReactWalletDocumentView) => boolean;
  critical: boolean;
}

export interface MaritimeRequirementStatus {
  requirement: MaritimeRequirement;
  matched: ReactWalletDocumentView | null;
  status: "ready" | "expiring" | "missing" | "expired";
}

export interface SeaServiceEntry {
  id: string;
  vessel: string;
  rank: string;
  signOn: string;
  signOff: string;
}

export const MARITIME_REQUIREMENTS: MaritimeRequirement[] = [
  { id: "passport", label: "Passport", group: "identity", critical: true, matcher: (doc) => doc.type === "passport" },
  { id: "cdc", label: "CDC / Seaman Book", group: "identity", critical: true, matcher: (doc) => doc.type === "cdc" },
  { id: "coc", label: "COC / License", group: "certification", critical: true, matcher: (doc) => doc.type === "coc" },
  {
    id: "basic-safety",
    label: "STCW Basic Safety",
    group: "certification",
    critical: true,
    matcher: (doc) => doc.type === "certificate" && hasAny(doc, ["basic safety", "stcw", "bst"]),
  },
  {
    id: "medical",
    label: "Medical Fitness",
    group: "medical",
    critical: true,
    matcher: (doc) => doc.type === "medical" || hasAny(doc, ["medical fitness"]),
  },
  { id: "yellow-fever", label: "Yellow Fever", group: "medical", critical: false, matcher: (doc) => doc.type === "yellowfever" },
  { id: "visa", label: "Visa", group: "travel", critical: false, matcher: (doc) => doc.type === "visa" },
  { id: "contract", label: "Contract", group: "contract", critical: true, matcher: (doc) => doc.type === "contract" },
];

function hasAny(document: ReactWalletDocumentView, terms: string[]): boolean {
  const haystack = `${document.title} ${document.notes} ${document.tags.join(" ")}`.toLowerCase();
  return terms.some((term) => haystack.includes(term));
}

function usableDocuments(documents: ReactWalletDocumentView[]): ReactWalletDocumentView[] {
  return documents.filter((document) => !document.deletedAt);
}

export function getMaritimeRequirementStatuses(documents: ReactWalletDocumentView[]): MaritimeRequirementStatus[] {
  const active = usableDocuments(documents);
  return MARITIME_REQUIREMENTS.map((requirement) => {
    const matches = active.filter(requirement.matcher);
    const matched = matches.sort((a, b) => String(b.expiryDate ?? "").localeCompare(String(a.expiryDate ?? "")))[0] ?? null;
    if (!matched) return { requirement, matched, status: "missing" };
    const validity = getDocumentValidity(matched);
    if (validity.key === "expired") return { requirement, matched, status: "expired" };
    if (validity.key === "expiring") return { requirement, matched, status: "expiring" };
    return { requirement, matched, status: "ready" };
  });
}

export function getReadyToJoinScore(documents: ReactWalletDocumentView[]): number {
  const statuses = getMaritimeRequirementStatuses(documents);
  const weighted = statuses.map((item) => {
    const weight = item.requirement.critical ? 2 : 1;
    const value = item.status === "ready" ? weight : item.status === "expiring" ? weight * 0.5 : 0;
    return { value, weight };
  });
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  const ready = weighted.reduce((sum, item) => sum + item.value, 0);
  return Math.round((ready / total) * 100);
}

export function getDocumentPacks(documents: ReactWalletDocumentView[]) {
  const statuses = getMaritimeRequirementStatuses(documents);
  return [
    { id: "joining", label: "Joining Pack", itemIds: ["passport", "cdc", "coc", "basic-safety", "medical", "contract"] },
    { id: "medical", label: "Medical Pack", itemIds: ["medical", "yellow-fever"] },
    { id: "travel", label: "Travel Pack", itemIds: ["passport", "visa", "contract"] },
  ].map((pack) => {
    const items = statuses.filter((status) => pack.itemIds.includes(status.requirement.id));
    const ready = items.filter((item) => item.status === "ready").length;
    return { ...pack, ready, total: items.length, items };
  });
}

export function getSeaServiceDays(entry: Pick<SeaServiceEntry, "signOn" | "signOff">): number {
  if (!entry.signOn || !entry.signOff || entry.signOff < entry.signOn) return 0;
  const start = new Date(`${entry.signOn}T00:00:00Z`).getTime();
  const end = new Date(`${entry.signOff}T00:00:00Z`).getTime();
  return Math.round((end - start) / 86_400_000) + 1;
}

export function getVaccinationDocuments(documents: ReactWalletDocumentView[]): ReactWalletDocumentView[] {
  return usableDocuments(documents).filter((document) => document.type === "yellowfever" || hasAny(document, ["vaccination", "vaccine", "yellow fever"]));
}
