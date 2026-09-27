import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "cn"

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: number | string
  icon: LucideIcon
  tone?: "default" | "good" | "warning" | "serious"
}) {
  const toneClasses = {
    default: "bg-primary/10 text-primary",
    good: "bg-status-good/10 text-status-good",
    warning: "bg-status-warning/15 text-amber-700 dark:text-amber-400",
    serious: "bg-status-serious/15 text-orange-700 dark:text-orange-400",
  }[tone]

  return (
    <Card className="shimmer-card gap-0 py-4">
      <CardContent className="flex items-center gap-3 px-4">
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", toneClasses)}>
          <Icon className={cn("size-4.5", (tone === "warning" || tone === "serious") && "node-pulse")} />
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground truncate text-xs">{label}</p>
          <p className="text-xl font-semibold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
