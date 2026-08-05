import type { ScannerPage } from "./scannerPipeline";

export interface OcrEngineProgress {
  status: string;
  progress: number;
}

export interface OcrEngineResult {
  text: string;
  pagesRead: number;
  skippedPages: number;
}

export async function recognizeScannerPages(
  pages: ScannerPage[],
  onProgress: (progress: OcrEngineProgress) => void = () => undefined,
): Promise<OcrEngineResult> {
  const imagePages = pages.filter((page) => page.file.type.startsWith("image/"));
  const skippedPages = pages.length - imagePages.length;
  if (!imagePages.length) {
    return { text: "", pagesRead: 0, skippedPages };
  }

  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: (event) => {
      if (typeof event.status === "string" && typeof event.progress === "number") {
        onProgress({ status: event.status, progress: event.progress });
      }
    },
  });

  try {
    const text: string[] = [];
    for (const [index, page] of imagePages.entries()) {
      onProgress({ status: `reading page ${index + 1}`, progress: index / imagePages.length });
      const result = await worker.recognize(page.file);
      text.push(result.data.text.trim());
    }
    onProgress({ status: "complete", progress: 1 });
    return {
      text: text.filter(Boolean).join("\n\n"),
      pagesRead: imagePages.length,
      skippedPages,
    };
  } finally {
    await worker.terminate();
  }
}
