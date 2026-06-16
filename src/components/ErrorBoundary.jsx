import { Component } from 'react';
import { BsExclamationTriangle } from 'react-icons/bs';
import Button from './common/Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, timestamp: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
      timestamp: new Date().toISOString()
    });
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-color)] p-6">
          <div className="max-w-md w-full text-center space-y-8 p-10 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-3xl mb-4">
              <BsExclamationTriangle className="text-4xl text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Something went wrong</h1>
              <p className="text-[var(--text-secondary)] font-medium">
                An unexpected error occurred in the application. We've been notified and are working on it.
              </p>
            </div>

            <div className="bg-[var(--bg-color)] p-4 rounded-2xl border border-[var(--border-color)] text-left">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Error Timestamp</p>
              <p className="text-xs font-mono text-[var(--text-secondary)]">{this.state.timestamp}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="primary" onClick={this.handleReload}>
                Reload Application
              </Button>
              <Button variant="outline" onClick={this.handleGoHome} className="border-[var(--border-color)]">
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
