import { WifiOffIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Shown whenever an API call genuinely fails (n8n unreachable, Sheets shared
 * incorrectly, etc). Missing Google Sheets credentials is NOT one of these
 * cases — that falls back to the sample dataset in @/lib/demo/data instead
 * of erroring, so the public demo deployment always has something to show.
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
