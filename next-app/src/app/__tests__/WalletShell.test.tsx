import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../../App";
import { REACT_WALLET_DATABASE_NAME } from "../../features/react-wallet/reactWalletTypes";
import { createTestSnapshot } from "../../test/testSnapshots";

function deleteDb(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
}

describe("React CRUD wallet shell", () => {
  beforeEach(async () => {
    await deleteDb(REACT_WALLET_DATABASE_NAME);
  });

  it("renders the React database dashboard and migration wizard", async () => {
    render(<App initialSnapshot={createTestSnapshot()} />);

    expect(await screen.findByText("Document dashboard")).toBeInTheDocument();
    expect(screen.getByText("BlueWalletReactDB v1")).toBeInTheDocument();
    expect(screen.getByText("Legacy wallet assessment")).toBeInTheDocument();
    expect(screen.getByText("No migration action")).toBeInTheDocument();
  });

  it("creates, views, edits, soft deletes, and undoes a document", async () => {
    const user = userEvent.setup();
    render(<App initialSnapshot={createTestSnapshot()} />);

    await screen.findByText("Document dashboard");
    await user.click(screen.getByRole("button", { name: /create document/i }));
    await user.type(screen.getByLabelText("Title"), "React Passport");
    await user.type(screen.getByLabelText("Number"), "RP-100");
    await user.type(screen.getByLabelText("Authority"), "React Authority");
    await user.type(screen.getByLabelText("Expiry date"), "2031-01-01");
    await user.type(screen.getByLabelText("Tags"), "joining,primary");
    await user.click(within(screen.getByRole("form", { name: /create document/i })).getByRole("button", { name: /create document/i }));

    expect(await screen.findByText("React Passport")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "View" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "React Passport Updated");
    await user.click(within(screen.getByRole("form", { name: /edit document/i })).getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText("React Passport Updated")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "View" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByText(/Document moved to deleted items/i)).toBeInTheDocument();
    expect(screen.queryByText("React Passport Updated")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /undo delete/i }));
    expect(await screen.findByText("React Passport Updated")).toBeInTheDocument();
  });

  it("uploads image/PDF attachments and shows thumbnail or attachment count", async () => {
    const user = userEvent.setup();
    render(<App initialSnapshot={createTestSnapshot()} />);

    await screen.findByText("Document dashboard");
    await user.click(screen.getByRole("button", { name: /create document/i }));
    await user.type(screen.getByLabelText("Title"), "Certificate With Files");
    await user.click(screen.getByLabelText("No Expiry"));
    await user.upload(screen.getByLabelText("Images or PDFs"), [
      new File(["image"], "cert.png", { type: "image/png" }),
      new File(["pdf"], "cert.pdf", { type: "application/pdf" }),
    ]);
    await user.click(within(screen.getByRole("form", { name: /create document/i })).getByRole("button", { name: /create document/i }));

    expect(await screen.findByText("Certificate With Files")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("filters and searches React-owned documents", async () => {
    const user = userEvent.setup();
    render(<App initialSnapshot={createTestSnapshot()} />);

    await screen.findByText("Document dashboard");
    await user.click(screen.getByRole("button", { name: /create document/i }));
    await user.selectOptions(screen.getByLabelText("Category"), "visa");
    await user.type(screen.getByLabelText("Title"), "Crew Visa Search Target");
    await user.type(screen.getByLabelText("Expiry date"), "2026-09-01");
    await user.click(within(screen.getByRole("form", { name: /create document/i })).getByRole("button", { name: /create document/i }));
    await user.click(screen.getByRole("button", { name: /visa/i }));
    await user.type(screen.getByRole("searchbox"), "target");

    expect(await screen.findByText("Crew Visa Search Target")).toBeInTheDocument();
    await user.selectOptions(screen.getByRole("combobox", { name: "Status" }), "expiring");
    expect(screen.getByText("Crew Visa Search Target")).toBeInTheDocument();
  });

  it("does not render PIN, encryption, OCR, camera, or migration execution controls", async () => {
    render(<App initialSnapshot={createTestSnapshot()} />);

    await screen.findByText("Document dashboard");
    expect(screen.queryByRole("button", { name: /PIN/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /OCR/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Camera/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /migrate/i })).not.toBeInTheDocument();
  });
});
