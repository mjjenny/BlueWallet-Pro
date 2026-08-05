import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../../App";
import { LegacyDataProvider } from "../providers/LegacyDataProvider";
import {
  readFallbackDocumentsFromStorage,
  readLegacySettingsFromStorage,
} from "../../legacy/legacyDatabase";
import { LEGACY_LOCAL_STORAGE_KEYS } from "../../legacy/legacyStorageKeys";
import { createTestSnapshot } from "../../test/testSnapshots";
import { plaintextDocumentFixture } from "../../legacy/__fixtures__/legacyRecordFixtures";

class MemoryStorage {
  private readonly data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

describe("read-only wallet shell", () => {
  it("renders dashboard counts and migration status", () => {
    render(<App initialSnapshot={createTestSnapshot()} />);

    expect(screen.getByText("Wallet overview")).toBeInTheDocument();
    expect(screen.getByText("Legacy database detected (v2)")).toBeInTheDocument();
    expect(screen.getByText("Malformed skipped")).toBeInTheDocument();
    expect(screen.getByText("Read-only")).toBeInTheDocument();
  });

  it("shows accessible horizontal category navigation", async () => {
    const user = userEvent.setup();
    render(<App initialSnapshot={createTestSnapshot()} />);

    const nav = screen.getByRole("navigation", { name: /document categories/i });
    const yellowFever = within(nav).getByRole("button", { name: /yellow fever/i });
    await user.tab();

    expect(within(nav).getByRole("button", { name: /passport/i })).toBeInTheDocument();
    expect(yellowFever).toBeInTheDocument();
  });

  it("filters categories and displays empty states", async () => {
    const user = userEvent.setup();
    render(<App initialSnapshot={createTestSnapshot()} />);

    await user.click(screen.getByRole("button", { name: /medical/i }));

    expect(screen.getByText("No documents found")).toBeInTheDocument();
    expect(screen.getByText(/No medical documents match/i)).toBeInTheDocument();
  });

  it("searches documents from the toolbar", async () => {
    const user = userEvent.setup();
    render(<App initialSnapshot={createTestSnapshot()} />);

    await user.click(screen.getByRole("button", { name: /visa/i }));
    await user.type(screen.getByRole("searchbox"), "crew visa");

    expect(screen.getByText("Demo Crew Visa")).toBeInTheDocument();
  });

  it("opens read-only details without edit or delete actions", async () => {
    const user = userEvent.setup();
    render(<App initialSnapshot={createTestSnapshot()} />);

    await user.click(screen.getByRole("button", { name: /view details/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Primary travel document.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });

  it("shows encrypted records as unavailable, not decrypted", async () => {
    const user = userEvent.setup();
    render(<App initialSnapshot={createTestSnapshot()} />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Status" }), "encrypted");

    expect(screen.getByText("Locked legacy document")).toBeInTheDocument();
    expect(screen.getAllByText(/Encrypted\/unavailable/i).length).toBeGreaterThan(1);
  });

  it("provider read path performs no localStorage writes", async () => {
    const local = new MemoryStorage();
    const session = new MemoryStorage();
    local.setItem(LEGACY_LOCAL_STORAGE_KEYS.fallbackDocuments, JSON.stringify([plaintextDocumentFixture]));
    const setSpy = vi.spyOn(local, "setItem");
    setSpy.mockClear();

    const loader = async () => {
      readFallbackDocumentsFromStorage(local);
      readLegacySettingsFromStorage(local, session);
      return createTestSnapshot();
    };

    render(
      <LegacyDataProvider loader={loader}>
        <div>provider test</div>
      </LegacyDataProvider>,
    );

    expect(await screen.findByText("provider test")).toBeInTheDocument();
    expect(setSpy).not.toHaveBeenCalled();
  });
});
