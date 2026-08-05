import { useMemo, useState } from "react";
import { Badge } from "../../components/Badge";
import type { LegacyDocumentType } from "../../legacy/legacyTypes";
import { getCategoryLabel } from "../documents/documentCategories";
import type { ReactWalletDocumentInput } from "../react-wallet/reactWalletTypes";
import { validateDocumentInput } from "../react-wallet/reactWalletValidation";
import { buildScannerPages, mergeScannerFiles, pagesToFiles, type ScannerPage } from "./scannerPipeline";
import { parseScannerOcrText, type ScannerOcrSuggestion } from "./scannerOcr";

const blankScanInput: ReactWalletDocumentInput = {
  type: "passport",
  title: "",
  number: "",
  authority: "",
  issueDate: "",
  expiryDate: "",
  noExpiry: false,
  notes: "",
  flagNotes: "",
  tags: ["scanned", "ocr-review"],
  favourite: false,
};

interface ScannerWorkflowProps {
  initialType: LegacyDocumentType;
  online: boolean;
  onCancel: () => void;
  onSave: (input: ReactWalletDocumentInput, files: File[]) => Promise<void>;
}

function confidenceTone(confidence: number): "good" | "warn" | "neutral" {
  if (confidence >= 0.85) return "good";
  if (confidence >= 0.6) return "warn";
  return "neutral";
}

export function ScannerWorkflow({ initialType, online, onCancel, onSave }: ScannerWorkflowProps) {
  const [pages, setPages] = useState<ScannerPage[]>([]);
  const [ocrText, setOcrText] = useState("");
  const [suggestion, setSuggestion] = useState<ScannerOcrSuggestion | null>(null);
  const [input, setInput] = useState<ReactWalletDocumentInput>(() => ({ ...blankScanInput, type: initialType }));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const validation = useMemo(() => validateDocumentInput(input), [input]);

  async function addFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;
    const incoming = await buildScannerPages(files);
    setPages((current) => mergeScannerFiles(current, incoming));
    setMessage(`${files.length} page${files.length === 1 ? "" : "s"} queued.`);
  }

  function applyOcr() {
    const next = parseScannerOcrText(ocrText);
    setSuggestion(next);
    setInput(next.input);
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      await onSave(input, pagesToFiles(pages));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Scanner save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="details-modal scanner-modal" role="dialog" aria-modal="true" aria-labelledby="scanner-title">
        <div className="details-head">
          <div>
            <p className="eyebrow">Scanner and OCR</p>
            <h2 id="scanner-title">Scan document</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Close scanner" onClick={onCancel}>x</button>
        </div>
        <div className="details-body scanner-grid">
          <section className="scanner-panel">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">Capture</p>
                <h3>Pages</h3>
              </div>
              <Badge tone={online ? "good" : "warn"}>{online ? "Online" : "Offline"}</Badge>
            </div>
            <div className="scanner-actions">
              <label className="secondary-action import-button">
                Camera
                <input type="file" accept="image/*" capture="environment" multiple onChange={(event) => void addFiles(event.target.files)} />
              </label>
              <label className="secondary-action import-button">
                Import files
                <input type="file" accept="image/*,application/pdf" multiple onChange={(event) => void addFiles(event.target.files)} />
              </label>
            </div>
            <div className="scan-page-list" aria-label="Queued scan pages">
              {pages.length === 0 ? <p className="muted">No pages queued.</p> : pages.map((page, index) => (
                <article className="scan-page" key={page.id}>
                  {page.previewUrl ? <img src={page.previewUrl} alt="" /> : <div className="doc-thumb placeholder">PDF</div>}
                  <div>
                    <strong>Page {index + 1}</strong>
                    <p className="muted">{page.name} - {Math.max(1, Math.round(page.size / 1024))} KB</p>
                  </div>
                  <button type="button" className="icon-button" aria-label={`Remove page ${index + 1}`} onClick={() => setPages((current) => current.filter((item) => item.id !== page.id))}>x</button>
                </article>
              ))}
            </div>
          </section>

          <section className="scanner-panel">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">OCR review</p>
                <h3>Suggestions</h3>
              </div>
              {suggestion ? <Badge tone={confidenceTone(suggestion.confidence)}>{Math.round(suggestion.confidence * 100)}%</Badge> : null}
            </div>
            <label className="wide-field">
              <span>OCR text</span>
              <textarea value={ocrText} onChange={(event) => setOcrText(event.target.value)} />
            </label>
            <button type="button" className="secondary-action" disabled={!ocrText.trim()} onClick={applyOcr}>Parse OCR</button>
            {suggestion ? (
              <div className="warning-list">
                <h3>{suggestion.source.toUpperCase()} fields</h3>
                <p className="muted">{suggestion.fields.join(", ") || "No confident fields"}</p>
                {suggestion.warnings.length ? <ul>{suggestion.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}
              </div>
            ) : null}
          </section>

          <form className="scanner-panel form-grid" aria-label="Review scanned document">
            <div className="section-title-row wide-field">
              <div>
                <p className="eyebrow">Review before save</p>
                <h3>Document fields</h3>
              </div>
              <Badge tone={validation.ok ? "good" : "warn"}>{validation.ok ? "Ready" : "Review"}</Badge>
            </div>
            <label>
              <span>Category</span>
              <select value={input.type} onChange={(event) => setInput({ ...input, type: event.target.value as LegacyDocumentType })}>
                {(["passport", "cdc", "coc", "visa", "certificate", "medical", "yellowfever", "contract", "other"] as LegacyDocumentType[]).map((type) => (
                  <option key={type} value={type}>{getCategoryLabel(type)}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Title</span>
              <input value={input.title} onChange={(event) => setInput({ ...input, title: event.target.value })} />
            </label>
            <label>
              <span>Number</span>
              <input value={input.number ?? ""} onChange={(event) => setInput({ ...input, number: event.target.value })} />
            </label>
            <label>
              <span>Authority</span>
              <input value={input.authority ?? ""} onChange={(event) => setInput({ ...input, authority: event.target.value })} />
            </label>
            <label>
              <span>Issue date</span>
              <input type="date" value={input.issueDate ?? ""} onChange={(event) => setInput({ ...input, issueDate: event.target.value })} />
            </label>
            <label>
              <span>Expiry date</span>
              <input type="date" value={input.expiryDate ?? ""} disabled={!!input.noExpiry} onChange={(event) => setInput({ ...input, expiryDate: event.target.value })} />
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={!!input.noExpiry} onChange={(event) => setInput({ ...input, noExpiry: event.target.checked, expiryDate: event.target.checked ? "" : input.expiryDate })} />
              <span>No Expiry</span>
            </label>
            <label className="wide-field">
              <span>Tags</span>
              <input value={Array.isArray(input.tags) ? input.tags.join(", ") : input.tags ?? ""} onChange={(event) => setInput({ ...input, tags: event.target.value })} />
            </label>
            {!validation.ok ? <ul className="validation-list wide-field">{validation.errors.map((error) => <li key={error}>{error}</li>)}</ul> : null}
            {message ? <p className="muted wide-field" aria-live="polite">{message}</p> : null}
            <div className="form-actions wide-field">
              <button type="button" className="secondary-action" onClick={onCancel}>Cancel</button>
              <button type="button" className="primary-action" disabled={!validation.ok || saving || pages.length === 0} onClick={() => void save()}>
                {saving ? "Saving..." : "Save encrypted scan"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
