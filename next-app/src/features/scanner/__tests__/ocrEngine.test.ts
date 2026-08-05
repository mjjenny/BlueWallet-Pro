import { describe, expect, it, vi } from "vitest";
import { recognizeScannerPages } from "../ocrEngine";
import type { ScannerPage } from "../scannerPipeline";

const terminate = vi.fn(async () => undefined);
const recognize = vi.fn(async () => ({ data: { text: "PASSPORT OCR TEXT" } }));

vi.mock("tesseract.js", () => ({
  createWorker: vi.fn(async () => ({ recognize, terminate })),
}));

function page(file: File): ScannerPage {
  return {
    id: file.name,
    file,
    name: file.name,
    type: file.type,
    size: file.size,
    previewUrl: null,
    status: "ready",
  };
}

describe("OCR engine", () => {
  it("recognizes image pages and skips non-image attachments", async () => {
    const progress = vi.fn();
    const result = await recognizeScannerPages(
      [
        page(new File(["image"], "scan.png", { type: "image/png" })),
        page(new File(["pdf"], "scan.pdf", { type: "application/pdf" })),
      ],
      progress,
    );

    expect(result).toEqual({ text: "PASSPORT OCR TEXT", pagesRead: 1, skippedPages: 1 });
    expect(recognize).toHaveBeenCalledTimes(1);
    expect(terminate).toHaveBeenCalledTimes(1);
    expect(progress).toHaveBeenCalled();
  });
});
