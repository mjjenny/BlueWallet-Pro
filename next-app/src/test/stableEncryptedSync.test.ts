import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(process.cwd(), "..");

function readRootFile(name: string): string {
  return readFileSync(path.join(repoRoot, name), "utf8");
}

describe("stable encrypted sync vault", () => {
  it("adds optional Supabase sync controls inside Settings", () => {
    const html = readRootFile("legacy-root-pwa.html");

    expect(html).toContain("Encrypted Sync Vault");
    expect(html).toContain('id="sync-url"');
    expect(html).toContain('id="sync-key"');
    expect(html).toContain('id="sync-vault-id"');
    expect(html).toContain('id="sync-passphrase"');
    expect(html).toContain('id="btn-sync-upload"');
    expect(html).toContain('id="btn-sync-pull"');
    expect(html).toContain("Sync is off until settings are saved.");
  });

  it("encrypts full backups before upload and decrypts only after download", () => {
    const html = readRootFile("legacy-root-pwa.html");

    expect(html).toContain("const SYNC_ENVELOPE_FORMAT = 'bluewallet-pro-encrypted-sync-v1';");
    expect(html).toContain("async function encryptSyncBackup(backup, passphrase)");
    expect(html).toContain("async function decryptSyncBackup(envelope, passphrase)");
    expect(html).toContain("PBKDF2-SHA256");
    expect(html).toContain("AES-GCM");
    expect(html).toContain("const signed = await signBackup(await buildFullBackupData());");
    expect(html).toContain("payload: useChunks ? {");
    expect(html).toContain("await applyBackupData(backup, info, { replaceDocuments: true });");
  });

  it("splits large encrypted vaults into small Supabase chunks", () => {
    const html = readRootFile("legacy-root-pwa.html");

    expect(html).toContain("const SYNC_CHUNK_TABLE = 'bluewallet_sync_vault_chunks';");
    expect(html).toContain("const SYNC_CHUNK_FORMAT = 'bluewallet-pro-encrypted-sync-chunked-v1';");
    expect(html).toContain("function splitSyncPayload(envelope)");
    expect(html).toContain("async function upsertSyncChunk(config, body)");
    expect(html).toContain("async function fetchSyncChunks(config, row)");
    expect(html).toContain("Uploading encrypted vault in");
  });

  it("requires explicit sync configuration and includes Supabase setup SQL", () => {
    const html = readRootFile("legacy-root-pwa.html");
    const sqlPath = path.join(repoRoot, "docs", "SUPABASE-ENCRYPTED-SYNC-VAULT.sql");
    const sql = readFileSync(sqlPath, "utf8");

    expect(html).toContain("function requireSyncConfig(config, passphrase)");
    expect(html).toContain("Supabase project URL is missing.");
    expect(html).toContain("Supabase anon key is missing.");
    expect(html).toContain("Sync passphrase is missing.");
    expect(html).toContain("function maybeAutoSyncOnOpen()");
    expect(html).toContain("Newer vault found, but this device has local changes.");
    expect(existsSync(sqlPath)).toBe(true);
    expect(sql).toContain("create table if not exists public.bluewallet_sync_vaults");
    expect(sql).toContain("payload jsonb not null");
    expect(sql).toContain("create table if not exists public.bluewallet_sync_vault_chunks");
    expect(sql).toContain("payload_text text not null");
    expect(sql).toContain("enable row level security");
  });
});
