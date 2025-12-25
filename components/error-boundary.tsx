"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="p-8 max-w-md mx-auto mt-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                문제가 발생했습니다
              </h2>
              <p className="text-sm text-muted-foreground">
                예기치 않은 오류가 발생했습니다. 다시 시도해 주세요.
              </p>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-w-full text-left">
                {this.state.error.message}
              </pre>
            )}
            <Button onClick={this.handleReset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </Button>
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}
