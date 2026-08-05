import {
  createSalt,
  derivePinKey,
  encryptJson,
  generateVaultDataKey,
  unwrapVaultDataKey,
  validatePin,
  wrapVaultDataKey,
} from "./reactWalletCrypto";
import {
  REACT_WALLET_DATABASE_NAME,
  REACT_WALLET_DATABASE_VERSION,
  REACT_WALLET_STORES,
  type ReactWalletAttachment,
  type ReactWalletBackup,
  type ReactWalletDocument,
  type ReactWalletDocumentInput,
  type ReactWalletDocumentView,
  type ReactWalletEncryptedBackupStores,
  type ReactWalletEncryptedRow,
  type ReactWalletEncryptedRowKind,
  type ReactWalletProfile,
  type ReactWalletSeaServiceEntry,
  type ReactWalletSecurityState,
  type ReactWalletSession,
  type ReactWalletSettings,
  type ReactWalletVaultRecord,
} from "./reactWalletTypes";
import { decryptJson } from "./reactWalletCrypto";
import { sanitizeDocumentInput, validateDocumentInput } from "./reactWalletValidation";

const SESSION_MS = 5 * 60 * 1000;

function uid(prefix: string): string {
  if (globalThis.crypto?.randomUUID) return `${prefix}_${globalThis.crypto.randomUUID()}`;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

function nowIso(): string {
  return new Date().toISOString();
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
      if (!db.objectStoreNames.contains(REACT_WALLET_STORES.security)) {
        db.createObjectStore(REACT_WALLET_STORES.security, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(REACT_WALLET_STORES.seaService)) {
        db.createObjectStore(REACT_WALLET_STORES.seaService, { keyPath: "id" });
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

function clearWalletStores(tx: IDBTransaction): void {
  tx.objectStore(REACT_WALLET_STORES.documents).clear();
  tx.objectStore(REACT_WALLET_STORES.attachments).clear();
  tx.objectStore(REACT_WALLET_STORES.profile).clear();
  tx.objectStore(REACT_WALLET_STORES.settings).clear();
  tx.objectStore(REACT_WALLET_STORES.seaService).clear();
}

function isEncryptedRow(value: unknown): value is ReactWalletEncryptedRow {
  return !!value && typeof value === "object" && "envelope" in value && "envelopeVersion" in value;
}

function rowAad(kind: ReactWalletEncryptedRowKind, identity: string): string {
  return `BlueWalletReactDB:${kind}:${identity}:v1`;
}

async function encryptedRow<T>(
  dataKey: CryptoKey,
  kind: ReactWalletEncryptedRowKind,
  identity: string,
  value: T,
): Promise<ReactWalletEncryptedRow> {
  const row: ReactWalletEncryptedRow = {
    kind,
    envelopeVersion: 1,
    envelope: await encryptJson(dataKey, value, rowAad(kind, identity)),
    updatedAt: nowIso(),
  };
  if (kind === "profile" || kind === "settings") row.key = identity;
  else row.id = identity;
  return row;
}

async function decryptRow<T>(dataKey: CryptoKey, row: ReactWalletEncryptedRow): Promise<T> {
  const identity = row.id ?? row.key;
  if (!identity) throw new Error("Encrypted row is missing its identity.");
  return decryptJson<T>(dataKey, row.envelope, rowAad(row.kind, identity));
}

async function getVaultRecord(db: IDBDatabase): Promise<ReactWalletVaultRecord | null> {
  const tx = db.transaction(REACT_WALLET_STORES.security, "readonly");
  const record = await requestToPromise<ReactWalletVaultRecord | undefined>(
    tx.objectStore(REACT_WALLET_STORES.security).get("vault"),
  );
  return record ?? null;
}

async function makeVaultRecord(pin: string, dataKey: CryptoKey, existing?: ReactWalletVaultRecord): Promise<ReactWalletVaultRecord> {
  const salt = createSalt();
  const pinKey = await derivePinKey(pin, salt);
  const timestamp = nowIso();
  return {
    key: "vault",
    schemaVersion: 1,
    kdf: {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations: existing?.kdf.iterations ?? 310_000,
      salt,
    },
    wrappedDataKey: await wrapVaultDataKey(dataKey, pinKey),
    pinVerifier: await encryptJson(pinKey, { ok: true, createdAt: timestamp }, "pin-verifier"),
    rotationCounter: existing?.rotationCounter ?? 0,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

async function openSessionFromVault(record: ReactWalletVaultRecord, pin: string): Promise<ReactWalletSession> {
  const pinKey = await derivePinKey(pin, record.kdf.salt, record.kdf.iterations);
  await decryptJson(pinKey, record.pinVerifier, "pin-verifier");
  const dataKey = await unwrapVaultDataKey(record.wrappedDataKey, pinKey);
  const openedAt = Date.now();
  return {
    status: "unlocked",
    dataKey,
    unlockedAt: new Date(openedAt).toISOString(),
    expiresAt: new Date(openedAt + SESSION_MS).toISOString(),
    rotationCounter: record.rotationCounter,
  };
}

export async function getReactWalletSecurityState(db: IDBDatabase): Promise<ReactWalletSecurityState> {
  const record = await getVaultRecord(db);
  return {
    configured: !!record,
    webAuthnAvailable: await detectWebAuthnSupport(),
    rotationCounter: record?.rotationCounter ?? 0,
    lastUnlockedAt: null,
  };
}

export async function setupReactWalletVault(db: IDBDatabase, pin: string): Promise<ReactWalletSession> {
  if (!validatePin(pin)) throw new Error("PIN must be 4 to 8 digits.");
  if (await getVaultRecord(db)) throw new Error("React vault already has a PIN.");

  const dataKey = await generateVaultDataKey();
  const [documents, attachments, profiles, settings, seaService] = await Promise.all([
    allFromStore<unknown>(db, REACT_WALLET_STORES.documents),
    allFromStore<unknown>(db, REACT_WALLET_STORES.attachments),
    allFromStore<unknown>(db, REACT_WALLET_STORES.profile),
    allFromStore<unknown>(db, REACT_WALLET_STORES.settings),
    allFromStore<unknown>(db, REACT_WALLET_STORES.seaService),
  ]);
  const encryptedDocuments = await Promise.all(
    documents.filter((row) => !isEncryptedRow(row)).map((row) => encryptedRow(dataKey, "document", (row as ReactWalletDocument).id, row)),
  );
  const encryptedAttachments = await Promise.all(
    attachments.filter((row) => !isEncryptedRow(row)).map((row) => encryptedRow(dataKey, "attachment", (row as ReactWalletAttachment).id, row)),
  );
  const encryptedProfiles = await Promise.all(
    profiles.filter((row) => !isEncryptedRow(row)).map((row) => encryptedRow(dataKey, "profile", (row as ReactWalletProfile).key, row)),
  );
  const encryptedSettings = await Promise.all(
    settings.filter((row) => !isEncryptedRow(row)).map((row) => encryptedRow(dataKey, "settings", (row as ReactWalletSettings).key, row)),
  );
  const encryptedSeaService = await Promise.all(
    seaService.filter((row) => !isEncryptedRow(row)).map((row) => encryptedRow(dataKey, "seaService", (row as ReactWalletSeaServiceEntry).id, row)),
  );
  const vault = await makeVaultRecord(pin, dataKey);

  const tx = db.transaction(Object.values(REACT_WALLET_STORES), "readwrite");
  encryptedDocuments.forEach((row) => tx.objectStore(REACT_WALLET_STORES.documents).put(row));
  encryptedAttachments.forEach((row) => tx.objectStore(REACT_WALLET_STORES.attachments).put(row));
  encryptedProfiles.forEach((row) => tx.objectStore(REACT_WALLET_STORES.profile).put(row));
  encryptedSettings.forEach((row) => tx.objectStore(REACT_WALLET_STORES.settings).put(row));
  encryptedSeaService.forEach((row) => tx.objectStore(REACT_WALLET_STORES.seaService).put(row));
  tx.objectStore(REACT_WALLET_STORES.security).put(vault);
  await txDone(tx);
  return openSessionFromVault(vault, pin);
}

export async function unlockReactWalletVault(db: IDBDatabase, pin: string): Promise<ReactWalletSession> {
  const record = await getVaultRecord(db);
  if (!record) throw new Error("Set up a PIN before opening the React vault.");
  try {
    return await openSessionFromVault(record, pin);
  } catch {
    throw new Error("PIN could not unlock this vault.");
  }
}

export async function changeReactWalletPin(db: IDBDatabase, currentPin: string, newPin: string): Promise<ReactWalletSession> {
  if (!validatePin(newPin)) throw new Error("New PIN must be 4 to 8 digits.");
  const session = await unlockReactWalletVault(db, currentPin);
  const current = await getVaultRecord(db);
  if (!current) throw new Error("React vault is not configured.");
  const updated = await makeVaultRecord(newPin, session.dataKey, current);
  const tx = db.transaction(REACT_WALLET_STORES.security, "readwrite");
  tx.objectStore(REACT_WALLET_STORES.security).put(updated);
  await txDone(tx);
  return openSessionFromVault(updated, newPin);
}

export async function removeReactWalletPinAndVault(db: IDBDatabase, currentPin: string): Promise<void> {
  await unlockReactWalletVault(db, currentPin);
  const tx = db.transaction(Object.values(REACT_WALLET_STORES), "readwrite");
  clearWalletStores(tx);
  tx.objectStore(REACT_WALLET_STORES.security).clear();
  await txDone(tx);
}

export async function rotateReactWalletDataKey(
  db: IDBDatabase,
  session: ReactWalletSession,
  pin: string,
): Promise<ReactWalletSession> {
  await unlockReactWalletVault(db, pin);
  const current = await exportPlaintextSnapshot(db, session);
  const oldVault = await getVaultRecord(db);
  if (!oldVault) throw new Error("React vault is not configured.");
  const nextKey = await generateVaultDataKey();
  const [documents, attachments, profile, settings, seaService] = await encryptSnapshot(nextKey, current);
  const nextVault = await makeVaultRecord(pin, nextKey, {
    ...oldVault,
    rotationCounter: oldVault.rotationCounter + 1,
  });
  const tx = db.transaction(Object.values(REACT_WALLET_STORES), "readwrite");
  clearWalletStores(tx);
  documents.forEach((row) => tx.objectStore(REACT_WALLET_STORES.documents).put(row));
  attachments.forEach((row) => tx.objectStore(REACT_WALLET_STORES.attachments).put(row));
  profile.forEach((row) => tx.objectStore(REACT_WALLET_STORES.profile).put(row));
  settings.forEach((row) => tx.objectStore(REACT_WALLET_STORES.settings).put(row));
  seaService.forEach((row) => tx.objectStore(REACT_WALLET_STORES.seaService).put(row));
  tx.objectStore(REACT_WALLET_STORES.security).put(nextVault);
  await txDone(tx);
  return openSessionFromVault(nextVault, pin);
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
  const createdAt = nowIso();
  return Promise.all(
    files.map(async (file) => ({
      id: uid("att"),
      documentId,
      name: file.name || "attachment",
      type: file.type || "application/octet-stream",
      size: file.size,
      data: await readFileAsDataUrl(file),
      createdAt,
    })),
  );
}

async function getDocument(db: IDBDatabase, session: ReactWalletSession, id: string): Promise<ReactWalletDocument> {
  const tx = db.transaction(REACT_WALLET_STORES.documents, "readonly");
  const row = await requestToPromise<ReactWalletEncryptedRow | undefined>(tx.objectStore(REACT_WALLET_STORES.documents).get(id));
  if (!row || !isEncryptedRow(row)) throw new Error("Document not found.");
  return decryptRow<ReactWalletDocument>(session.dataKey, row);
}

export async function listReactWalletDocuments(db: IDBDatabase, session: ReactWalletSession): Promise<ReactWalletDocumentView[]> {
  const [documentRows, attachmentRows] = await Promise.all([
    allFromStore<ReactWalletEncryptedRow>(db, REACT_WALLET_STORES.documents),
    allFromStore<ReactWalletEncryptedRow>(db, REACT_WALLET_STORES.attachments),
  ]);
  const documents = await Promise.all(documentRows.filter(isEncryptedRow).map((row) => decryptRow<ReactWalletDocument>(session.dataKey, row)));
  const attachments = await Promise.all(attachmentRows.filter(isEncryptedRow).map((row) => decryptRow<ReactWalletAttachment>(session.dataKey, row)));
  return documents.map((document) => ({
    ...document,
    attachments: attachments.filter((attachment) => document.attachmentIds.includes(attachment.id)),
  }));
}

export async function createReactWalletDocument(
  db: IDBDatabase,
  session: ReactWalletSession,
  input: ReactWalletDocumentInput,
  files: File[] = [],
): Promise<ReactWalletDocumentView> {
  const validation = validateDocumentInput(input);
  if (!validation.ok) throw new Error(validation.errors.join(" "));
  const clean = sanitizeDocumentInput(input);
  const id = uid("doc");
  const timestamp = nowIso();
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
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  };
  const documentRow = await encryptedRow(session.dataKey, "document", id, document);
  const attachmentRows = await Promise.all(attachments.map((attachment) => encryptedRow(session.dataKey, "attachment", attachment.id, attachment)));
  const tx = db.transaction([REACT_WALLET_STORES.documents, REACT_WALLET_STORES.attachments], "readwrite");
  tx.objectStore(REACT_WALLET_STORES.documents).put(documentRow);
  attachmentRows.forEach((attachment) => tx.objectStore(REACT_WALLET_STORES.attachments).put(attachment));
  await txDone(tx);
  return { ...document, attachments };
}

export async function updateReactWalletDocument(
  db: IDBDatabase,
  session: ReactWalletSession,
  id: string,
  input: ReactWalletDocumentInput,
  files: File[] = [],
): Promise<ReactWalletDocumentView> {
  const validation = validateDocumentInput(input);
  if (!validation.ok) throw new Error(validation.errors.join(" "));
  const clean = sanitizeDocumentInput(input);
  const current = await getDocument(db, session, id);
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
    updatedAt: nowIso(),
  };
  const updatedRow = await encryptedRow(session.dataKey, "document", id, updated);
  const attachmentRows = await Promise.all(attachments.map((attachment) => encryptedRow(session.dataKey, "attachment", attachment.id, attachment)));
  const tx = db.transaction([REACT_WALLET_STORES.documents, REACT_WALLET_STORES.attachments], "readwrite");
  tx.objectStore(REACT_WALLET_STORES.documents).put(updatedRow);
  attachmentRows.forEach((attachment) => tx.objectStore(REACT_WALLET_STORES.attachments).put(attachment));
  await txDone(tx);
  const allAttachments = await allFromStore<ReactWalletEncryptedRow>(db, REACT_WALLET_STORES.attachments);
  const decryptedAttachments = await Promise.all(allAttachments.filter(isEncryptedRow).map((row) => decryptRow<ReactWalletAttachment>(session.dataKey, row)));
  return { ...updated, attachments: decryptedAttachments.filter((attachment) => updated.attachmentIds.includes(attachment.id)) };
}

export async function softDeleteReactWalletDocument(db: IDBDatabase, session: ReactWalletSession, id: string): Promise<void> {
  const current = await getDocument(db, session, id);
  const updated = { ...current, deletedAt: nowIso(), updatedAt: nowIso() };
  const updatedRow = await encryptedRow(session.dataKey, "document", id, updated);
  const tx = db.transaction(REACT_WALLET_STORES.documents, "readwrite");
  tx.objectStore(REACT_WALLET_STORES.documents).put(updatedRow);
  await txDone(tx);
}

export async function undoDeleteReactWalletDocument(db: IDBDatabase, session: ReactWalletSession, id: string): Promise<void> {
  const current = await getDocument(db, session, id);
  const updated = { ...current, deletedAt: null, updatedAt: nowIso() };
  const updatedRow = await encryptedRow(session.dataKey, "document", id, updated);
  const tx = db.transaction(REACT_WALLET_STORES.documents, "readwrite");
  tx.objectStore(REACT_WALLET_STORES.documents).put(updatedRow);
  await txDone(tx);
}

async function exportPlaintextSnapshot(db: IDBDatabase, session: ReactWalletSession) {
  const [documentRows, attachmentRows, profileRows, settingRows, seaServiceRows] = await Promise.all([
    allFromStore<ReactWalletEncryptedRow>(db, REACT_WALLET_STORES.documents),
    allFromStore<ReactWalletEncryptedRow>(db, REACT_WALLET_STORES.attachments),
    allFromStore<ReactWalletEncryptedRow>(db, REACT_WALLET_STORES.profile),
    allFromStore<ReactWalletEncryptedRow>(db, REACT_WALLET_STORES.settings),
    allFromStore<ReactWalletEncryptedRow>(db, REACT_WALLET_STORES.seaService),
  ]);
  return {
    documents: await Promise.all(documentRows.filter(isEncryptedRow).map((row) => decryptRow<ReactWalletDocument>(session.dataKey, row))),
    attachments: await Promise.all(attachmentRows.filter(isEncryptedRow).map((row) => decryptRow<ReactWalletAttachment>(session.dataKey, row))),
    profile: await Promise.all(profileRows.filter(isEncryptedRow).map((row) => decryptRow<ReactWalletProfile>(session.dataKey, row))),
    settings: await Promise.all(settingRows.filter(isEncryptedRow).map((row) => decryptRow<ReactWalletSettings>(session.dataKey, row))),
    seaService: await Promise.all(seaServiceRows.filter(isEncryptedRow).map((row) => decryptRow<ReactWalletSeaServiceEntry>(session.dataKey, row))),
  };
}

async function encryptSnapshot(dataKey: CryptoKey, snapshot: Awaited<ReturnType<typeof exportPlaintextSnapshot>>) {
  return Promise.all([
    Promise.all(snapshot.documents.map((document) => encryptedRow(dataKey, "document", document.id, document))),
    Promise.all(snapshot.attachments.map((attachment) => encryptedRow(dataKey, "attachment", attachment.id, attachment))),
    Promise.all(snapshot.profile.map((profile) => encryptedRow(dataKey, "profile", profile.key, profile))),
    Promise.all(snapshot.settings.map((settings) => encryptedRow(dataKey, "settings", settings.key, settings))),
    Promise.all(snapshot.seaService.map((entry) => encryptedRow(dataKey, "seaService", entry.id, entry))),
  ]);
}

export async function exportReactWalletBackup(db: IDBDatabase): Promise<ReactWalletBackup> {
  const security = await getVaultRecord(db);
  if (!security) throw new Error("Set up a PIN before exporting a secure backup.");
  const [documents, attachments, profile, settings, seaService] = await Promise.all([
    allFromStore<ReactWalletEncryptedRow>(db, REACT_WALLET_STORES.documents),
    allFromStore<ReactWalletEncryptedRow>(db, REACT_WALLET_STORES.attachments),
    allFromStore<ReactWalletEncryptedRow>(db, REACT_WALLET_STORES.profile),
    allFromStore<ReactWalletEncryptedRow>(db, REACT_WALLET_STORES.settings),
    allFromStore<ReactWalletEncryptedRow>(db, REACT_WALLET_STORES.seaService),
  ]);
  return {
    app: "BlueWallet-Pro React Secure",
    version: 3,
    exportedAt: nowIso(),
    security,
    encryptedStores: { documents, attachments, profile, settings, seaService },
  };
}

async function verifyBackupCanDecrypt(backup: ReactWalletBackup, pin: string): Promise<void> {
  if (backup.app !== "BlueWallet-Pro React Secure" || ![2, 3].includes(backup.version)) {
    throw new Error("Unsupported React secure backup.");
  }
  const session = await openSessionFromVault(backup.security, pin);
  const stores: ReactWalletEncryptedBackupStores = backup.encryptedStores;
  await Promise.all([
    ...stores.documents.map((row) => decryptRow<ReactWalletDocument>(session.dataKey, row)),
    ...stores.attachments.map((row) => decryptRow<ReactWalletAttachment>(session.dataKey, row)),
    ...stores.profile.map((row) => decryptRow<ReactWalletProfile>(session.dataKey, row)),
    ...stores.settings.map((row) => decryptRow<ReactWalletSettings>(session.dataKey, row)),
    ...(stores.seaService ?? []).map((row) => decryptRow<ReactWalletSeaServiceEntry>(session.dataKey, row)),
  ]);
}

export async function importReactWalletBackup(db: IDBDatabase, backup: ReactWalletBackup, pin: string): Promise<ReactWalletSession> {
  await verifyBackupCanDecrypt(backup, pin);
  const tx = db.transaction(Object.values(REACT_WALLET_STORES), "readwrite");
  clearWalletStores(tx);
  tx.objectStore(REACT_WALLET_STORES.security).clear();
  backup.encryptedStores.documents.forEach((row) => tx.objectStore(REACT_WALLET_STORES.documents).put(row));
  backup.encryptedStores.attachments.forEach((row) => tx.objectStore(REACT_WALLET_STORES.attachments).put(row));
  backup.encryptedStores.profile.forEach((row) => tx.objectStore(REACT_WALLET_STORES.profile).put(row));
  backup.encryptedStores.settings.forEach((row) => tx.objectStore(REACT_WALLET_STORES.settings).put(row));
  (backup.encryptedStores.seaService ?? []).forEach((row) => tx.objectStore(REACT_WALLET_STORES.seaService).put(row));
  tx.objectStore(REACT_WALLET_STORES.security).put(backup.security);
  await txDone(tx);
  return unlockReactWalletVault(db, pin);
}

export async function listReactWalletSeaService(
  db: IDBDatabase,
  session: ReactWalletSession,
): Promise<ReactWalletSeaServiceEntry[]> {
  const rows = await allFromStore<ReactWalletEncryptedRow>(db, REACT_WALLET_STORES.seaService);
  const entries = await Promise.all(rows.filter(isEncryptedRow).map((row) => decryptRow<ReactWalletSeaServiceEntry>(session.dataKey, row)));
  return entries.sort((a, b) => b.signOn.localeCompare(a.signOn));
}

export async function createReactWalletSeaServiceEntry(
  db: IDBDatabase,
  session: ReactWalletSession,
  input: Pick<ReactWalletSeaServiceEntry, "vessel" | "rank" | "signOn" | "signOff">,
): Promise<ReactWalletSeaServiceEntry> {
  if (!input.vessel.trim()) throw new Error("Vessel is required.");
  if (!input.signOn || !input.signOff) throw new Error("Sign-on and sign-off dates are required.");
  if (input.signOff < input.signOn) throw new Error("Sign-off cannot be before sign-on.");
  const timestamp = nowIso();
  const entry: ReactWalletSeaServiceEntry = {
    id: uid("sea"),
    vessel: input.vessel.trim().slice(0, 120),
    rank: input.rank.trim().slice(0, 80),
    signOn: input.signOn,
    signOff: input.signOff,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const row = await encryptedRow(session.dataKey, "seaService", entry.id, entry);
  const tx = db.transaction(REACT_WALLET_STORES.seaService, "readwrite");
  tx.objectStore(REACT_WALLET_STORES.seaService).put(row);
  await txDone(tx);
  return entry;
}

export async function deleteReactWalletSeaServiceEntry(
  db: IDBDatabase,
  session: ReactWalletSession,
  id: string,
): Promise<void> {
  if (session.status !== "unlocked") throw new Error("Unlock the React vault before changing sea-service entries.");
  await getVaultRecord(db);
  const tx = db.transaction(REACT_WALLET_STORES.seaService, "readwrite");
  tx.objectStore(REACT_WALLET_STORES.seaService).delete(id);
  await txDone(tx);
}

export async function saveReactWalletSetting(
  db: IDBDatabase,
  session: ReactWalletSession,
  setting: ReactWalletSettings,
): Promise<void> {
  const settingRow = await encryptedRow(session.dataKey, "settings", setting.key, setting);
  const tx = db.transaction(REACT_WALLET_STORES.settings, "readwrite");
  tx.objectStore(REACT_WALLET_STORES.settings).put(settingRow);
  await txDone(tx);
}

export async function detectWebAuthnSupport(): Promise<boolean> {
  return typeof PublicKeyCredential !== "undefined" && typeof navigator.credentials?.get === "function";
}

export async function requestWebAuthnPresence(): Promise<boolean> {
  if (!(await detectWebAuthnSupport())) return false;
  try {
    const challenge = new Uint8Array(32);
    globalThis.crypto.getRandomValues(challenge);
    await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60_000,
        userVerification: "preferred",
      },
      mediation: "optional",
    });
    return true;
  } catch {
    return false;
  }
}

export function downloadBackup(backup: ReactWalletBackup): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `blue-wallet-react-secure-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
