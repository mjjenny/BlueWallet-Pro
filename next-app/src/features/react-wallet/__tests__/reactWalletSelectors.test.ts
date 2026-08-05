import { describe, expect, it } from "vitest";
import type { ReactWalletDocumentView } from "../reactWalletTypes";
import {
  getReactWalletRenderWindow,
  REACT_WALLET_RENDER_LIMIT,
  selectReactWalletDocuments,
} from "../reactWalletSelectors";

function documentAt(index: number): ReactWalletDocumentView {
  return {
    id: `doc_${index}`,
    type: "passport",
    title: `Passport ${String(index).padStart(4, "0")}`,
    number: `P-${index}`,
    authority: "Test",
    issueDate: null,
    expiryDate: "2032-01-01",
    noExpiry: false,
    notes: index === 247 ? "search target" : "",
    flagNotes: "",
    tags: [],
    favourite: false,
    attachmentIds: [],
    attachments: [],
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    deletedAt: null,
  };
}

describe("React wallet production selectors", () => {
  it("keeps large wallet render windows bounded while preserving filtered totals", () => {
    const documents = Array.from({ length: 250 }, (_, index) => documentAt(index));
    const selected = selectReactWalletDocuments(documents, {
      category: "passport",
      search: "",
      filter: "all",
      sort: "name",
    });
    const windowed = getReactWalletRenderWindow(selected);

    expect(selected).toHaveLength(250);
    expect(windowed.visible).toHaveLength(REACT_WALLET_RENDER_LIMIT);
    expect(windowed.hiddenCount).toBe(150);
    expect(windowed.visible[0]?.title).toBe("Passport 0000");
  });

  it("lets search narrow a large wallet below the render cap", () => {
    const documents = Array.from({ length: 250 }, (_, index) => documentAt(index));
    const selected = selectReactWalletDocuments(documents, {
      category: "passport",
      search: "search target",
      filter: "all",
      sort: "name",
    });
    const windowed = getReactWalletRenderWindow(selected);

    expect(windowed.visible).toHaveLength(1);
    expect(windowed.hiddenCount).toBe(0);
    expect(windowed.visible[0]?.id).toBe("doc_247");
  });
});
