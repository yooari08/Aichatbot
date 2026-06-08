import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F8F8F9] p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-red-100">
            <RefreshCw className="size-6 text-red-500" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-[18px] font-semibold text-foreground">
              예상치 못한 오류가 발생했습니다
            </h1>
            <p className="text-[13px] text-muted-foreground">
              잠시 후 다시 시도하거나, 문제가 지속되면 관리자에게 문의하세요.
            </p>
          </div>

          {import.meta.env.DEV && (
            <pre className="max-w-lg overflow-auto rounded-md bg-[#F0F0F0] p-4 text-left text-[11px] text-red-700">
              {this.state.error.message}
              {'\n'}
              {this.state.error.stack}
            </pre>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={this.handleReset}>
              다시 시도
            </Button>
            <Button size="sm" onClick={() => window.location.reload()}>
              페이지 새로고침
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
