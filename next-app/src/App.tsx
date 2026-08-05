import "./App.css";
import { AppRoutes } from "./app/routes";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import {
  LegacyDataProvider,
  useLegacyData,
  type LegacyWalletSnapshot,
} from "./app/providers/LegacyDataProvider";

interface AppProps {
  initialSnapshot?: LegacyWalletSnapshot;
}

function AppContent() {
  const snapshot = useLegacyData();
  return <AppRoutes snapshot={snapshot} />;
}

function App({ initialSnapshot }: AppProps) {
  return (
    <AppErrorBoundary>
      <LegacyDataProvider initialSnapshot={initialSnapshot}>
        <AppContent />
      </LegacyDataProvider>
    </AppErrorBoundary>
  );
}

export default App;
