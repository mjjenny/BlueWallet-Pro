import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(process.cwd(), "..");

function readStableHtml(): string {
  return readFileSync(path.join(repoRoot, "legacy-root-pwa.html"), "utf8").replace(/\r\n/g, "\n");
}

describe("stable backup hardening", () => {
  it("exports clear stable backup version labels with an integrity block", () => {
    const html = readStableHtml();

    expect(html).toContain("const BACKUP_FORMAT = 'bluewallet-pro-stable-backup';");
    expect(html).toContain("const BACKUP_VERSION = 6;");
    expect(html).toContain("const BACKUP_LABEL = 'Blue Wallet Stable Backup v6';");
    expect(html).toContain("backupVersionLabel: BACKUP_LABEL");
    expect(html).toContain("integrity: {");
    expect(html).toContain("algorithm: 'SHA-256'");
    expect(html).toContain("blue-wallet-stable-backup-v${BACKUP_VERSION}");
    expect(html).toContain("Download full backup v6");
  });

  it("verifies backup integrity and structure before restoring", () => {
    const html = readStableHtml();

    expect(html).toContain("async function inspectBackup(data)");
    expect(html).toContain("await verifyBackupIntegrity(data)");
    expect(html).toContain("Backup integrity check failed. The file may be corrupted or edited.");
    expect(html).toContain("Invalid backup: documents list is missing.");
    expect(html).toContain("Invalid backup: duplicate document id ");
    expect(html).toContain("Verify &amp; import backup");
  });

  it("confirms the inspected backup summary before any import writes happen", () => {
    const html = readStableHtml();
    const importHandler = html.slice(html.indexOf("document.getElementById('import-file').onchange"));

    expect(importHandler).toContain("const backupInfo = await inspectBackup(data);");
    expect(importHandler).toContain("if (!confirm(buildRestoreConfirmation(backupInfo))) return;");
    expect(importHandler).toContain("for (const doc of backupInfo.cleanDocs)");
    expect(importHandler.indexOf("if (!confirm(buildRestoreConfirmation(backupInfo))) return;")).toBeLessThan(
      importHandler.indexOf("await saveDoc(doc)"),
    );
    expect(importHandler).not.toContain("if (!confirm(`Import ${data.documents.length} documents?`)) return;");
  });
});
