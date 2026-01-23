import React from 'react';

type Props = { children: React.ReactNode; showJson?: boolean; fallbackJson?: string };
type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    // In real app: send to logging service
    // console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="p-6 rounded-md bg-red-50 text-red-700">
          <strong>Something went wrong.</strong>
          <div className="mt-2 text-sm">We couldn't display this section. Try refreshing.</div>
          {this.props.showJson && this.props.fallbackJson && (
            <pre className="mt-4 p-3 bg-slate-800 text-slate-100 text-xs rounded overflow-auto">{this.props.fallbackJson}</pre>
          )}
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}
