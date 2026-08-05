import type { WalletRecord } from "./documentModel";
import { DocumentCard } from "./DocumentCard";

interface DocumentListProps {
  records: WalletRecord[];
  emptyMessage: string;
  onOpen: (record: WalletRecord) => void;
}

export function DocumentList({ records, emptyMessage, onOpen }: DocumentListProps) {
  if (records.length === 0) {
    return (
      <section className="empty-state" aria-live="polite">
        <strong>No documents found</strong>
        <p>{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="document-list" aria-label="Read-only documents">
      {records.map((record) => (
        <DocumentCard
          key={record.kind === "readable" ? record.document.id : record.id}
          record={record}
          onOpen={onOpen}
        />
      ))}
    </section>
  );
}
