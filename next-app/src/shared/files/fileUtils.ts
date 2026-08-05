import type { LegacyDocumentFile } from "../../legacy/legacyTypes";

export function isImageFile(file: LegacyDocumentFile): boolean {
  return file.type.startsWith("image/") && file.data.startsWith("data:image/");
}

export function isPdfFile(file: LegacyDocumentFile): boolean {
  return file.type.includes("pdf") && file.data.startsWith("data:");
}

export function describeFile(file: LegacyDocumentFile, index: number): string {
  const name = file.name || `Attachment ${index + 1}`;
  const type = file.type || "application/octet-stream";
  return `${name} (${type})`;
}
