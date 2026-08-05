import type {
  LegacyBackupPayload,
  LegacyEncryptedDocumentRecord,
  LegacyPlaintextDocument,
} from "../legacyTypes";

export const plaintextDocumentFixture: LegacyPlaintextDocument = {
  id: "doc_passport_demo",
  type: "passport",
  title: "Demo Passport",
  number: "X1234567",
  authority: "Demo Authority",
  issueDate: "2026-01-15",
  expiryDate: "2031-01-14",
  noExpiry: false,
  notes: "Training fixture only.",
  flagNotes: "",
  tags: ["joining", "original"],
  favourite: true,
  files: [
    {
      name: "passport-demo.jpg",
      type: "image/jpeg",
      data: "data:image/jpeg;base64,ZGVtby1pbWFnZQ==",
    },
  ],
  updatedAt: "2026-08-01T10:00:00.000Z",
};

export const legacySingleFileDocumentFixture: LegacyPlaintextDocument = {
  id: "doc_single_file_demo",
  type: "medical",
  title: "Demo Medical Certificate",
  number: "MED-2026",
  authority: "Demo Clinic",
  issueDate: "2026-02-01",
  expiryDate: "2028-02-01",
  noExpiry: false,
  fileData: "data:application/pdf;base64,ZGVtby1wZGY=",
  fileName: "medical-demo.pdf",
  fileType: "application/pdf",
  updatedAt: "2026-08-02T10:00:00.000Z",
};

export const multiFileDocumentFixture: LegacyPlaintextDocument = {
  id: "doc_multi_file_demo",
  type: "certificate",
  title: "Demo STCW Pack",
  number: "STCW-DEMO",
  authority: "Demo Training Center",
  issueDate: "2025-04-01",
  expiryDate: null,
  noExpiry: true,
  files: [
    {
      name: "certificate-front.jpg",
      type: "image/jpeg",
      data: "data:image/jpeg;base64,ZnJvbnQ=",
    },
    {
      name: "certificate-back.jpg",
      type: "image/jpeg",
      data: "data:image/jpeg;base64,YmFjaw==",
    },
  ],
  tags: "stcw,joining",
  favourite: false,
  updatedAt: "2026-08-03T10:00:00.000Z",
};

export const encryptedDocumentFixture: LegacyEncryptedDocumentRecord = {
  _enc: 1,
  id: "doc_encrypted_demo",
  iv: "MTIzNDU2Nzg5MDEy",
  data: "ZW5jcnlwdGVkLXBheWxvYWQ=",
};

export const malformedDocumentFixture = {
  type: "passport",
  title: "Missing identifier",
};

export const backupV4Fixture: LegacyBackupPayload = {
  version: 4,
  exportedAt: "2026-08-05T00:00:00.000Z",
  documents: [
    plaintextDocumentFixture,
    legacySingleFileDocumentFixture,
    multiFileDocumentFixture,
  ],
  profile: "data:image/png;base64,cHJvZmlsZQ==",
  seafarer: {
    name: "Demo Seafarer",
    rank: "Chief Officer",
    nationality: "Demo",
    cdc: "CDC-DEMO",
    passport: "X1234567",
    nok: "Demo Contact",
  },
  packs: [{ id: "pack_demo", name: "Joining Pack", docIds: ["doc_passport_demo"] }],
  seatime: [
    {
      id: "sea_demo",
      vessel: "MV Demo",
      rank: "Chief Officer",
      signOn: "2026-03-01",
      signOff: "2026-07-01",
    },
  ],
  vaccines: [
    {
      id: "vac_demo",
      name: "Yellow fever",
      dose: "1",
      date: "2025-01-01",
      expiry: "2035-01-01",
    },
  ],
  reminders: { primary: 183, secondary: 90, urgent: 30, critical: 7 },
  settings: { idleMins: 5, appMode: "full", theme: "ocean", pinRequired: true },
};
