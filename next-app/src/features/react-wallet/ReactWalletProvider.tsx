import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  createReactWalletDocument,
  downloadBackup,
  exportReactWalletBackup,
  importReactWalletBackup,
  listReactWalletDocuments,
  openReactWalletDB,
  softDeleteReactWalletDocument,
  undoDeleteReactWalletDocument,
  updateReactWalletDocument,
} from "./reactWalletDatabase";
import type {
  ReactWalletBackup,
  ReactWalletDocumentInput,
  ReactWalletDocumentView,
} from "./reactWalletTypes";

interface ReactWalletContextValue {
  status: "loading" | "ready" | "error";
  error: string | null;
  documents: ReactWalletDocumentView[];
  lastDeletedId: string | null;
  createDocument: (input: ReactWalletDocumentInput, files: File[]) => Promise<void>;
  updateDocument: (id: string, input: ReactWalletDocumentInput, files: File[]) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  undoDelete: () => Promise<void>;
  exportBackup: () => Promise<ReactWalletBackup>;
  downloadBackupFile: () => Promise<void>;
  importBackup: (backup: ReactWalletBackup) => Promise<void>;
  reload: () => Promise<void>;
}

const ReactWalletContext = createContext<ReactWalletContextValue | null>(null);

export function ReactWalletProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [documents, setDocuments] = useState<ReactWalletDocumentView[]>([]);
  const [status, setStatus] = useState<ReactWalletContextValue["status"]>("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastDeletedId, setLastDeletedId] = useState<string | null>(null);

  const reload = useMemo(
    () => async () => {
      if (!db) return;
      setDocuments(await listReactWalletDocuments(db));
    },
    [db],
  );

  useEffect(() => {
    let cancelled = false;
    let openedDb: IDBDatabase | null = null;
    openReactWalletDB()
      .then(async (opened) => {
        openedDb = opened;
        if (cancelled) {
          opened.close();
          return;
        }
        setDb(opened);
        setDocuments(await listReactWalletDocuments(opened));
        setStatus("ready");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not open React wallet database.");
        setStatus("error");
      });
    return () => {
      cancelled = true;
      openedDb?.close();
    };
  }, []);

  const value = useMemo<ReactWalletContextValue>(
    () => ({
      status,
      error,
      documents,
      lastDeletedId,
      async createDocument(input, files) {
        if (!db) throw new Error("React wallet database is not ready.");
        await createReactWalletDocument(db, input, files);
        await reload();
      },
      async updateDocument(id, input, files) {
        if (!db) throw new Error("React wallet database is not ready.");
        await updateReactWalletDocument(db, id, input, files);
        await reload();
      },
      async deleteDocument(id) {
        if (!db) throw new Error("React wallet database is not ready.");
        await softDeleteReactWalletDocument(db, id);
        setLastDeletedId(id);
        await reload();
      },
      async undoDelete() {
        if (!db || !lastDeletedId) return;
        await undoDeleteReactWalletDocument(db, lastDeletedId);
        setLastDeletedId(null);
        await reload();
      },
      async exportBackup() {
        if (!db) throw new Error("React wallet database is not ready.");
        return exportReactWalletBackup(db);
      },
      async downloadBackupFile() {
        if (!db) throw new Error("React wallet database is not ready.");
        downloadBackup(await exportReactWalletBackup(db));
      },
      async importBackup(backup) {
        if (!db) throw new Error("React wallet database is not ready.");
        await importReactWalletBackup(db, backup);
        await reload();
      },
      reload,
    }),
    [db, documents, error, lastDeletedId, reload, status],
  );

  return <ReactWalletContext.Provider value={value}>{children}</ReactWalletContext.Provider>;
}

export function useReactWallet(): ReactWalletContextValue {
  const value = useContext(ReactWalletContext);
  if (!value) throw new Error("useReactWallet must be used inside ReactWalletProvider");
  return value;
}
