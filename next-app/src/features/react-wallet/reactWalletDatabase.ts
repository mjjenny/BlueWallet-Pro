import {
  REACT_WALLET_DATABASE_NAME,
  REACT_WALLET_DATABASE_VERSION,
  REACT_WALLET_STORES,
  type ReactWalletAttachment,
  type ReactWalletBackup,
  type ReactWalletDocument,
  type ReactWalletDocumentInput,
  type ReactWalletDocumentView,
  type ReactWalletProfile,
  type ReactWalletSettings,
} from "./reactWalletTypes";
import { sanitizeDocumentInput, validateDocumentInput } from "./reactWalletValidation";

function uid(prefix: string): string {
  if (globalThis.crypto?.randomUUID) return `${prefix}_${globalThis.crypto.randomUUID()}`;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function openReactWalletDB(factory: IDBFactory = globalThis.indexedDB): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = factory.open(REACT_WALLET_DATABASE_NAME, REACT_WALLET_DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(REACT_WALLET_STORES.documents)) {
        db.createObjectStore(REACT_WALLET_STORES.documents, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(REACT_WALLET_STORES.profile)) {
        db.createObjectStore(REACT_WALLET_STORES.profile, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(REACT_WALLET_STORES.settings)) {
        db.createObjectStore(REACT_WALLET_STORES.settings, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(REACT_WALLET_STORES.attachments)) {
        db.createObjectStore(REACT_WALLET_STORES.attachments, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function allFromStore<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  const tx = db.transaction(storeName, "readonly");
  return requestToPromise<T[]>(tx.objectStore(storeName).getAll());
}

async function getDocument(db: IDBDatabase, id: string): Promise<ReactWalletDocument> {
  const tx = db.transaction(REACT_WALLET_STORES.documents, "readonly");
  const current = await requestToPromise<ReactWalletDocument | undefined>(tx.objectStore(REACT_WALLET_STORES.documents).get(id));
  if (!current) throw new Error("Document not found.");
  return current;
}

export async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function filesToAttachments(files: File[], documentId: string): Promise<ReactWalletAttachment[]> {
  const now = new Date().toISOString();
  return Promise.all(
    files.map(async (file) => ({
      id: uid("att"),
      documentId,
      name: file.name || "attachment",
      type: file.type || "application/octet-stream",
      size: file.size,
      data: await readFileAsDataUrl(file),
      createdAt: now,
    })),
  );
}

export async function listReactWalletDocuments(db: IDBDatabase): Promise<ReactWalletDocumentView[]> {
  const [documents, attachments] = await Promise.all([
    allFromStore<ReactWalletDocument>(db, REACT_WALLET_STORES.documents),
    allFromStore<ReactWalletAttachment>(db, REACT_WALLET_STORES.attachments),
  ]);
  return documents.map((document) => ({
    ...document,
    attachments: attachments.filter((attachment) => document.attachmentIds.includes(attachment.id)),
  }));
}

export async function createReactWalletDocument(
  db: IDBDatabase,
  input: ReactWalletDocumentInput,
  files: File[] = [],
): Promise<ReactWalletDocumentView> {
  const validation = validateDocumentInput(input);
  if (!validation.ok) throw new Error(validation.errors.join(" "));
  const clean = sanitizeDocumentInput(input);
  const id = uid("doc");
  const now = new Date().toISOString();
  const attachments = await filesToAttachments(files, id);
  const document: ReactWalletDocument = {
    id,
    type: clean.type,
    title: clean.title,
    number: clean.number ?? "",
    authority: clean.authority ?? "",
    issueDate: clean.issueDate ?? null,
    expiryDate: clean.expiryDate ?? null,
    noExpiry: !!clean.noExpiry,
    notes: clean.notes ?? "",
    flagNotes: clean.flagNotes ?? "",
    tags: Array.isArray(clean.tags) ? clean.tags : [],
    favourite: !!clean.favourite,
    attachmentIds: attachments.map((attachment) => attachment.id),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  const tx = db.transaction([REACT_WALLET_STORES.documents, REACT_WALLET_STORES.attachments], "readwrite");
  tx.objectStore(REACT_WALLET_STORES.documents).put(document);
  attachments.forEach((attachment) => tx.objectStore(REACT_WALLET_STORES.attachments).put(attachment));
  await txDone(tx);
  return { ...document, attachments };
}

export async function updateReactWalletDocument(
  db: IDBDatabase,
  id: string,
  input: ReactWalletDocumentInput,
  files: File[] = [],
): Promise<ReactWalletDocumentView> {
  const validation = validateDocumentInput(input);
  if (!validation.ok) throw new Error(validation.errors.join(" "));
  const clean = sanitizeDocumentInput(input);
  const current = await getDocument(db, id);
  const attachments = files.length ? await filesToAttachments(files, id) : [];
  const updated: ReactWalletDocument = {
    ...current,
    type: clean.type,
    title: clean.title,
    number: clean.number ?? "",
    authority: clean.authority ?? "",
    issueDate: clean.issueDate ?? null,
    expiryDate: clean.expiryDate ?? null,
    noExpiry: !!clean.noExpiry,
    notes: clean.notes ?? "",
    flagNotes: clean.flagNotes ?? "",
    tags: Array.isArray(clean.tags) ? clean.tags : [],
    favourite: !!clean.favourite,
    attachmentIds: [...current.attachmentIds, ...attachments.map((attachment) => attachment.id)],
    updatedAt: new Date().toISOString(),
  };
  const tx = db.transaction([REACT_WALLET_STORES.documents, REACT_WALLET_STORES.attachments], "readwrite");
  tx.objectStore(REACT_WALLET_STORES.documents).put(updated);
  attachments.forEach((attachment) => tx.objectStore(REACT_WALLET_STORES.attachments).put(attachment));
  await txDone(tx);
  const allAttachments = await allFromStore<ReactWalletAttachment>(db, REACT_WALLET_STORES.attachments);
  return { ...updated, attachments: allAttachments.filter((attachment) => updated.attachmentIds.includes(attachment.id)) };
}

export async function softDeleteReactWalletDocument(db: IDBDatabase, id: string): Promise<void> {
  const current = await getDocument(db, id);
  const tx = db.transaction(REACT_WALLET_STORES.documents, "readwrite");
  tx.objectStore(REACT_WALLET_STORES.documents).put({ ...current, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  await txDone(tx);
}

export async function undoDeleteReactWalletDocument(db: IDBDatabase, id: string): Promise<void> {
  const current = await getDocument(db, id);
  const tx = db.transaction(REACT_WALLET_STORES.documents, "readwrite");
  tx.objectStore(REACT_WALLET_STORES.documents).put({ ...current, deletedAt: null, updatedAt: new Date().toISOString() });
  await txDone(tx);
}

export async function exportReactWalletBackup(db: IDBDatabase): Promise<ReactWalletBackup> {
  const [documents, attachments, profiles, settings] = await Promise.all([
    allFromStore<ReactWalletDocument>(db, REACT_WALLET_STORES.documents),
    allFromStore<ReactWalletAttachment>(db, REACT_WALLET_STORES.attachments),
    allFromStore<ReactWalletProfile>(db, REACT_WALLET_STORES.profile),
    allFromStore<ReactWalletSettings>(db, REACT_WALLET_STORES.settings),
  ]);
  return {
    app: "BlueWallet-Pro React",
    version: 1,
    exportedAt: new Date().toISOString(),
    documents,
    attachments,
    profile: profiles[0] ?? null,
    settings: settings[0] ?? null,
  };
}

export async function importReactWalletBackup(db: IDBDatabase, backup: ReactWalletBackup): Promise<void> {
  if (backup.app !== "BlueWallet-Pro React" || backup.version !== 1) {
    throw new Error("Unsupported React wallet backup.");
  }
  const tx = db.transaction(
    [REACT_WALLET_STORES.documents, REACT_WALLET_STORES.attachments, REACT_WALLET_STORES.profile, REACT_WALLET_STORES.settings],
    "readwrite",
  );
  for (const document of backup.documents) tx.objectStore(REACT_WALLET_STORES.documents).put(document);
  for (const attachment of backup.attachments) tx.objectStore(REACT_WALLET_STORES.attachments).put(attachment);
  if (backup.profile) tx.objectStore(REACT_WALLET_STORES.profile).put(backup.profile);
  if (backup.settings) tx.objectStore(REACT_WALLET_STORES.settings).put(backup.settings);
  await txDone(tx);
}

export async function saveReactWalletSetting(db: IDBDatabase, setting: ReactWalletSettings): Promise<void> {
  const tx = db.transaction(REACT_WALLET_STORES.settings, "readwrite");
  tx.objectStore(REACT_WALLET_STORES.settings).put(setting);
  await txDone(tx);
}

export function downloadBackup(backup: ReactWalletBackup): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `blue-wallet-react-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
