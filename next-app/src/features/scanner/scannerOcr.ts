import type { LegacyDocumentType } from "../../legacy/legacyTypes";
import type { ReactWalletDocumentInput } from "../react-wallet/reactWalletTypes";

export interface ScannerOcrSuggestion {
  input: ReactWalletDocumentInput;
  confidence: number;
  source: "mrz" | "cdc" | "certificate" | "generic";
  fields: string[];
  warnings: string[];
}

function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function dateFromMrz(value: string): string | null {
  if (!/^\d{6}$/.test(value)) return null;
  const year = Number(value.slice(0, 2));
  const month = Number(value.slice(2, 4));
  const day = Number(value.slice(4, 6));
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const fullYear = year >= 70 ? 1900 + year : 2000 + year;
  return `${fullYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function normalizeDate(value: string): string | null {
  const trimmed = value.trim();
  const iso = trimmed.match(/\b(20\d{2}|19\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;

  const dmy = trimmed.match(/\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.]((?:20|19)\d{2})\b/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;

  const named = trimmed.match(/\b(0?[1-9]|[12]\d|3[01])\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+((?:20|19)\d{2})\b/i);
  if (!named) return null;
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const month = months.indexOf(named[2].slice(0, 3).toLowerCase()) + 1;
  return `${named[3]}-${String(month).padStart(2, "0")}-${named[1].padStart(2, "0")}`;
}

function findDateAfter(label: RegExp, text: string): string | null {
  const match = text.match(label);
  if (!match?.[1]) return null;
  return normalizeDate(match[1]);
}

function parseMrz(text: string): ScannerOcrSuggestion | null {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/\s/g, ""))
    .filter((line) => /^[A-Z0-9<]{30,44}$/.test(line));
  const first = lines.find((line) => line.startsWith("P<"));
  if (!first) return null;
  const second = lines[lines.indexOf(first) + 1];
  if (!second || second.length < 27) return null;

  const rawNames = first.slice(5).split("<<");
  const surname = clean((rawNames[0] ?? "").replace(/</g, " "));
  const given = clean((rawNames[1] ?? "").replace(/</g, " "));
  const documentNumber = second.slice(0, 9).replace(/</g, "");
  const nationality = second.slice(10, 13).replace(/</g, "");
  const expiryDate = dateFromMrz(second.slice(21, 27));
  const titleName = clean([surname, given].filter(Boolean).join(" "));

  return {
    source: "mrz",
    confidence: expiryDate && documentNumber ? 0.94 : 0.72,
    fields: ["type", "title", "number", "authority", "expiryDate"],
    warnings: expiryDate ? [] : ["MRZ expiry date could not be read."],
    input: {
      type: "passport",
      title: titleName ? `Passport - ${titleName}` : "Passport scan",
      number: documentNumber,
      authority: nationality,
      expiryDate,
      issueDate: null,
      noExpiry: false,
      notes: "OCR source: passport MRZ. Review all fields before saving.",
      flagNotes: "",
      tags: ["scanned", "mrz", "ocr-review"],
      favourite: false,
    },
  };
}

function parseNumber(labels: string[], text: string): string {
  for (const label of labels) {
    const pattern = new RegExp(`${label}\\s*(?:no\\.?|number|#)?\\s*[:\\-]?\\s*([A-Z0-9][A-Z0-9\\-/]{3,})`, "i");
    const match = text.match(pattern);
    if (match?.[1]) return match[1].replace(/[.,;]+$/, "");
  }
  return "";
}

function detectAuthority(text: string): string {
  const match = text.match(/\b(?:authority|issued by|administration)\s*[:\-]?\s*([A-Z][A-Za-z .,&-]{2,80})/i);
  return clean(match?.[1] ?? "");
}

function genericSuggestion(text: string, type: LegacyDocumentType, source: ScannerOcrSuggestion["source"]): ScannerOcrSuggestion {
  const number = parseNumber(
    type === "cdc" ? ["cdc", "seaman.?s book", "discharge book"] : ["certificate", "cert", "document", "license", "licence"],
    text,
  );
  const issueDate = findDateAfter(/\b(?:issue date|issued on|date of issue)\s*[:\-]?\s*([A-Za-z0-9 .\-/]+)/i, text);
  const expiryDate = findDateAfter(/\b(?:expiry date|expires|valid until|date of expiry)\s*[:\-]?\s*([A-Za-z0-9 .\-/]+)/i, text);
  const titleMatch = text.match(/\b(STCW|Basic Safety|Medical Fitness|Yellow Fever|Certificate of Competency|Seafarer'?s? Identity|CDC)\b/i);
  const title = clean(titleMatch?.[0] ?? (type === "cdc" ? "CDC scan" : type === "certificate" ? "Certificate scan" : "Scanned document"));
  const fields = ["type", "title"];
  if (number) fields.push("number");
  if (issueDate) fields.push("issueDate");
  if (expiryDate) fields.push("expiryDate");
  const warnings = expiryDate ? [] : ["Expiry date was not confidently detected."];

  return {
    source,
    confidence: Math.min(0.88, 0.42 + fields.length * 0.1),
    fields,
    warnings,
    input: {
      type,
      title,
      number,
      authority: detectAuthority(text),
      issueDate,
      expiryDate,
      noExpiry: !expiryDate,
      notes: "OCR source: local text review. Review all fields before saving.",
      flagNotes: "",
      tags: ["scanned", "ocr-review", source],
      favourite: false,
    },
  };
}

export function parseScannerOcrText(text: string): ScannerOcrSuggestion {
  const normalized = text.trim();
  const mrz = parseMrz(normalized);
  if (mrz) return mrz;
  if (/\b(CDC|seaman'?s book|discharge book)\b/i.test(normalized)) return genericSuggestion(normalized, "cdc", "cdc");
  if (/\b(STCW|certificate|competency|medical fitness|yellow fever)\b/i.test(normalized)) {
    const type: LegacyDocumentType = /\byellow fever\b/i.test(normalized) ? "yellowfever" : "certificate";
    return genericSuggestion(normalized, type, "certificate");
  }
  return genericSuggestion(normalized, "other", "generic");
}
