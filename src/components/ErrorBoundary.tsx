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
              Něco se pokazilo
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {this.state.error?.message || 'Neočekávaná chyba'}
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.hash = '#/';
                window.location.reload();
              }}
            >
              Obnovit aplikaci
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
