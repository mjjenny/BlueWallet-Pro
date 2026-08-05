import { Badge } from "../../components/Badge";
import { formatDate } from "../../shared/dates/dateUtils";
import { compactText } from "../../shared/formatting/text";
import { describeFile, isImageFile, isPdfFile } from "../../shared/files/fileUtils";
import { getCategoryLabel } from "./documentCategories";
import type { WalletRecord } from "./documentModel";

interface DocumentDetailsProps {
  record: WalletRecord | null;
  onClose: () => void;
}

export function DocumentDetails({ record, onClose }: DocumentDetailsProps) {
  if (!record) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="details-head">
          <div>
            <p className="eyebrow">Read-only details</p>
            <h2 id="details-title">
              {record.kind === "readable" ? record.document.title : "Encrypted legacy document"}
            </h2>
          </div>
          <button type="button" className="icon-button" aria-label="Close details" onClick={onClose}>
            x
          </button>
        </div>

        {record.kind === "encrypted" ? (
          <div className="details-body">
            <Badge tone="warn">Encrypted/unavailable</Badge>
            <p className="muted">
              This record is present in the legacy wallet, but Phase 3 does not implement PIN or
              encryption. No unsafe decryption was attempted.
            </p>
            <dl className="detail-grid">
              <div>
                <dt>Record id</dt>
                <dd>{record.id}</dd>
              </div>
              <div>
                <dt>Legacy source format</dt>
                <dd>{record.sourceFormat}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="details-body">
            <div className="detail-status-row">
              <Badge tone="info">{record.sourceFormat}</Badge>
              <Badge tone={record.validity.key === "expired" ? "bad" : record.validity.key === "expiring" ? "warn" : "good"}>
                {record.validity.label}
              </Badge>
            </div>

            <dl className="detail-grid">
              <div>
                <dt>Number</dt>
                <dd>{compactText(record.document.number)}</dd>
              </div>
              <div>
                <dt>Authority</dt>
                <dd>{compactText(record.document.authority)}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{getCategoryLabel(record.document.type)}</dd>
              </div>
              <div>
                <dt>Issue date</dt>
                <dd>{formatDate(record.document.issueDate)}</dd>
              </div>
              <div>
                <dt>Expiry date</dt>
                <dd>{record.document.noExpiry ? "No Expiry" : formatDate(record.document.expiryDate)}</dd>
              </div>
              <div>
                <dt>Favourite</dt>
                <dd>{record.document.favourite ? "Yes" : "No"}</dd>
              </div>
            </dl>

            <section className="notes-grid" aria-label="Notes">
              <div>
                <h3>Notes</h3>
                <p>{compactText(record.document.notes, "No notes")}</p>
              </div>
              <div>
                <h3>Flag-state notes</h3>
                <p>{compactText(record.document.flagNotes, "No flag-state notes")}</p>
              </div>
            </section>

            <section className="attachment-section" aria-label="Attachments">
              <h3>Attachments</h3>
              {record.document.files.length === 0 ? (
                <p className="muted">No attachments are readable for this record.</p>
              ) : (
                record.document.files.map((file, index) => (
                  <div className="attachment-preview" key={`${file.name}-${index}`}>
                    <strong>{describeFile(file, index)}</strong>
                    {isImageFile(file) ? <img src={file.data} alt={file.name || `Attachment ${index + 1}`} /> : null}
                    {isPdfFile(file) ? (
                      <object data={file.data} type="application/pdf" aria-label={file.name}>
                        <p>PDF preview is not available in this browser. The attachment is still listed above.</p>
                      </object>
                    ) : null}
                    {!isImageFile(file) && !isPdfFile(file) ? (
                      <p className="muted">Preview is not available for this attachment type.</p>
                    ) : null}
                  </div>
                ))
              )}
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
