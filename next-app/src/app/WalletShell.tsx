import type { LegacyWalletSnapshot } from "./providers/LegacyDataProvider";
import { ReactWalletProvider } from "../features/react-wallet/ReactWalletProvider";
import { ReactWalletShell } from "../features/react-wallet/ReactWalletShell";

interface WalletShellProps {
  snapshot: LegacyWalletSnapshot;
}

export function WalletShell({ snapshot }: WalletShellProps) {
  return (
    <ReactWalletProvider>
      <ReactWalletShell legacySnapshot={snapshot} />
    </ReactWalletProvider>
  );
}
