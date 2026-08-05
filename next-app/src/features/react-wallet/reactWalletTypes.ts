import type { LegacyDocumentType } from "../../legacy/legacyTypes";

export const REACT_WALLET_DATABASE_NAME = "BlueWalletReactDB";
export const REACT_WALLET_DATABASE_VERSION = 3;

export const REACT_WALLET_STORES = {
  documents: "documents",
  profile: "profile",
  settings: "settings",
  attachments: "attachments",
  security: "security",
  seaService: "seaService",
} as const;

export interface ReactWalletAttachment {
  id: string;
  documentId: string;
  name: string;
  type: string;
  size: number;
  data: string;
  createdAt: string;
}

export interface ReactWalletDocument {
  id: string;
  type: LegacyDocumentType;
  title: string;
  number: string;
  authority: string;
  issueDate: string | null;
  expiryDate: string | null;
  noExpiry: boolean;
  notes: string;
  flagNotes: string;
  tags: string[];
  favourite: boolean;
  attachmentIds: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ReactWalletProfile {
  key: "owner";
  name: string;
  rank: string;
  nationality: string;
}

export interface ReactWalletSettings {
  key: "wallet";
  defaultSort: ReactWalletSortKey;
  autoSave: boolean;
  updatedAt: string;
}

export interface ReactWalletSeaServiceEntry {
  id: string;
  vessel: string;
  rank: string;
  signOn: string;
  signOff: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReactWalletDocumentInput {
  type: LegacyDocumentType;
  title: string;
  number?: string;
  authority?: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  noExpiry?: boolean;
  notes?: string;
  flagNotes?: string;
  tags?: string[] | string;
  favourite?: boolean;
}

export interface ReactWalletDocumentView extends ReactWalletDocument {
  attachments: ReactWalletAttachment[];
}

export type ReactWalletStatusFilter =
  | "all"
  | "valid"
  | "expiring"
  | "expired"
  | "no-expiry"
  | "favourites"
  | "deleted";

export type ReactWalletSortKey = "expiry" | "name" | "category" | "updated";

export interface ReactWalletBackup {
  app: "BlueWallet-Pro React Secure";
  version: 2 | 3;
  exportedAt: string;
  security: ReactWalletVaultRecord;
  encryptedStores: ReactWalletEncryptedBackupStores;
}

export interface ReactWalletCryptoEnvelope {
  version: 1;
  algorithm: "AES-256-GCM";
  iv: string;
  ciphertext: string;
  aad?: string;
}

export type ReactWalletEncryptedRowKind = "document" | "attachment" | "profile" | "settings" | "seaService";

export interface ReactWalletEncryptedRow {
  id?: string;
  key?: string;
  kind: ReactWalletEncryptedRowKind;
  envelopeVersion: 1;
  envelope: ReactWalletCryptoEnvelope;
  updatedAt: string;
}

export interface ReactWalletVaultRecord {
  key: "vault";
  schemaVersion: 1;
  kdf: {
    name: "PBKDF2";
    hash: "SHA-256";
    iterations: number;
    salt: string;
  };
  wrappedDataKey: ReactWalletCryptoEnvelope;
  pinVerifier: ReactWalletCryptoEnvelope;
  rotationCounter: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReactWalletEncryptedBackupStores {
  documents: ReactWalletEncryptedRow[];
  attachments: ReactWalletEncryptedRow[];
  profile: ReactWalletEncryptedRow[];
  settings: ReactWalletEncryptedRow[];
  seaService: ReactWalletEncryptedRow[];
}

export interface ReactWalletSession {
  status: "unlocked";
  dataKey: CryptoKey;
  unlockedAt: string;
  expiresAt: string;
  rotationCounter: number;
}

export interface ReactWalletSecurityState {
  configured: boolean;
  webAuthnAvailable: boolean;
  rotationCounter: number;
  lastUnlockedAt: string | null;
}

export interface ReactWalletValidationResult {
  ok: boolean;
  errors: string[];
}
