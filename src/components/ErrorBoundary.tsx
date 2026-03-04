import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
          <div className="card max-w-md w-full text-center">
            <div className="text-5xl mb-4">😵</div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Jejda, něco se pokazilo
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
              Zkus se vrátit na hlavní stránku. Tvůj pokrok je v bezpečí.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 font-mono bg-slate-100 dark:bg-slate-800 rounded-lg p-2 break-all">
              {this.state.error?.message || 'Neočekávaná chyba'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                className="btn-secondary"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = import.meta.env.BASE_URL;
                }}
              >
                Zpět na hlavní
              </button>
              <button
                className="btn-primary"
                onClick={() => window.location.reload()}
              >
                Obnovit stránku
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
