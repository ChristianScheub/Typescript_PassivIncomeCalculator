
import React from 'react';
import Logger from '@/service/shared/logging/Logger/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to Logger if available
    if (Logger && typeof Logger.errorStack === 'function') {
      Logger.errorStack('ErrorBoundary caught error', error);
    } else if (Logger && typeof Logger.error === 'function') {
      Logger.error('ErrorBoundary caught error: ' + error.message);
    } else if (console && console.error) {
      console.error('ErrorBoundary caught error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: 32, textAlign: 'center', color: 'red' }}>
          <h2>Etwas ist schief gelaufen.</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
