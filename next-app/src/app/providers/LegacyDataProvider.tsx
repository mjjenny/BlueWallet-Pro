import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  detectLegacyDatabase,
  LEGACY_DATABASE_NAME,
  readFallbackDocumentsFromStorage,
  readLegacyDocumentsFromDatabase,
  readLegacyProfileFromDatabase,
  readLegacySettingsFromStorage,
  type LegacyDatabaseDetection,
  type StorageLike,
} from "../../legacy/legacyDatabase";
import { LEGACY_LOCAL_STORAGE_KEYS } from "../../legacy/legacyStorageKeys";
import type {
  LegacyCompatibilityIssue,
  LegacySettingsSnapshot,
} from "../../legacy/legacyTypes";
import type {
  EncryptedWalletRecord,
  MalformedWalletRecord,
  WalletRecord,
} from "../../features/documents/documentModel";
import { createReadableWalletDocument } from "../../features/documents/documentModel";

export type LegacyLoadStatus =
  | "loading"
  | "success"
  | "partial-data"
  | "unavailable"
  | "error";

export interface LegacyWalletSnapshot {
  status: LegacyLoadStatus;
  database: LegacyDatabaseDetection;
  records: WalletRecord[];
  malformed: MalformedWalletRecord[];
  settings: LegacySettingsSnapshot | null;
  profilePhoto: {
    kind: "missing" | "plaintext" | "encrypted" | "malformed";
    value?: string | null;
  };
  issues: LegacyCompatibilityIssue[];
  source: "indexeddb" | "fallback-localstorage" | "none";
  loadedAt: string | null;
}

interface LegacyDataContextValue extends LegacyWalletSnapshot {
  reload: () => Promise<void>;
}

interface LegacyDataProviderProps {
  children: ReactNode;
  loader?: () => Promise<LegacyWalletSnapshot>;
  initialSnapshot?: LegacyWalletSnapshot;
}

const unavailableDatabase: LegacyDatabaseDetection = {
  name: LEGACY_DATABASE_NAME,
  expectedVersion: 2,
  status: "unknown",
  reason: "Legacy data has not been checked yet",
};

export const emptyLegacySnapshot: LegacyWalletSnapshot = {
  status: "loading",
  database: unavailableDatabase,
  records: [],
  malformed: [],
  settings: null,
  profilePhoto: { kind: "missing" },
  issues: [],
  source: "none",
  loadedAt: null,
};

const LegacyDataContext = createContext<LegacyDataContextValue | null>(null);

function storageAvailable(storage: Storage | undefined): StorageLike | null {
  return storage ? { getItem: (key) => storage.getItem(key) } : null;
}

function parseFallbackProfile(local: StorageLike): LegacyWalletSnapshot["profilePhoto"] {
  const raw = local.getItem(LEGACY_LOCAL_STORAGE_KEYS.fallbackProfile);
  if (!raw) return { kind: "missing" };
  try {
    const row = JSON.parse(raw) as unknown;
    if (typeof row === "object" && row && "_enc" in row) return { kind: "encrypted" };
    if (typeof row === "object" && row && "data" in row) {
      return { kind: "plaintext", value: (row as { data?: string | null }).data ?? null };
    }
    if (typeof row === "string") return { kind: "plaintext", value: row };
  } catch {
    return { kind: "malformed" };
  }
  return { kind: "malformed" };
}

function classifyRows(rows: ReturnType<typeof readFallbackDocumentsFromStorage>, now = new Date()): {
  records: WalletRecord[];
  malformed: MalformedWalletRecord[];
  issues: LegacyCompatibilityIssue[];
} {
  const records: WalletRecord[] = [];
  const malformed: MalformedWalletRecord[] = [];
  const issues: LegacyCompatibilityIssue[] = [];

  for (const row of rows) {
    issues.push(...row.issues);
    if (row.kind === "plaintext") records.push(createReadableWalletDocument(row.raw, row.document, now));
    if (row.kind === "encrypted") {
      const encrypted: EncryptedWalletRecord = {
        kind: "encrypted",
        sourceFormat: "encrypted/unavailable",
        id: row.record.id,
        record: row.record,
      };
      records.push(encrypted);
    }
    if (row.kind === "malformed") malformed.push({ raw: row.raw, issues: row.issues });
  }

  return { records, malformed, issues };
}

function deriveStatus(
  source: LegacyWalletSnapshot["source"],
  records: WalletRecord[],
  malformed: MalformedWalletRecord[],
  issues: LegacyCompatibilityIssue[],
): LegacyLoadStatus {
  if (source === "none" && records.length === 0) return "unavailable";
  if (malformed.length > 0 || issues.length > 0 || records.some((record) => record.kind === "encrypted")) {
    return "partial-data";
  }
  return "success";
}

async function openExistingLegacyDatabase(factory: IDBFactory): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = factory.open(LEGACY_DATABASE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Legacy database open was blocked"));
  });
}

export async function loadLegacyWalletData(): Promise<LegacyWalletSnapshot> {
  const local = storageAvailable(globalThis.localStorage);
  const session = storageAvailable(globalThis.sessionStorage);
  const settings = local ? readLegacySettingsFromStorage(local, session ?? undefined) : null;
  const database = await detectLegacyDatabase(globalThis.indexedDB);
  const issues: LegacyCompatibilityIssue[] = settings?.issues ? [...settings.issues] : [];
  let source: LegacyWalletSnapshot["source"] = "none";
  let profilePhoto: LegacyWalletSnapshot["profilePhoto"] = { kind: "missing" };
  let rows: ReturnType<typeof readFallbackDocumentsFromStorage> = [];

  if (database.status === "present" && globalThis.indexedDB) {
    const db = await openExistingLegacyDatabase(globalThis.indexedDB);
    try {
      rows = await readLegacyDocumentsFromDatabase(db);
      profilePhoto = await readLegacyProfileFromDatabase(db);
      source = "indexeddb";
    } finally {
      db.close();
    }
  } else if (local) {
    rows = readFallbackDocumentsFromStorage(local);
    profilePhoto = parseFallbackProfile(local);
    source = rows.length > 0 ? "fallback-localstorage" : "none";
  }

  const classified = classifyRows(rows);
  issues.push(...classified.issues);
  if (database.status === "unknown") {
    issues.push({
      severity: "warning",
      code: "database.unknown",
      message: database.reason ?? "Legacy database detection is unavailable",
    });
  }

  return {
    status: deriveStatus(source, classified.records, classified.malformed, issues),
    database,
    records: classified.records,
    malformed: classified.malformed,
    settings,
    profilePhoto,
    issues,
    source,
    loadedAt: new Date().toISOString(),
  };
}

export function LegacyDataProvider({
  children,
  loader = loadLegacyWalletData,
  initialSnapshot,
}: LegacyDataProviderProps) {
  const [snapshot, setSnapshot] = useState<LegacyWalletSnapshot>(initialSnapshot ?? emptyLegacySnapshot);

  const reload = useMemo(
    () => async () => {
      setSnapshot((current) => ({ ...current, status: "loading" }));
      try {
        setSnapshot(await loader());
      } catch (error) {
        const message = error instanceof Error ? error.message : "Legacy data load failed";
        setSnapshot({
          ...emptyLegacySnapshot,
          status: "error",
          issues: [{ severity: "error", code: "provider.loadFailed", message }],
          loadedAt: new Date().toISOString(),
        });
      }
    },
    [loader],
  );

  useEffect(() => {
    if (!initialSnapshot) void reload();
  }, [initialSnapshot, reload]);

  const value = useMemo<LegacyDataContextValue>(() => ({ ...snapshot, reload }), [snapshot, reload]);
  return <LegacyDataContext.Provider value={value}>{children}</LegacyDataContext.Provider>;
}

export function useLegacyData(): LegacyDataContextValue {
  const value = useContext(LegacyDataContext);
  if (!value) throw new Error("useLegacyData must be used inside LegacyDataProvider");
  return value;
}
