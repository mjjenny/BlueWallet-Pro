import { Badge } from "../../components/Badge";
import { formatDate } from "../../shared/dates/dateUtils";
import { pluralize } from "../../shared/formatting/text";
import { getCategoryLabel } from "./documentCategories";
import type { WalletRecord } from "./documentModel";

interface DocumentCardProps {
  record: WalletRecord;
  onOpen: (record: WalletRecord) => void;
}

function statusTone(key: string): "good" | "warn" | "bad" | "neutral" {
  if (key === "valid") return "good";
  if (key === "expiring") return "warn";
  if (key === "expired") return "bad";
  return "neutral";
}

export function DocumentCard({ record, onOpen }: DocumentCardProps) {
  if (record.kind === "encrypted") {
    return (
      <article className="document-card encrypted-card">
        <div className="card-main">
          <p className="eyebrow">Encrypted record</p>
          <h3>Locked legacy document</h3>
          <p className="muted">Record id: {record.id}</p>
        </div>
        <Badge tone="warn">Encrypted/unavailable</Badge>
        <button type="button" className="secondary-action" onClick={() => onOpen(record)}>
          View details
        </button>
      </article>
    );
  }

  const doc = record.document;
  return (
    <article className="document-card">
      <div className="card-main">
        <div className="document-card-head">
          <h3>{doc.title}</h3>
          {doc.favourite ? <Badge tone="info">Favourite</Badge> : null}
        </div>
        <p className="muted">
          {doc.number || "No number"} · {doc.authority || "No authority"}
        </p>
        <dl className="card-facts">
          <div>
            <dt>Category</dt>
            <dd>{getCategoryLabel(doc.type)}</dd>
          </div>
          <div>
            <dt>Expiry</dt>
            <dd>{doc.noExpiry ? "No Expiry" : formatDate(doc.expiryDate)}</dd>
          </div>
          <div>
            <dt>Attachments</dt>
            <dd>{pluralize(doc.files.length, "file")}</dd>
          </div>
        </dl>
        {doc.tags.length > 0 ? (
          <div className="tag-row" aria-label="Tags">
            {doc.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
      </div>
      <Badge tone={statusTone(record.validity.key)}>{record.validity.label}</Badge>
      <button type="button" className="secondary-action" onClick={() => onOpen(record)}>
        View details
      </button>
    </article>
  );
}
