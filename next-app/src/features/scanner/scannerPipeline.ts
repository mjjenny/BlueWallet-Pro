export interface ScannerPage {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
  previewUrl: string | null;
  status: "ready" | "needs-review";
}

function uid(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export async function buildScannerPages(files: File[]): Promise<ScannerPage[]> {
  return Promise.all(
    files.map(async (rawFile) => {
      const file = rawFile.type.startsWith("image/") ? await cleanupImageFile(rawFile) : rawFile;
      return {
        id: uid(),
        file,
        name: file.name || "scan-page",
        type: file.type || "application/octet-stream",
        size: file.size,
        previewUrl: file.type.startsWith("image/") ? await readFilePreview(file) : null,
        status: file.type.startsWith("image/") || file.type === "application/pdf" ? "ready" : "needs-review",
      };
    }),
  );
}

function readFilePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function mergeScannerFiles(existing: ScannerPage[], incoming: ScannerPage[]): ScannerPage[] {
  const seen = new Set(existing.map((page) => `${page.name}:${page.size}:${page.type}`));
  return [...existing, ...incoming.filter((page) => !seen.has(`${page.name}:${page.size}:${page.type}`))].slice(0, 12);
}

export function pagesToFiles(pages: ScannerPage[]): File[] {
  return pages.map((page) => page.file);
}

async function cleanupImageFile(file: File): Promise<File> {
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const maxSide = 1800;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.filter = "contrast(1.08) saturate(0.96)";
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (!blob) return file;
    const stem = file.name.replace(/\.[^.]+$/, "") || "scan-page";
    return new File([blob], `${stem}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
