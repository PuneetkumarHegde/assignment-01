import { Button } from 'ui/basic/button'
import { Card, CardContent } from 'ui/basic/card'
import { AlertDanger } from 'ui/notify/alert'

interface LoadingStateProps {
  message?: string
}

export function FormLoadingSkeleton({ message = 'Loading shipping bill data...' }: LoadingStateProps) {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-28 rounded bg-gray-200" />
        <div className="h-8 w-64 rounded bg-gray-200" />
        <div className="h-4 w-96 rounded bg-gray-200" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-lg border border-gray-200 bg-gray-50" />
        ))}
      </div>

      <div className="h-10 w-80 rounded bg-gray-200" />

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-28 rounded bg-gray-100" />
            <div className="h-28 rounded bg-gray-100" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-12 rounded bg-gray-100" />
            <div className="h-12 rounded bg-gray-100" />
            <div className="h-12 rounded bg-gray-100" />
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-gray-500">{message}</p>
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  error: string | Error
  onRetry: () => void
}

export function FormLoadErrorView({ title = 'Failed to load form data', error, onRetry }: ErrorStateProps) {
  const errorMessage = typeof error === 'string' ? error : error.message || 'An unexpected error occurred.'

  return (
    <div className="space-y-4">
      <AlertDanger title={title} description={errorMessage} />
      <div className="flex items-center gap-3">
        <Button onClick={onRetry}>Retry loading</Button>
      </div>
    </div>
  )
}

interface EmptyDataNoticeProps {
  message: string
}

export function EmptyDataNotice({ message }: EmptyDataNoticeProps) {
  return (
    <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <p className="font-medium">Notice</p>
      <p className="mt-1">{message}</p>
    </div>
  )
}
