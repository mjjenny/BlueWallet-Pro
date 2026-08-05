import { describe, expect, it, vi } from "vitest";
import { recognizeScannerPages } from "../ocrEngine";
import type { ScannerPage } from "../scannerPipeline";

const terminate = vi.fn(async () => undefined);
const recognize = vi.fn(async () => ({ data: { text: "PASSPORT OCR TEXT" } }));
const createWorker = vi.fn(async () => ({ recognize, terminate }));

vi.mock("tesseract.js", () => ({
  createWorker,
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
  it("keeps PDF-only OCR on the manual review fallback path without loading Tesseract", async () => {
    createWorker.mockClear();

    const result = await recognizeScannerPages([
      page(new File(["pdf"], "scan.pdf", { type: "application/pdf" })),
    ]);

    expect(result).toEqual({ text: "", pagesRead: 0, skippedPages: 1 });
    expect(createWorker).not.toHaveBeenCalled();
  });

  it("recognizes image pages and skips non-image attachments", async () => {
    const progress = vi.fn();
    createWorker.mockClear();
    recognize.mockClear();
    terminate.mockClear();

    const result = await recognizeScannerPages(
      [
        page(new File(["image"], "scan.png", { type: "image/png" })),
        page(new File(["pdf"], "scan.pdf", { type: "application/pdf" })),
      ],
      progress,
    );

    expect(result).toEqual({ text: "PASSPORT OCR TEXT", pagesRead: 1, skippedPages: 1 });
    expect(createWorker).toHaveBeenCalledWith("eng", 1, expect.any(Object));
    expect(recognize).toHaveBeenCalledTimes(1);
    expect(terminate).toHaveBeenCalledTimes(1);
    expect(progress).toHaveBeenCalled();
  });
});
