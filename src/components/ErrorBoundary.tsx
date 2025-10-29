import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReload = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const isEnvError = this.state.error?.message?.includes('environment variable');

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
          <Card className="max-w-2xl w-full glass-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {isEnvError ? '配置錯誤' : '發生錯誤'}
                  </CardTitle>
                  <CardDescription>
                    {isEnvError
                      ? '應用程式配置不完整'
                      : '應用程式遇到了一些問題'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEnvError ? (
                <>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">環境變數未設置</p>
                    <p className="text-sm text-muted-foreground">
                      此應用需要 Supabase 配置才能運行。請確保已設置以下環境變數：
                    </p>
                    <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>VITE_SUPABASE_URL</li>
                      <li>VITE_SUPABASE_PUBLISHABLE_KEY</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm font-medium text-primary mb-1">
                      部署管理員
                    </p>
                    <p className="text-sm text-muted-foreground">
                      請在部署平台（Zeabur）的環境變數設定中添加這些值，然後重新部署應用程式。
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-mono text-destructive break-all">
                      {this.state.error?.message}
                    </p>
                  </div>
                  {import.meta.env.DEV && this.state.errorInfo && (
                    <details className="p-4 bg-muted rounded-lg">
                      <summary className="text-sm font-medium cursor-pointer mb-2">
                        詳細錯誤資訊（開發模式）
                      </summary>
                      <pre className="text-xs overflow-auto max-h-60 text-muted-foreground">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={this.handleReload} className="flex-1">
                  返回首頁
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  重新載入
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
