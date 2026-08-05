import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("BlueWallet React recovered from a render failure", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="wallet-app" id="wallet-main">
        <section className="error-panel production-error" role="alert">
          <p className="eyebrow">Recovery mode</p>
          <h1>BlueWallet recovered safely</h1>
          <p>
            The React interface hit a display problem. Stored vault data was not changed. Refresh the
            app, then unlock again if needed.
          </p>
          <button type="button" className="primary-action" onClick={() => this.setState({ error: null })}>
            Try again
          </button>
        </section>
      </main>
    );
  }
}
