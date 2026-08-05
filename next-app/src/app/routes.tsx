import type { LegacyWalletSnapshot } from "./providers/LegacyDataProvider";
import { WalletShell } from "./WalletShell";

export function AppRoutes({ snapshot }: { snapshot: LegacyWalletSnapshot }) {
  return <WalletShell snapshot={snapshot} />;
}
