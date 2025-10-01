'use client';

import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Store error details in state
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // TODO: Log to error reporting service (e.g., Sentry)
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     contexts: {
    //       react: {
    //         componentStack: errorInfo.componentStack
    //       }
    //     }
    //   });
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>

            <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
              {this.props.dict?.error?.title || 'Something went wrong'}
            </h2>

            <p className="text-gray-600 text-center mb-6">
              {this.props.dict?.error?.message || 'We encountered an unexpected error. Please try again.'}
            </p>

            {/* Show error details in development */}
            {isDevelopment && this.state.error && (
              <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
                <p className="font-semibold mb-1">Error:</p>
                <p className="text-red-600 mb-2">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <details className="cursor-pointer">
                    <summary className="font-semibold">Component Stack</summary>
                    <pre className="mt-2 whitespace-pre-wrap text-gray-600">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-900 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {this.props.dict?.error?.tryAgain || 'Try Again'}
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors"
              >
                <Home className="w-4 h-4" />
                {this.props.dict?.error?.goHome || 'Go Home'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;