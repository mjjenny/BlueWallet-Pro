import { useEffect, useMemo, useState } from "react";
import { Badge } from "../../components/Badge";
import { CategoryNav } from "../documents/CategoryNav";
import { getCategoryLabel } from "../documents/documentCategories";
import type { LegacyDocumentType } from "../../legacy/legacyTypes";
import { formatDate } from "../../shared/dates/dateUtils";
import { getDocumentValidity } from "../../shared/status/documentStatus";
import { describeFile, isImageFile, isPdfFile } from "../../shared/files/fileUtils";
import type { LegacyWalletSnapshot } from "../../app/providers/LegacyDataProvider";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { useReactWallet } from "./ReactWalletProvider";
import {
  getReactCategoryCounts,
  getReactWalletCounts,
  selectReactWalletDocuments,
} from "./reactWalletSelectors";
import type {
  ReactWalletBackup,
  ReactWalletDocumentInput,
  ReactWalletDocumentView,
  ReactWalletSortKey,
  ReactWalletStatusFilter,
} from "./reactWalletTypes";
import { validateDocumentInput } from "./reactWalletValidation";

const blankInput: ReactWalletDocumentInput = {
  type: "passport",
  title: "",
  number: "",
  authority: "",
  issueDate: "",
  expiryDate: "",
  noExpiry: false,
  notes: "",
  flagNotes: "",
  tags: [],
  favourite: false,
};

function toInput(document: ReactWalletDocumentView): ReactWalletDocumentInput {
  return {
    type: document.type,
    title: document.title,
    number: document.number,
    authority: document.authority,
    issueDate: document.issueDate ?? "",
    expiryDate: document.expiryDate ?? "",
    noExpiry: document.noExpiry,
    notes: document.notes,
    flagNotes: document.flagNotes,
    tags: document.tags.join(", "),
    favourite: document.favourite,
  };
}

function statusTone(key: string): "good" | "warn" | "bad" | "neutral" {
  if (key === "valid") return "good";
  if (key === "expiring") return "warn";
  if (key === "expired") return "bad";
  return "neutral";
}

function DocumentForm({
  editing,
  initialType,
  onCancel,
  onSubmit,
}: {
  editing: ReactWalletDocumentView | null;
  initialType: LegacyDocumentType;
  onCancel: () => void;
  onSubmit: (input: ReactWalletDocumentInput, files: File[]) => Promise<void>;
}) {
  const [input, setInput] = useState<ReactWalletDocumentInput>(() =>
    editing ? toInput(editing) : { ...blankInput, type: initialType },
  );
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<string>("Draft auto-save waiting");
  const validation = validateDocumentInput(input);

  useEffect(() => {
    const timer = window.setTimeout(() => setLastAutoSave(`Draft auto-saved ${new Date().toLocaleTimeString()}`), 450);
    return () => window.clearTimeout(timer);
  }, [input, files]);

  return (
    <div className="modal-backdrop" role="presentation">
      <form
        className="details-modal form-modal"
        aria-label={editing ? "Edit document" : "Create document"}
        onSubmit={async (event) => {
          event.preventDefault();
          if (!validation.ok) return;
          setSaving(true);
          await onSubmit(input, files);
          setSaving(false);
        }}
      >
        <div className="details-head">
          <div>
            <p className="eyebrow">{lastAutoSave}</p>
            <h2>{editing ? "Edit document" : "Create document"}</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Close form" onClick={onCancel}>
            x
          </button>
        </div>
        <div className="details-body form-grid">
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
            <input
              type="date"
              value={input.expiryDate ?? ""}
              disabled={!!input.noExpiry}
              onChange={(event) => setInput({ ...input, expiryDate: event.target.value })}
            />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={!!input.noExpiry}
              onChange={(event) => setInput({ ...input, noExpiry: event.target.checked, expiryDate: event.target.checked ? "" : input.expiryDate })}
            />
            <span>No Expiry</span>
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={!!input.favourite} onChange={(event) => setInput({ ...input, favourite: event.target.checked })} />
            <span>Favourite</span>
          </label>
          <label className="wide-field">
            <span>Tags</span>
            <input value={Array.isArray(input.tags) ? input.tags.join(", ") : input.tags ?? ""} onChange={(event) => setInput({ ...input, tags: event.target.value })} />
          </label>
          <label className="wide-field">
            <span>Notes</span>
            <textarea value={input.notes ?? ""} onChange={(event) => setInput({ ...input, notes: event.target.value })} />
          </label>
          <label className="wide-field">
            <span>Flag-state notes</span>
            <textarea value={input.flagNotes ?? ""} onChange={(event) => setInput({ ...input, flagNotes: event.target.value })} />
          </label>
          <label className="wide-field">
            <span>Images or PDFs</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
          </label>
          {files.length > 0 ? <p className="muted wide-field">{files.length} new attachment(s) selected.</p> : null}
          {!validation.ok ? (
            <ul className="validation-list wide-field">
              {validation.errors.map((error) => <li key={error}>{error}</li>)}
            </ul>
          ) : null}
          <div className="form-actions wide-field">
            <button type="button" className="secondary-action" onClick={onCancel}>Cancel</button>
            <button type="submit" className="primary-action" disabled={!validation.ok || saving}>
              {saving ? "Saving..." : editing ? "Save changes" : "Create document"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function DocumentDetails({
  document,
  onClose,
  onEdit,
  onDelete,
  onUndo,
}: {
  document: ReactWalletDocumentView | null;
  onClose: () => void;
  onEdit: (document: ReactWalletDocumentView) => void;
  onDelete: (id: string) => void;
  onUndo: () => void;
}) {
  if (!document) return null;
  const validity = getDocumentValidity(document);
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="details-modal" role="dialog" aria-modal="true" aria-labelledby="react-details-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="details-head">
          <div>
            <p className="eyebrow">{getCategoryLabel(document.type)}</p>
            <h2 id="react-details-title">{document.title}</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Close details" onClick={onClose}>x</button>
        </div>
        <div className="details-body">
          <div className="detail-status-row">
            <Badge tone={statusTone(validity.key)}>{validity.label}</Badge>
            {document.favourite ? <Badge tone="info">Favourite</Badge> : null}
            {document.deletedAt ? <Badge tone="bad">Deleted</Badge> : null}
          </div>
          <dl className="detail-grid">
            <div><dt>Number</dt><dd>{document.number || "Not set"}</dd></div>
            <div><dt>Authority</dt><dd>{document.authority || "Not set"}</dd></div>
            <div><dt>Issue date</dt><dd>{formatDate(document.issueDate)}</dd></div>
            <div><dt>Expiry</dt><dd>{document.noExpiry ? "No Expiry" : formatDate(document.expiryDate)}</dd></div>
            <div><dt>Updated</dt><dd>{formatDate(document.updatedAt)}</dd></div>
            <div><dt>Attachments</dt><dd>{document.attachments.length}</dd></div>
          </dl>
          <section className="notes-grid">
            <div><h3>Notes</h3><p>{document.notes || "No notes"}</p></div>
            <div><h3>Flag-state notes</h3><p>{document.flagNotes || "No flag-state notes"}</p></div>
          </section>
          <section className="attachment-section">
            <h3>Attachments</h3>
            {document.attachments.length === 0 ? <p className="muted">No attachments.</p> : document.attachments.map((attachment, index) => (
              <div className="attachment-preview" key={attachment.id}>
                <strong>{describeFile(attachment, index)}</strong>
                {isImageFile(attachment) ? <img src={attachment.data} alt={attachment.name} /> : null}
                {isPdfFile(attachment) ? <object data={attachment.data} type="application/pdf" aria-label={attachment.name}><p>PDF preview is not available in this browser.</p></object> : null}
              </div>
            ))}
          </section>
          <div className="form-actions">
            {document.deletedAt ? (
              <button type="button" className="primary-action" onClick={onUndo}>Undo delete</button>
            ) : (
              <>
                <button type="button" className="secondary-action" onClick={() => onEdit(document)}>Edit</button>
                <button type="button" className="danger-action" onClick={() => onDelete(document.id)}>Delete</button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function MigrationWizard({ snapshot }: { snapshot: LegacyWalletSnapshot }) {
  const readable = snapshot.records.filter((record) => record.kind === "readable").length;
  const encrypted = snapshot.records.filter((record) => record.kind === "encrypted").length;
  const estimated = readable + encrypted + snapshot.malformed.length;
  return (
    <section className="migration-status wizard-panel" aria-labelledby="wizard-title">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Migration Wizard</p>
          <h2 id="wizard-title">Legacy wallet assessment</h2>
        </div>
        <Badge tone="warn">No migration action</Badge>
      </div>
      <p className="readonly-callout">
        This wizard detects and explains legacy data only. It never writes to `SeafarerWalletDB`
        and never imports legacy records into the React database.
      </p>
      <dl className="status-list">
        <div><dt>Legacy database</dt><dd>{snapshot.database.status}</dd></div>
        <div><dt>Readable legacy records</dt><dd>{readable}</dd></div>
        <div><dt>Encrypted legacy records</dt><dd>{encrypted}</dd></div>
        <div><dt>Malformed legacy records</dt><dd>{snapshot.malformed.length}</dd></div>
        <div><dt>Estimated records to review</dt><dd>{estimated}</dd></div>
      </dl>
      <div className="warning-list">
        <h3>Risks before any future migration</h3>
        <ul>
          <li>Encrypted legacy records need a PIN/key phase before they can be read.</li>
          <li>Malformed rows need explicit user review before repair or import.</li>
          <li>React CRUD uses `BlueWalletReactDB`; no automatic migration is performed.</li>
        </ul>
      </div>
    </section>
  );
}

export function ReactWalletShell({ legacySnapshot }: { legacySnapshot: LegacyWalletSnapshot }) {
  const wallet = useReactWallet();
  const online = useOnlineStatus();
  const [category, setCategory] = useState<LegacyDocumentType>("passport");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ReactWalletStatusFilter>("all");
  const [sort, setSort] = useState<ReactWalletSortKey>("expiry");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ReactWalletDocumentView | null>(null);
  const [viewing, setViewing] = useState<ReactWalletDocumentView | null>(null);
  const [message, setMessage] = useState("");
  const counts = getReactWalletCounts(wallet.documents);
  const categoryCounts = getReactCategoryCounts(wallet.documents);
  const visible = useMemo(
    () => selectReactWalletDocuments(wallet.documents, { category, search, filter, sort }),
    [wallet.documents, category, filter, search, sort],
  );

  async function handleImport(file: File | undefined) {
    if (!file) return;
    const backup = JSON.parse(await file.text()) as ReactWalletBackup;
    await wallet.importBackup(backup);
    setMessage("Backup restored into BlueWalletReactDB.");
  }

  return (
    <main className="wallet-app">
      <header className="app-header">
        <div>
          <p className="eyebrow">BlueWallet-Pro React</p>
          <h1>The Blue Wallet</h1>
        </div>
        <div className="status-cluster">
          <Badge tone={online ? "good" : "warn"}>{online ? "Online" : "Offline"}</Badge>
          <Badge tone="info">BlueWalletReactDB v1</Badge>
        </div>
      </header>

      {wallet.status === "error" ? <section className="error-panel">{wallet.error}</section> : null}
      {wallet.status === "loading" ? <section className="loading-panel">Opening BlueWalletReactDB...</section> : null}
      {message ? <section className="loading-panel" aria-live="polite">{message}</section> : null}
      {wallet.lastDeletedId ? (
        <section className="undo-bar" aria-live="polite">
          Document moved to deleted items.
          <button type="button" className="secondary-action" onClick={() => void wallet.undoDelete()}>Undo delete</button>
        </section>
      ) : null}

      <section className="dashboard">
        <div className="section-title-row">
          <div><p className="eyebrow">React wallet</p><h2>Document dashboard</h2></div>
          <button type="button" className="primary-action" onClick={() => { setEditing(null); setShowForm(true); }}>Create document</button>
        </div>
        <div className="metric-grid">
          {[
            ["Active", counts.active],
            ["Valid", counts.valid],
            ["Expiring", counts.expiring],
            ["Expired", counts.expired],
            ["No expiry", counts.noExpiry],
            ["Deleted", counts.deleted],
          ].map(([label, value]) => (
            <div className="metric" key={label}><span>{label}</span><strong>{value}</strong></div>
          ))}
        </div>
      </section>

      <section className="workspace-grid">
        <div className="document-workspace">
          <CategoryNav selected={category} counts={categoryCounts} onSelect={setCategory} />
          <div className="document-toolbar">
            <label className="search-field"><span>Search</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
            <label><span>Status</span><select value={filter} onChange={(event) => setFilter(event.target.value as ReactWalletStatusFilter)}>
              <option value="all">All</option><option value="valid">Valid</option><option value="expiring">Expiring</option><option value="expired">Expired</option><option value="no-expiry">No expiry</option><option value="favourites">Favourites</option><option value="deleted">Deleted</option>
            </select></label>
            <label><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as ReactWalletSortKey)}>
              <option value="expiry">Expiry</option><option value="name">Name</option><option value="category">Category</option><option value="updated">Recently updated</option>
            </select></label>
          </div>
          <div className="form-actions toolbar-actions">
            <button type="button" className="secondary-action" onClick={() => void wallet.downloadBackupFile()}>Export backup</button>
            <label className="secondary-action import-button">
              Restore backup
              <input type="file" accept=".json,application/json" onChange={(event) => void handleImport(event.target.files?.[0])} />
            </label>
          </div>
          <div className="section-title-row documents-heading">
            <div><p className="eyebrow">Selected list</p><h2>{filter === "deleted" ? "Deleted items" : getCategoryLabel(category)}</h2></div>
            <span className="result-count">{visible.length} shown</span>
          </div>
          {visible.length === 0 ? (
            <section className="empty-state"><strong>No documents found</strong><p>Create a document or adjust filters.</p></section>
          ) : (
            <section className="document-list">
              {visible.map((document) => {
                const validity = getDocumentValidity(document);
                const thumbnail = document.attachments.find(isImageFile);
                return (
                  <article className="document-card" key={document.id}>
                    {thumbnail ? <img className="doc-thumb" src={thumbnail.data} alt="" /> : <div className="doc-thumb placeholder">{document.attachments.length ? "PDF" : "DOC"}</div>}
                    <div className="card-main">
                      <div className="document-card-head">
                        <h3>{document.title}</h3>
                        {document.favourite ? <Badge tone="info">Favourite</Badge> : null}
                      </div>
                      <p className="muted">{document.number || "No number"} - {document.authority || "No authority"}</p>
                      <dl className="card-facts">
                        <div><dt>Category</dt><dd>{getCategoryLabel(document.type)}</dd></div>
                        <div><dt>Expiry</dt><dd>{document.noExpiry ? "No Expiry" : formatDate(document.expiryDate)}</dd></div>
                        <div><dt>Attachments</dt><dd>{document.attachments.length}</dd></div>
                      </dl>
                      {document.tags.length ? <div className="tag-row">{document.tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
                    </div>
                    <Badge tone={statusTone(validity.key)}>{validity.label}</Badge>
                    <button type="button" className="secondary-action" onClick={() => setViewing(document)}>View</button>
                  </article>
                );
              })}
            </section>
          )}
        </div>
        <MigrationWizard snapshot={legacySnapshot} />
      </section>

      {showForm ? (
        <DocumentForm
          editing={editing}
          initialType={category}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          onSubmit={async (input, files) => {
            if (editing) await wallet.updateDocument(editing.id, input, files);
            else await wallet.createDocument(input, files);
            setShowForm(false);
            setEditing(null);
          }}
        />
      ) : null}

      <DocumentDetails
        document={viewing}
        onClose={() => setViewing(null)}
        onEdit={(document) => { setViewing(null); setEditing(document); setShowForm(true); }}
        onDelete={(id) => { void wallet.deleteDocument(id); setViewing(null); }}
        onUndo={() => void wallet.undoDelete()}
      />
    </main>
  );
}
