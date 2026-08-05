import { useMemo, useState } from "react";
import { Dashboard } from "../features/dashboard/Dashboard";
import { CategoryNav } from "../features/documents/CategoryNav";
import { DocumentDetails } from "../features/documents/DocumentDetails";
import { DocumentList } from "../features/documents/DocumentList";
import { DocumentToolbar } from "../features/documents/DocumentToolbar";
import {
  getCategoryCounts,
  selectDocuments,
  type DocumentSortKey,
  type DocumentStatusFilter,
} from "../features/documents/documentSelectors";
import type { WalletRecord } from "../features/documents/documentModel";
import { DOCUMENT_CATEGORIES, getCategoryLabel } from "../features/documents/documentCategories";
import { MigrationStatus } from "../features/migration-status/MigrationStatus";
import { ProfileSummary } from "../features/profile/ProfileSummary";
import type { LegacyDocumentType } from "../legacy/legacyTypes";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import type { LegacyWalletSnapshot } from "./providers/LegacyDataProvider";

interface WalletShellProps {
  snapshot: LegacyWalletSnapshot;
}

export function WalletShell({ snapshot }: WalletShellProps) {
  const online = useOnlineStatus();
  const [category, setCategory] = useState<LegacyDocumentType>("passport");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DocumentStatusFilter>("all");
  const [sort, setSort] = useState<DocumentSortKey>("expiry");
  const [detailsRecord, setDetailsRecord] = useState<WalletRecord | null>(null);

  const categoryCounts = useMemo(() => getCategoryCounts(snapshot.records), [snapshot.records]);
  const visibleRecords = useMemo(
    () => selectDocuments(snapshot.records, { category, search, filter, sort }),
    [snapshot.records, category, search, filter, sort],
  );
  const categoryName = getCategoryLabel(category);
  const emptyMessage =
    filter === "encrypted"
      ? "No encrypted or unavailable records were found."
      : `No ${categoryName.toLowerCase()} documents match the current read-only filters.`;

  return (
    <main className="wallet-app">
      <header className="app-header">
        <div>
          <p className="eyebrow">BlueWallet-Pro React Migration</p>
          <h1>The Blue Wallet</h1>
        </div>
        <div className="header-note">Read-only legacy viewer</div>
      </header>

      {snapshot.status === "loading" ? (
        <section className="loading-panel" aria-live="polite">
          Loading legacy wallet data...
        </section>
      ) : null}

      {snapshot.status === "error" ? (
        <section className="error-panel" role="alert">
          Legacy data could not be loaded. The production root PWA is unchanged.
        </section>
      ) : null}

      <ProfileSummary settings={snapshot.settings} profilePhotoKind={snapshot.profilePhoto.kind} />

      <Dashboard
        records={snapshot.records}
        malformedCount={snapshot.malformed.length}
        selectedCategory={category}
        online={online}
        compatibilityStatus={snapshot.status}
      />

      <section className="workspace-grid">
        <div className="document-workspace">
          <CategoryNav selected={category} counts={categoryCounts} onSelect={setCategory} />
          <DocumentToolbar
            search={search}
            filter={filter}
            sort={sort}
            onSearch={setSearch}
            onFilter={setFilter}
            onSort={setSort}
          />
          <div className="section-title-row documents-heading">
            <div>
              <p className="eyebrow">Selected category</p>
              <h2>{filter === "encrypted" ? "Encrypted/unavailable" : categoryName}</h2>
            </div>
            <span className="result-count">{visibleRecords.length} shown</span>
          </div>
          <DocumentList records={visibleRecords} emptyMessage={emptyMessage} onOpen={setDetailsRecord} />
        </div>

        <MigrationStatus snapshot={snapshot} />
      </section>

      <footer className="app-footer">
        Categories available: {DOCUMENT_CATEGORIES.map((item) => item.label).join(", ")}
      </footer>

      <DocumentDetails record={detailsRecord} onClose={() => setDetailsRecord(null)} />
    </main>
  );
}
