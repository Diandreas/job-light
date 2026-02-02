import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return <DefaultErrorFallback error={this.state.error} onRetry={() => this.setState({ hasError: false, error: null })} />;
        }

        return this.props.children;
    }
}

function DefaultErrorFallback({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3">
                <span className="text-red-600 dark:text-red-400 text-lg">!</span>
            </div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                Une erreur est survenue
            </h3>
            <p className="text-xs text-red-600 dark:text-red-400 mb-3 text-center max-w-xs">
                {error?.message || 'Erreur inattendue'}
            </p>
            <button
                onClick={onRetry}
                className="px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
                Réessayer
            </button>
        </div>
    );
}

export default ErrorBoundary;
