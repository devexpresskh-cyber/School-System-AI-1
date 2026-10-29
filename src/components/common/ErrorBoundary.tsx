import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[FBIS ErrorBoundary Caught Error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Reset active tab to dashboard in localStorage
    try {
      localStorage.setItem('fbis_active_tab', 'dashboard');
    } catch {
      // Ignore storage errors
    }
    window.location.reload();
  };

  private handleSoftRecover = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-rose-700 to-amber-700 p-5 text-white flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-amber-200" />
              </div>
              <div>
                <h2 className="text-base font-bold">
                  {this.props.fallbackTitle || 'ប្រព័ន្ធបានរកឃើញបញ្ហា (System Encountered an Error)'}
                </h2>
                <p className="text-xs text-rose-100 font-khmer mt-0.5">
                  ទំព័រត្រូវបានការពារពីការរលត់ (Blank Page Prevented)
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-mono break-words leading-relaxed">
                <div className="font-bold text-rose-700 mb-1 flex items-center gap-1.5">
                  <span>Error Details:</span>
                </div>
                <div>{this.state.error?.message || 'Unknown runtime error occurred.'}</div>
              </div>

              <div className="text-xs text-slate-600 font-khmer space-y-1">
                <p>
                  សូមកុំបារម្ភ ទិន្នន័យមូលដ្ឋានរបស់អ្នកត្រូវបានរក្សាទុកដោយសុវត្ថិភាព។ អ្នកអាចចុចប៊ូតុងខាងក្រោមដើម្បីស្តារកម្មវិធីឡើងវិញ៖
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={this.handleSoftRecover}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>សាកល្បងបង្ហាញឡើងវិញ (Try Again)</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleReset}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ផ្ទុកទំព័រឡើងវិញ (Reload & Reset)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
