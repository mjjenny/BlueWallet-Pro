import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppErrorBoundary } from "../AppErrorBoundary";

function BrokenComponent(): never {
  throw new Error("render exploded");
}

describe("AppErrorBoundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a recoverable production fallback when a child crashes", async () => {
    const user = userEvent.setup();
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <AppErrorBoundary>
        <BrokenComponent />
      </AppErrorBoundary>,
    );

    expect(screen.getByText("BlueWallet recovered safely")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(screen.getByText("BlueWallet recovered safely")).toBeInTheDocument();
  });
});
