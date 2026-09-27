import { WifiOffIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Shown whenever an API call fails (n8n unreachable, Google Sheets not
 * configured/shared, etc). Never renders placeholder/fake data in its place —
 * per spec, a broken backend must say so, not pretend to work.
 */
export function ErrorState({
  title = "Backend unavailable",
  message,
  onRetry,
}: {
  title?: string
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
      <WifiOffIcon className="text-destructive size-8" strokeWidth={1.5} />
      <div className="space-y-1">
        <p className="text-destructive text-sm font-medium">{title}</p>
        <p className="text-muted-foreground max-w-md text-sm">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
