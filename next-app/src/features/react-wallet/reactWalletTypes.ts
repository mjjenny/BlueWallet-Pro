import type { LegacyDocumentType } from "../../legacy/legacyTypes";

export const REACT_WALLET_DATABASE_NAME = "BlueWalletReactDB";
export const REACT_WALLET_DATABASE_VERSION = 1;

export const REACT_WALLET_STORES = {
  documents: "documents",
  profile: "profile",
  settings: "settings",
  attachments: "attachments",
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
  app: "BlueWallet-Pro React";
  version: 1;
  exportedAt: string;
  documents: ReactWalletDocument[];
  attachments: ReactWalletAttachment[];
  profile: ReactWalletProfile | null;
  settings: ReactWalletSettings | null;
}

export interface ReactWalletValidationResult {
  ok: boolean;
  errors: string[];
}
