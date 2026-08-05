import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../../App";
import { REACT_WALLET_DATABASE_NAME } from "../../features/react-wallet/reactWalletTypes";
import { createTestSnapshot } from "../../test/testSnapshots";

const walletIntegrationTimeout = 15_000;

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

  async function setUpPin(user: ReturnType<typeof userEvent.setup>) {
    await screen.findByText("Set up React vault PIN");
    const newPin = screen.getByLabelText("New PIN");
    const confirmPin = screen.getByLabelText("Confirm PIN");
    await user.clear(newPin);
    await user.clear(confirmPin);
    await user.type(newPin, "123456");
    await user.type(confirmPin, "123456");
    await user.click(screen.getByRole("button", { name: /create secure vault/i }));
    await screen.findByText("Document dashboard", {}, { timeout: 10_000 });
  }

  it("renders the React database dashboard and migration wizard", async () => {
    const user = userEvent.setup();
    render(<App initialSnapshot={createTestSnapshot()} />);

    expect(screen.getByTestId("stable-ocean-background")).toBeInTheDocument();
    expect(screen.getByTestId("stable-helm-mark")).toBeInTheDocument();
    expect(screen.getByText("THE BLUE WALLET")).toBeInTheDocument();
    expect(screen.getByText("OFFSHORE SECURE VAULT")).toBeInTheDocument();
    expect(await screen.findByText("Set up React vault PIN")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /skip to documents/i })).toHaveAttribute("href", "#document-workspace");
    expect(screen.getByText("BlueWalletReactDB v3")).toBeInTheDocument();
    expect(screen.getByText("Legacy wallet assessment")).toBeInTheDocument();
    expect(screen.getByText("No migration action")).toBeInTheDocument();
    await setUpPin(user);
    expect(screen.getByTestId("stable-profile-strip")).toBeInTheDocument();
    expect(screen.getByText("Encrypted")).toBeInTheDocument();
    expect(screen.getByText("Maritime toolkit")).toBeInTheDocument();
    expect(screen.getByText("Ready to join")).toBeInTheDocument();
  }, walletIntegrationTimeout);

  it("creates, views, edits, soft deletes, and undoes a document", async () => {
    const user = userEvent.setup();
    render(<App initialSnapshot={createTestSnapshot()} />);

    await setUpPin(user);
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
    await waitFor(() => expect(screen.queryByText("React Passport Updated")).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /undo delete/i }));
    expect(await screen.findByText("React Passport Updated")).toBeInTheDocument();
  }, walletIntegrationTimeout);

  it("uploads image/PDF attachments and shows thumbnail or attachment count", async () => {
    const user = userEvent.setup();
    render(<App initialSnapshot={createTestSnapshot()} />);

    await setUpPin(user);
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
  }, walletIntegrationTimeout);

  it("filters and searches React-owned documents", async () => {
    const user = userEvent.setup();
    render(<App initialSnapshot={createTestSnapshot()} />);

    await setUpPin(user);
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
  }, walletIntegrationTimeout);

  it("renders scanner controls without migration execution controls", async () => {
    const user = userEvent.setup();
    render(<App initialSnapshot={createTestSnapshot()} />);

    await setUpPin(user);
    await user.click(screen.getByRole("button", { name: /scan document/i }));
    const dialog = screen.getByRole("dialog", { name: /scan document/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveClass("scanner-modal");
    expect(within(dialog).getByText("Capture")).toBeInTheDocument();
    expect(within(dialog).getByText("OCR review")).toBeInTheDocument();
    expect(within(dialog).getByText("Review before save")).toBeInTheDocument();
    expect(dialog.querySelectorAll(".scanner-panel")).toHaveLength(3);
    expect(screen.getByText("Camera")).toBeInTheDocument();
    expect(screen.getByText("OCR text")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /migrate/i })).not.toBeInTheDocument();
  }, walletIntegrationTimeout);

  it("creates an encrypted document from scanned pages and OCR suggestions", async () => {
    const user = userEvent.setup();
    render(<App initialSnapshot={createTestSnapshot()} />);

    await setUpPin(user);
    await user.click(screen.getByRole("button", { name: /scan document/i }));
    await user.upload(screen.getByLabelText("Import files"), new File(["image"], "passport.png", { type: "image/png" }));
    await user.type(screen.getByLabelText("OCR text"), [
      "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
      "L898902C36UTO7408122F3204159ZE184226B<<<<<10",
    ].join("\n"));
    await user.click(screen.getByRole("button", { name: /parse ocr/i }));
    expect(screen.getByDisplayValue("Passport - ERIKSSON ANNA MARIA")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /save encrypted scan/i }));

    expect(await screen.findByText("Passport - ERIKSSON ANNA MARIA")).toBeInTheDocument();
    expect(screen.getByText("Encrypted scan saved.")).toBeInTheDocument();
  }, walletIntegrationTimeout);

  it("locks and unlocks with PIN fallback", async () => {
    const user = userEvent.setup();
    render(<App initialSnapshot={createTestSnapshot()} />);

    await setUpPin(user);
    await user.click(screen.getByRole("button", { name: "Lock" }));
    expect(await screen.findByText("React vault locked")).toBeInTheDocument();
    await user.type(screen.getByLabelText("PIN"), "123456");
    await user.click(screen.getByRole("button", { name: /unlock vault/i }));
    expect(await screen.findByText("Document dashboard")).toBeInTheDocument();
  }, walletIntegrationTimeout);

  it("adds persisted sea-service entries from the maritime toolkit", async () => {
    const user = userEvent.setup();
    render(<App initialSnapshot={createTestSnapshot()} />);

    await setUpPin(user);
    await user.type(screen.getByLabelText("Vessel"), "MV Persistent");
    await user.type(screen.getByLabelText("Rank"), "Chief Officer");
    await user.type(screen.getByLabelText("Sign on"), "2026-01-01");
    await user.type(screen.getByLabelText("Sign off"), "2026-01-31");
    await user.click(screen.getByRole("button", { name: /add sea service/i }));

    expect(await screen.findByText("MV Persistent")).toBeInTheDocument();
    expect(screen.getAllByText(/31 days/i).length).toBeGreaterThan(0);
  }, walletIntegrationTimeout);
});
