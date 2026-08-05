import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  changeReactWalletPin,
  createReactWalletSeaServiceEntry,
  createReactWalletDocument,
  deleteReactWalletSeaServiceEntry,
  detectWebAuthnSupport,
  downloadBackup,
  exportReactWalletBackup,
  getReactWalletSecurityState,
  importReactWalletBackup,
  listReactWalletSeaService,
  listReactWalletDocuments,
  openReactWalletDB,
  removeReactWalletPinAndVault,
  requestWebAuthnPresence,
  rotateReactWalletDataKey,
  setupReactWalletVault,
  softDeleteReactWalletDocument,
  undoDeleteReactWalletDocument,
  unlockReactWalletVault,
  updateReactWalletDocument,
} from "./reactWalletDatabase";
import type {
  ReactWalletBackup,
  ReactWalletDocumentInput,
  ReactWalletDocumentView,
  ReactWalletSeaServiceEntry,
  ReactWalletSecurityState,
  ReactWalletSession,
} from "./reactWalletTypes";

interface ReactWalletContextValue {
  status: "loading" | "setup" | "locked" | "ready" | "error";
  error: string | null;
  documents: ReactWalletDocumentView[];
  seaService: ReactWalletSeaServiceEntry[];
  lastDeletedId: string | null;
  security: ReactWalletSecurityState;
  lockedUntil: number | null;
  retryCount: number;
  setupPin: (pin: string) => Promise<void>;
  unlock: (pin: string) => Promise<void>;
  lock: () => void;
  changePin: (currentPin: string, newPin: string) => Promise<void>;
  removePinAndVault: (currentPin: string) => Promise<void>;
  rotateDataKey: (pin: string) => Promise<void>;
  checkBiometricPresence: () => Promise<boolean>;
  createSeaServiceEntry: (input: Pick<ReactWalletSeaServiceEntry, "vessel" | "rank" | "signOn" | "signOff">) => Promise<void>;
  deleteSeaServiceEntry: (id: string) => Promise<void>;
  createDocument: (input: ReactWalletDocumentInput, files: File[]) => Promise<void>;
  updateDocument: (id: string, input: ReactWalletDocumentInput, files: File[]) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  undoDelete: () => Promise<void>;
  exportBackup: () => Promise<ReactWalletBackup>;
  downloadBackupFile: () => Promise<void>;
  importBackup: (backup: ReactWalletBackup, pin: string) => Promise<void>;
  reload: () => Promise<void>;
}

const ReactWalletContext = createContext<ReactWalletContextValue | null>(null);

const defaultSecurity: ReactWalletSecurityState = {
  configured: false,
  webAuthnAvailable: false,
  rotationCounter: 0,
  lastUnlockedAt: null,
};

function nextThrottle(failures: number): number {
  if (failures < 2) return 0;
  return Date.now() + Math.min(30_000, 2 ** (failures - 1) * 1000);
}

export function ReactWalletProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [session, setSession] = useState<ReactWalletSession | null>(null);
  const [documents, setDocuments] = useState<ReactWalletDocumentView[]>([]);
  const [seaService, setSeaService] = useState<ReactWalletSeaServiceEntry[]>([]);
  const [status, setStatus] = useState<ReactWalletContextValue["status"]>("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastDeletedId, setLastDeletedId] = useState<string | null>(null);
  const [security, setSecurity] = useState<ReactWalletSecurityState>(defaultSecurity);
  const [retryCount, setRetryCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const lock = useMemo(
    () => () => {
      setSession(null);
      setDocuments([]);
      setSeaService([]);
      setLastDeletedId(null);
      setStatus((current) => (current === "ready" ? "locked" : current));
    },
    [],
  );

  const reload = useMemo(
    () => async () => {
      if (!db || !session) return;
      const [nextDocuments, nextSeaService] = await Promise.all([
        listReactWalletDocuments(db, session),
        listReactWalletSeaService(db, session),
      ]);
      setDocuments(nextDocuments);
      setSeaService(nextSeaService);
    },
    [db, session],
  );

  useEffect(() => {
    let cancelled = false;
    let openedDb: IDBDatabase | null = null;
    openReactWalletDB()
      .then(async (opened) => {
        openedDb = opened;
        const state = await getReactWalletSecurityState(opened);
        if (cancelled) {
          opened.close();
          return;
        }
        setDb(opened);
        setSecurity(state);
        setStatus(state.configured ? "locked" : "setup");
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

  useEffect(() => {
    if (!session) return;
    const expiresAt = new Date(session.expiresAt).getTime();
    const timer = window.setTimeout(lock, Math.max(0, expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [lock, session]);

  useEffect(() => {
    if (!session) return;
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") lock();
    };
    window.addEventListener("pagehide", lock);
    window.addEventListener("blur", lock);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("pagehide", lock);
      window.removeEventListener("blur", lock);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [lock, session]);

  const value = useMemo<ReactWalletContextValue>(
    () => ({
      status,
      error,
      documents,
      seaService,
      lastDeletedId,
      security,
      retryCount,
      lockedUntil,
      async setupPin(pin) {
        if (!db) throw new Error("React wallet database is not ready.");
        const nextSession = await setupReactWalletVault(db, pin);
        setSession(nextSession);
        setRetryCount(0);
        setLockedUntil(null);
        setSecurity({ ...(await getReactWalletSecurityState(db)), lastUnlockedAt: nextSession.unlockedAt });
        const [nextDocuments, nextSeaService] = await Promise.all([
          listReactWalletDocuments(db, nextSession),
          listReactWalletSeaService(db, nextSession),
        ]);
        setDocuments(nextDocuments);
        setSeaService(nextSeaService);
        setStatus("ready");
      },
      async unlock(pin) {
        if (!db) throw new Error("React wallet database is not ready.");
        if (lockedUntil && lockedUntil > Date.now()) throw new Error("Too many incorrect PIN attempts. Please wait before trying again.");
        try {
          const nextSession = await unlockReactWalletVault(db, pin);
          setSession(nextSession);
          setRetryCount(0);
          setLockedUntil(null);
          setSecurity({ ...(await getReactWalletSecurityState(db)), lastUnlockedAt: nextSession.unlockedAt });
          const [nextDocuments, nextSeaService] = await Promise.all([
            listReactWalletDocuments(db, nextSession),
            listReactWalletSeaService(db, nextSession),
          ]);
          setDocuments(nextDocuments);
          setSeaService(nextSeaService);
          setStatus("ready");
        } catch (err) {
          const failures = retryCount + 1;
          setRetryCount(failures);
          setLockedUntil(nextThrottle(failures));
          throw err;
        }
      },
      lock,
      async changePin(currentPin, newPin) {
        if (!db) throw new Error("React wallet database is not ready.");
        const nextSession = await changeReactWalletPin(db, currentPin, newPin);
        setSession(nextSession);
        setSecurity({ ...(await getReactWalletSecurityState(db)), lastUnlockedAt: nextSession.unlockedAt });
        setStatus("ready");
      },
      async removePinAndVault(currentPin) {
        if (!db) throw new Error("React wallet database is not ready.");
        await removeReactWalletPinAndVault(db, currentPin);
        setSession(null);
        setDocuments([]);
        setSeaService([]);
        setSecurity({ ...(await getReactWalletSecurityState(db)), lastUnlockedAt: null });
        setStatus("setup");
      },
      async rotateDataKey(pin) {
        if (!db || !session) throw new Error("Unlock the React vault before rotating keys.");
        const nextSession = await rotateReactWalletDataKey(db, session, pin);
        setSession(nextSession);
        setSecurity({ ...(await getReactWalletSecurityState(db)), lastUnlockedAt: nextSession.unlockedAt });
        const [nextDocuments, nextSeaService] = await Promise.all([
          listReactWalletDocuments(db, nextSession),
          listReactWalletSeaService(db, nextSession),
        ]);
        setDocuments(nextDocuments);
        setSeaService(nextSeaService);
      },
      async checkBiometricPresence() {
        const available = await detectWebAuthnSupport();
        setSecurity((current) => ({ ...current, webAuthnAvailable: available }));
        if (!available) return false;
        return requestWebAuthnPresence();
      },
      async createSeaServiceEntry(input) {
        if (!db || !session) throw new Error("Unlock the React vault before changing sea-service entries.");
        await createReactWalletSeaServiceEntry(db, session, input);
        await reload();
      },
      async deleteSeaServiceEntry(id) {
        if (!db || !session) throw new Error("Unlock the React vault before changing sea-service entries.");
        await deleteReactWalletSeaServiceEntry(db, session, id);
        await reload();
      },
      async createDocument(input, files) {
        if (!db || !session) throw new Error("Unlock the React vault before changing documents.");
        await createReactWalletDocument(db, session, input, files);
        await reload();
      },
      async updateDocument(id, input, files) {
        if (!db || !session) throw new Error("Unlock the React vault before changing documents.");
        await updateReactWalletDocument(db, session, id, input, files);
        await reload();
      },
      async deleteDocument(id) {
        if (!db || !session) throw new Error("Unlock the React vault before changing documents.");
        await softDeleteReactWalletDocument(db, session, id);
        setLastDeletedId(id);
        await reload();
      },
      async undoDelete() {
        if (!db || !session || !lastDeletedId) return;
        await undoDeleteReactWalletDocument(db, session, lastDeletedId);
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
      async importBackup(backup, pin) {
        if (!db) throw new Error("React wallet database is not ready.");
        const nextSession = await importReactWalletBackup(db, backup, pin);
        setSession(nextSession);
        setSecurity({ ...(await getReactWalletSecurityState(db)), lastUnlockedAt: nextSession.unlockedAt });
        const [nextDocuments, nextSeaService] = await Promise.all([
          listReactWalletDocuments(db, nextSession),
          listReactWalletSeaService(db, nextSession),
        ]);
        setDocuments(nextDocuments);
        setSeaService(nextSeaService);
        setStatus("ready");
      },
      reload,
    }),
    [db, documents, error, lastDeletedId, lock, lockedUntil, reload, retryCount, seaService, security, session, status],
  );

  return <ReactWalletContext.Provider value={value}>{children}</ReactWalletContext.Provider>;
}

export function useReactWallet(): ReactWalletContextValue {
  const value = useContext(ReactWalletContext);
  if (!value) throw new Error("useReactWallet must be used inside ReactWalletProvider");
  return value;
}
