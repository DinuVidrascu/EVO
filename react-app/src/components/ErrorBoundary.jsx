import { Component } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[EvoTrack] Eroare neașteptată:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-8 bg-background dark:bg-slate-950">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-rose-900/30 p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Ups! Ceva nu a mers
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              A apărut o eroare neașteptată. Datele tale sunt în siguranță — apasă butonul de mai jos pentru a reîncărca.
            </p>
            {this.state.error && (
              <p className="text-xs font-mono bg-slate-50 dark:bg-slate-800 text-rose-500 px-4 py-3 rounded-xl mb-6 text-left overflow-auto max-h-24">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <RefreshCcw className="w-4 h-4" /> Încearcă din nou
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-2xl font-bold transition-all"
              >
                Reîncarcă pagina
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
