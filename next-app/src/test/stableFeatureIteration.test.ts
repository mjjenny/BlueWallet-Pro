import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(process.cwd(), "..");

function stableHtml(): string {
  return readFileSync(path.join(repoRoot, "legacy-root-pwa.html"), "utf8").replace(/\r\n/g, "\n");
}

describe("stable feature iteration safeguards", () => {
  it("keeps unified search covering issuer, notes, expiry, status, and category fields", () => {
    const html = stableHtml();

    expect(html).toContain("Search title, number, issuer, notes, expiry, category");
    expect(html).toContain("function queryMatchesDoc(doc, query)");
    expect(html).toContain("return q || d.type === cat;");
    expect(html).toContain("expiryMonthTerms(doc)");
    expect(html).toContain("LABELS[doc.type]");
    expect(html).toContain("doc.authority");
    expect(html).toContain("doc.flagNotes");
    expect(html).toContain("st.key === 'none' ? 'no expiry' : st.key");
  });

  it("keeps stable helper declarations deduplicated", () => {
    const html = stableHtml();

    expect(html.match(/function buildPrintSheet\(\)/g)).toHaveLength(1);
    expect(html.match(/function buildReminderReport\(\)/g)).toHaveLength(1);
    expect(html.match(/function buildTimelineHtml\(\)/g)).toHaveLength(1);
  });

  it("groups expiry status and exports reminder files with calendar alarms", () => {
    const html = stableHtml();

    expect(html).toContain("function getExpiryGroups(source = documents)");
    expect(html).toContain("Expired ${groups.expired.length}");
    expect(html).toContain("function buildReminderReport()");
    expect(html).toContain("blue-wallet-expiry-reminders-");
    expect(html).toContain("BEGIN:VALARM");
    expect(html).toContain("TRIGGER:-P");
  });

  it("records local-only activity for document and transfer actions", () => {
    const html = stableHtml();

    expect(html).toContain("const ACTIVITY_LOG_KEY = 'bwActivityLog';");
    expect(html).toContain("recordActivity(isEdit ? 'document-edited' : 'document-added'");
    expect(html).toContain("recordActivity('document-deleted'");
    expect(html).toContain("recordActivity('backup-exported'");
    expect(html).toContain("recordActivity('backup-restored'");
    expect(html).toContain("blue-wallet-activity-log-");
  });

  it("adds data safety and accessibility improvements without a new app shell", () => {
    const html = stableHtml();

    expect(html).toContain("Data safety status");
    expect(html).toContain("Documents, scans, profile, packs, sea time, vaccines, backups, and logs stay on this device");
    expect(html).toContain("role=\"button\" tabindex=\"0\"");
    expect(html).toContain("aria-label=\"Search documents by title, number, issuer, notes, expiry month, or category\"");
    expect(html).toContain("e.key !== 'Enter' && e.key !== ' '");
    expect(html).toContain("min-height: 44px;");
  });
});
