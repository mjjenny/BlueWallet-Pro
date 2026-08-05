import { describe, expect, it } from "vitest";
import { getDocumentValidity } from "../../../shared/status/documentStatus";
import { createTestSnapshot } from "../../../test/testSnapshots";
import { getDashboardCounts, selectDocuments } from "../documentSelectors";

const now = new Date("2026-08-05T00:00:00.000Z");

describe("document status calculations", () => {
  it("classifies valid, expiring, expired, and no-expiry documents", () => {
    expect(getDocumentValidity({ expiryDate: "2031-01-01", noExpiry: false }, now).key).toBe("valid");
    expect(getDocumentValidity({ expiryDate: "2026-09-01", noExpiry: false }, now).key).toBe("expiring");
    expect(getDocumentValidity({ expiryDate: "2026-01-01", noExpiry: false }, now).key).toBe("expired");
    expect(getDocumentValidity({ expiryDate: null, noExpiry: true }, now).key).toBe("no-expiry");
  });
});

describe("document selectors", () => {
  it("computes dashboard counts including encrypted and malformed records", () => {
    const snapshot = createTestSnapshot();
    const counts = getDashboardCounts(snapshot.records, snapshot.malformed.length);

    expect(counts).toMatchObject({
      readable: 4,
      encrypted: 1,
      valid: 1,
      expiring: 1,
      expired: 1,
      noExpiry: 1,
      malformed: 1,
    });
  });

  it("filters by selected category", () => {
    const snapshot = createTestSnapshot();
    const records = selectDocuments(snapshot.records, {
      category: "passport",
      search: "",
      filter: "all",
      sort: "expiry",
    });

    expect(records).toHaveLength(1);
    expect(records[0]?.kind).toBe("readable");
  });

  it("searches title, number, authority, notes, flag notes, and tags", () => {
    const snapshot = createTestSnapshot();
    const records = selectDocuments(snapshot.records, {
      category: "visa",
      search: "searchable visa",
      filter: "all",
      sort: "expiry",
    });

    expect(records).toHaveLength(1);
  });

  it("sorts by recently updated", () => {
    const snapshot = createTestSnapshot();
    const records = selectDocuments(snapshot.records, {
      category: "passport",
      search: "",
      filter: "all",
      sort: "updated",
    });

    expect(records).toHaveLength(1);
  });

  it("represents encrypted records through the encrypted filter", () => {
    const snapshot = createTestSnapshot();
    const records = selectDocuments(snapshot.records, {
      category: "passport",
      search: "",
      filter: "encrypted",
      sort: "expiry",
    });

    expect(records).toHaveLength(1);
    expect(records[0]?.kind).toBe("encrypted");
  });
});
