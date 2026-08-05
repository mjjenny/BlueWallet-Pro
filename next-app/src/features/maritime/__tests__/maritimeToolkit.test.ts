import { describe, expect, it } from "vitest";
import type { ReactWalletDocumentView } from "../../react-wallet/reactWalletTypes";
import {
  getDocumentPacks,
  getMaritimeRequirementStatuses,
  getReadyToJoinScore,
  getSeaServiceDays,
  getVaccinationDocuments,
} from "../maritimeRules";

function doc(partial: Partial<ReactWalletDocumentView>): ReactWalletDocumentView {
  return {
    id: partial.id ?? `doc_${partial.title}`,
    type: partial.type ?? "other",
    title: partial.title ?? "Document",
    number: "",
    authority: "",
    issueDate: null,
    expiryDate: partial.expiryDate ?? "2032-01-01",
    noExpiry: false,
    notes: partial.notes ?? "",
    flagNotes: "",
    tags: partial.tags ?? [],
    favourite: false,
    attachmentIds: [],
    attachments: [],
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    deletedAt: partial.deletedAt ?? null,
  };
}

describe("maritime toolkit", () => {
  it("scores ready-to-join status from active documents", () => {
    const documents = [
      doc({ type: "passport", title: "Passport" }),
      doc({ type: "cdc", title: "CDC" }),
      doc({ type: "coc", title: "COC" }),
      doc({ type: "certificate", title: "STCW Basic Safety" }),
      doc({ type: "medical", title: "Medical Fitness" }),
      doc({ type: "contract", title: "Contract" }),
    ];

    const statuses = getMaritimeRequirementStatuses(documents);
    expect(statuses.find((item) => item.requirement.id === "passport")?.status).toBe("ready");
    expect(statuses.find((item) => item.requirement.id === "yellow-fever")?.status).toBe("missing");
    expect(getReadyToJoinScore(documents)).toBeGreaterThanOrEqual(80);
  });

  it("builds document pack readiness", () => {
    const packs = getDocumentPacks([
      doc({ type: "passport", title: "Passport" }),
      doc({ type: "visa", title: "Visa" }),
      doc({ type: "contract", title: "Contract" }),
    ]);

    expect(packs.find((pack) => pack.id === "travel")).toMatchObject({ ready: 3, total: 3 });
    expect(packs.find((pack) => pack.id === "joining")?.ready).toBeLessThan(6);
  });

  it("tracks vaccination documents", () => {
    const documents = [
      doc({ type: "yellowfever", title: "Yellow Fever" }),
      doc({ type: "medical", title: "Medical Fitness" }),
      doc({ type: "certificate", title: "Deleted vaccine", notes: "vaccination", deletedAt: "2026-02-01" }),
    ];

    expect(getVaccinationDocuments(documents).map((item) => item.title)).toEqual(["Yellow Fever"]);
  });

  it("calculates inclusive sea-service days", () => {
    expect(getSeaServiceDays({ signOn: "2026-01-01", signOff: "2026-01-31" })).toBe(31);
    expect(getSeaServiceDays({ signOn: "2026-02-01", signOff: "2026-01-31" })).toBe(0);
  });
});
