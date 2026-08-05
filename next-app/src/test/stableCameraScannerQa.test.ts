import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(process.cwd(), "..");

function stableHtml(): string {
  return readFileSync(path.join(repoRoot, "legacy-root-pwa.html"), "utf8").replace(/\r\n/g, "\n");
}

describe("stable camera and scanner QA safeguards", () => {
  it("keeps camera/file controls accessible with live status messaging", () => {
    const html = stableHtml();

    expect(html).toContain('id="camera-file" accept="image/*" capture="environment"');
    expect(html).toContain('aria-label="Open camera to scan document"');
    expect(html).toContain('id="scan-status" role="status" aria-live="polite"');
    expect(html).toContain("Opening camera. If Safari asks, allow camera access for this scan.");
    expect(html).toContain("Camera cancelled or permission was not granted. No data changed.");
  });

  it("resets pending scanner state on add-document cancel", () => {
    const html = stableHtml();

    expect(html).toContain("function resetScanWorkflow()");
    expect(html).toContain("pendingFiles = [];");
    expect(html).toContain("function cancelAddFlow()");
    expect(html).toContain("document.getElementById('close-add').onclick = () => cancelAddFlow();");
    expect(html).toContain("document.getElementById('btn-cancel').onclick = () => cancelAddFlow();");
  });

  it("keeps failed scans and OCR recoverable without changing fields", () => {
    const html = stableHtml();

    expect(html).toContain("Scan could not be read. Try camera again, choose a file, or continue without changing saved data.");
    expect(html).toContain("Fields were not changed; retry with a clearer photo or enter details manually.");
    expect(html).toContain("recordActivity('camera-scan-cancelled'");
    expect(html).toContain("recordActivity('ocr-failed'");
  });

  it("documents the required iOS Safari real-device check", () => {
    const handover = readFileSync(path.join(repoRoot, "docs", "THIRD-PARTY-TESTING-HANDOVER.md"), "utf8").replace(/\r\n/g, "\n");

    expect(handover).toContain("On iOS Safari, camera permission prompt appears from Add Document -> Scan with camera.");
    expect(handover).toContain("If iOS Safari camera permission is denied/cancelled, the Add Document modal stays usable and saved data is unchanged.");
    expect(handover).toContain("Failed OCR leaves fields unchanged and supports retry/manual entry.");
  });
});
