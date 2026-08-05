import { beforeEach, describe, expect, it } from "vitest";
import {
  createReactWalletDocument,
  exportReactWalletBackup,
  importReactWalletBackup,
  listReactWalletDocuments,
  openReactWalletDB,
  softDeleteReactWalletDocument,
  undoDeleteReactWalletDocument,
  updateReactWalletDocument,
} from "../reactWalletDatabase";
import { REACT_WALLET_DATABASE_NAME } from "../reactWalletTypes";

function deleteDb(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
}

describe("BlueWalletReactDB", () => {
  beforeEach(async () => {
    await deleteDb(REACT_WALLET_DATABASE_NAME);
  });

  it("creates version 1 stores and never uses the legacy database name", async () => {
    const db = await openReactWalletDB();
    expect(db.name).toBe("BlueWalletReactDB");
    expect(db.version).toBe(1);
    expect(Array.from(db.objectStoreNames)).toEqual(["attachments", "documents", "profile", "settings"]);
    db.close();
  });

  it("creates, updates, soft deletes, and undoes documents", async () => {
    const db = await openReactWalletDB();
    const created = await createReactWalletDocument(db, {
      type: "passport",
      title: "DB Passport",
      expiryDate: "2031-01-01",
    });
    expect(created.id).toMatch(/^doc_/);
    await updateReactWalletDocument(db, created.id, {
      type: "passport",
      title: "DB Passport Edited",
      expiryDate: "2031-01-01",
      favourite: true,
    });
    let docs = await listReactWalletDocuments(db);
    expect(docs[0]?.title).toBe("DB Passport Edited");
    expect(docs[0]?.favourite).toBe(true);
    await softDeleteReactWalletDocument(db, created.id);
    docs = await listReactWalletDocuments(db);
    expect(docs[0]?.deletedAt).toBeTruthy();
    await undoDeleteReactWalletDocument(db, created.id);
    docs = await listReactWalletDocuments(db);
    expect(docs[0]?.deletedAt).toBeNull();
    db.close();
  });

  it("stores multi-file image and PDF attachments", async () => {
    const db = await openReactWalletDB();
    const doc = await createReactWalletDocument(
      db,
      { type: "certificate", title: "Files", noExpiry: true },
      [
        new File(["png"], "file.png", { type: "image/png" }),
        new File(["pdf"], "file.pdf", { type: "application/pdf" }),
      ],
    );
    expect(doc.attachments).toHaveLength(2);
    expect(doc.attachments.map((attachment) => attachment.type)).toEqual(["image/png", "application/pdf"]);
    expect(doc.attachments[0]?.data.startsWith("data:image/png")).toBe(true);
    db.close();
  });

  it("exports and imports React backup payloads", async () => {
    let db = await openReactWalletDB();
    await createReactWalletDocument(db, { type: "medical", title: "Backup Medical", expiryDate: "2027-01-01" });
    const backup = await exportReactWalletBackup(db);
    expect(backup.app).toBe("BlueWallet-Pro React");
    expect(backup.version).toBe(1);
    expect(backup.documents).toHaveLength(1);
    db.close();

    await deleteDb(REACT_WALLET_DATABASE_NAME);
    db = await openReactWalletDB();
    await importReactWalletBackup(db, backup);
    const docs = await listReactWalletDocuments(db);
    expect(docs[0]?.title).toBe("Backup Medical");
    db.close();
  });

  it("validates required document fields", async () => {
    const db = await openReactWalletDB();
    await expect(createReactWalletDocument(db, { type: "passport", title: "", expiryDate: "2030-01-01" })).rejects.toThrow("Title is required");
    await expect(createReactWalletDocument(db, { type: "passport", title: "Missing expiry" })).rejects.toThrow("Expiry date is required");
    db.close();
  });
});
