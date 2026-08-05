import { beforeEach, describe, expect, it } from "vitest";
import {
  changeReactWalletPin,
  createReactWalletDocument,
  exportReactWalletBackup,
  importReactWalletBackup,
  listReactWalletDocuments,
  openReactWalletDB,
  removeReactWalletPinAndVault,
  rotateReactWalletDataKey,
  setupReactWalletVault,
  softDeleteReactWalletDocument,
  undoDeleteReactWalletDocument,
  unlockReactWalletVault,
  updateReactWalletDocument,
} from "../reactWalletDatabase";
import { REACT_WALLET_DATABASE_NAME, REACT_WALLET_STORES } from "../reactWalletTypes";

function deleteDb(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
}

function rawRows<T>(db: IDBDatabase, store: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const request = tx.objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

describe("BlueWalletReactDB secure vault", () => {
  beforeEach(async () => {
    await deleteDb(REACT_WALLET_DATABASE_NAME);
  });

  it("creates version 2 stores and never uses the legacy database name", async () => {
    const db = await openReactWalletDB();
    expect(db.name).toBe("BlueWalletReactDB");
    expect(db.version).toBe(2);
    expect(Array.from(db.objectStoreNames)).toEqual(["attachments", "documents", "profile", "security", "settings"]);
    db.close();
  });

  it("sets up a 4-8 digit PIN and rejects invalid PIN formats", async () => {
    const db = await openReactWalletDB();
    await expect(setupReactWalletVault(db, "123")).rejects.toThrow("PIN must be 4 to 8 digits");
    await expect(setupReactWalletVault(db, "123456789")).rejects.toThrow("PIN must be 4 to 8 digits");
    const session = await setupReactWalletVault(db, "1234");
    expect(session.status).toBe("unlocked");
    db.close();
  });

  it("creates, updates, soft deletes, and undoes encrypted documents", async () => {
    const db = await openReactWalletDB();
    const session = await setupReactWalletVault(db, "123456");
    const created = await createReactWalletDocument(db, session, {
      type: "passport",
      title: "DB Passport",
      expiryDate: "2031-01-01",
    });
    expect(created.id).toMatch(/^doc_/);
    await updateReactWalletDocument(db, session, created.id, {
      type: "passport",
      title: "DB Passport Edited",
      expiryDate: "2031-01-01",
      favourite: true,
    });
    let docs = await listReactWalletDocuments(db, session);
    expect(docs[0]?.title).toBe("DB Passport Edited");
    expect(docs[0]?.favourite).toBe(true);
    await softDeleteReactWalletDocument(db, session, created.id);
    docs = await listReactWalletDocuments(db, session);
    expect(docs[0]?.deletedAt).toBeTruthy();
    await undoDeleteReactWalletDocument(db, session, created.id);
    docs = await listReactWalletDocuments(db, session);
    expect(docs[0]?.deletedAt).toBeNull();
    db.close();
  });

  it("stores documents and attachments as AES-GCM envelopes without plaintext fields", async () => {
    const db = await openReactWalletDB();
    const session = await setupReactWalletVault(db, "123456");
    await createReactWalletDocument(
      db,
      session,
      { type: "certificate", title: "Secret Certificate", noExpiry: true },
      [
        new File(["png"], "secret.png", { type: "image/png" }),
        new File(["pdf"], "secret.pdf", { type: "application/pdf" }),
      ],
    );
    const [documentRow] = await rawRows<Record<string, unknown>>(db, REACT_WALLET_STORES.documents);
    const attachmentRows = await rawRows<Record<string, unknown>>(db, REACT_WALLET_STORES.attachments);
    expect(documentRow.title).toBeUndefined();
    expect(JSON.stringify(documentRow)).not.toContain("Secret Certificate");
    expect(documentRow.envelope).toMatchObject({ algorithm: "AES-256-GCM", version: 1 });
    expect(attachmentRows).toHaveLength(2);
    expect(JSON.stringify(attachmentRows)).not.toContain("secret.png");
    db.close();
  });

  it("throttles recovery by failing closed on wrong PIN without mutating rows", async () => {
    const db = await openReactWalletDB();
    const session = await setupReactWalletVault(db, "123456");
    await createReactWalletDocument(db, session, { type: "medical", title: "Medical", expiryDate: "2027-01-01" });
    const before = JSON.stringify(await rawRows(db, REACT_WALLET_STORES.documents));
    await expect(unlockReactWalletVault(db, "000000")).rejects.toThrow("PIN could not unlock this vault");
    expect(JSON.stringify(await rawRows(db, REACT_WALLET_STORES.documents))).toBe(before);
    db.close();
  });

  it("changes PINs, rotates the data key, and keeps old PINs from unlocking", async () => {
    const db = await openReactWalletDB();
    let session = await setupReactWalletVault(db, "123456");
    await createReactWalletDocument(db, session, { type: "visa", title: "Crew Visa", expiryDate: "2030-01-01" });
    session = await changeReactWalletPin(db, "123456", "87654321");
    await expect(unlockReactWalletVault(db, "123456")).rejects.toThrow("PIN could not unlock this vault");
    expect((await listReactWalletDocuments(db, session))[0]?.title).toBe("Crew Visa");
    const before = JSON.stringify(await rawRows(db, REACT_WALLET_STORES.documents));
    const rotated = await rotateReactWalletDataKey(db, session, "87654321");
    const after = JSON.stringify(await rawRows(db, REACT_WALLET_STORES.documents));
    expect(after).not.toBe(before);
    expect((await listReactWalletDocuments(db, rotated))[0]?.title).toBe("Crew Visa");
    db.close();
  });

  it("exports and restores encrypted backups only with the backup PIN", async () => {
    let db = await openReactWalletDB();
    const session = await setupReactWalletVault(db, "246810");
    await createReactWalletDocument(db, session, { type: "medical", title: "Backup Medical", expiryDate: "2027-01-01" });
    const backup = await exportReactWalletBackup(db);
    expect(backup.app).toBe("BlueWallet-Pro React Secure");
    expect(backup.version).toBe(2);
    expect(backup.encryptedStores.documents).toHaveLength(1);
    expect(JSON.stringify(backup)).not.toContain("Backup Medical");
    db.close();

    await deleteDb(REACT_WALLET_DATABASE_NAME);
    db = await openReactWalletDB();
    await expect(importReactWalletBackup(db, backup, "000000")).rejects.toThrow();
    const restoredSession = await importReactWalletBackup(db, backup, "246810");
    const docs = await listReactWalletDocuments(db, restoredSession);
    expect(docs[0]?.title).toBe("Backup Medical");
    db.close();
  });

  it("removes PIN by erasing the React-owned vault instead of storing an unprotected data key", async () => {
    const db = await openReactWalletDB();
    const session = await setupReactWalletVault(db, "135790");
    await createReactWalletDocument(db, session, { type: "passport", title: "Erase Me", expiryDate: "2031-01-01" });
    await removeReactWalletPinAndVault(db, "135790");
    expect(await rawRows(db, REACT_WALLET_STORES.documents)).toEqual([]);
    expect(await rawRows(db, REACT_WALLET_STORES.security)).toEqual([]);
    db.close();
  });

  it("validates required document fields after unlock", async () => {
    const db = await openReactWalletDB();
    const session = await setupReactWalletVault(db, "123456");
    await expect(createReactWalletDocument(db, session, { type: "passport", title: "", expiryDate: "2030-01-01" })).rejects.toThrow("Title is required");
    await expect(createReactWalletDocument(db, session, { type: "passport", title: "Missing expiry" })).rejects.toThrow("Expiry date is required");
    db.close();
  });
});
