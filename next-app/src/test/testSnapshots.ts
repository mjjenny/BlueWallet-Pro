import {
  LEGACY_DATABASE_NAME,
  LEGACY_DATABASE_VERSION,
} from "../legacy/legacyDatabase";
import { encryptedDocumentFixture, malformedDocumentFixture } from "../legacy/__fixtures__/legacyRecordFixtures";
import { parseLegacyDocumentRecord } from "../legacy/legacyBackup";
import type { LegacyWalletSnapshot } from "../app/providers/LegacyDataProvider";
import type { LegacyPlaintextDocument } from "../legacy/legacyTypes";
import type { WalletRecord, MalformedWalletRecord } from "../features/documents/documentModel";
import { createReadableWalletDocument } from "../features/documents/documentModel";

const now = new Date("2026-08-05T00:00:00.000Z");

const documents: LegacyPlaintextDocument[] = [
  {
    id: "passport_valid",
    type: "passport",
    title: "Demo Passport",
    number: "P-100",
    authority: "Demo Passport Office",
    issueDate: "2026-01-01",
    expiryDate: "2031-01-01",
    noExpiry: false,
    notes: "Primary travel document.",
    flagNotes: "Accepted for joining.",
    tags: ["joining", "identity"],
    favourite: true,
    files: [{ name: "passport.jpg", type: "image/jpeg", data: "data:image/jpeg;base64,cGFzcw==" }],
    updatedAt: "2026-08-04T00:00:00.000Z",
  },
  {
    id: "cdc_expired",
    type: "cdc",
    title: "Demo CDC",
    number: "CDC-200",
    authority: "Demo Maritime Authority",
    issueDate: "2020-01-01",
    expiryDate: "2026-01-01",
    noExpiry: false,
    notes: "Needs renewal.",
    flagNotes: "",
    tags: ["identity"],
    favourite: false,
    files: [],
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "visa_expiring",
    type: "visa",
    title: "Demo Crew Visa",
    number: "V-300",
    authority: "Demo Consulate",
    issueDate: "2026-01-01",
    expiryDate: "2026-09-01",
    noExpiry: false,
    notes: "Searchable visa note.",
    flagNotes: "",
    tags: ["port"],
    favourite: false,
    files: [],
    updatedAt: "2026-08-03T00:00:00.000Z",
  },
  {
    id: "certificate_no_expiry",
    type: "certificate",
    title: "Demo STCW Basic",
    number: "STCW-400",
    authority: "Training Center",
    issueDate: "2025-01-01",
    expiryDate: null,
    noExpiry: true,
    notes: "",
    flagNotes: "No expiry certificate.",
    tags: "stcw,training",
    favourite: false,
    files: [
      { name: "front.jpg", type: "image/jpeg", data: "data:image/jpeg;base64,ZnJvbnQ=" },
      { name: "back.jpg", type: "image/jpeg", data: "data:image/jpeg;base64,YmFjaw==" },
    ],
    updatedAt: "2026-08-02T00:00:00.000Z",
  },
];

function readableRecords(): WalletRecord[] {
  return documents.map((document) => {
    const parsed = parseLegacyDocumentRecord(document);
    if (parsed.kind !== "plaintext") throw new Error("fixture failed to parse");
    return createReadableWalletDocument(parsed.raw, parsed.document, now);
  });
}

export function createTestSnapshot(): LegacyWalletSnapshot {
  const encrypted: WalletRecord = {
    kind: "encrypted",
    sourceFormat: "encrypted/unavailable",
    id: encryptedDocumentFixture.id,
    record: encryptedDocumentFixture,
  };
  const malformed: MalformedWalletRecord = {
    raw: malformedDocumentFixture,
    issues: [{ severity: "error", code: "document.missingId", message: "Plaintext document has no usable id" }],
  };

  return {
    status: "partial-data",
    database: {
      name: LEGACY_DATABASE_NAME,
      expectedVersion: LEGACY_DATABASE_VERSION,
      status: "present",
      actualVersion: LEGACY_DATABASE_VERSION,
    },
    records: [...readableRecords(), encrypted],
    malformed: [malformed],
    settings: {
      seafarer: { name: "Demo Seafarer", rank: "Chief Officer", nationality: "Demo", cdc: "CDC-200" },
      packs: [],
      seatime: [],
      vaccines: [],
      reminders: { primary: 183, secondary: 90, urgent: 30, critical: 7 },
      idleMins: 5,
      pin: { hash: null, hashVersion: null, required: false, salt: null, failCount: 0, lockUntil: 0 },
      encryption: { enabled: true, salt: "demo-salt" },
      biometric: { enabled: false, credentialId: null },
      app: { mode: "full", theme: "ocean", legacyTheme: null, iosBannerDismissed: false, onboardingDone: true },
      session: { unlocked: false },
      issues: [],
    },
    profilePhoto: { kind: "missing" },
    issues: [{ severity: "warning", code: "fixture.partial", message: "Encrypted fixture is locked" }],
    source: "indexeddb",
    loadedAt: "2026-08-05T00:00:00.000Z",
  };
}
