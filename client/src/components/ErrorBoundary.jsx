import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F0F10] text-[#E4E4E7] p-6">
          <div className="max-w-md w-full bg-[#171719] border border-red-500/30 rounded-2xl p-6 text-center shadow-xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 flex items-center justify-center text-red-400 font-bold text-xl">
              !
            </div>
            <h2 className="text-lg font-bold text-white">Something went wrong</h2>
            <p className="text-xs text-neutral-400">
              An unexpected error occurred while rendering this view.
            </p>
            {this.state.error && (
              <pre className="text-[11px] text-left p-3 rounded-lg bg-black/40 text-red-300 overflow-x-auto">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-white text-black hover:bg-neutral-200 transition"
              >
                Reload Page
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#232326] text-white hover:bg-[#2A2A2E] transition"
              >
                Return to Store
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
