"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ZapIcon } from "lucide-react"
import { cn } from "cn"
import { NAV_ITEMS } from "./nav-items"
import { useReminderStats } from "@/hooks/use-reminders"
import { useExceptions } from "@/hooks/use-exceptions"

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { data: stats } = useReminderStats()
  const { data: exceptions } = useExceptions()

  const navBadges: Record<string, { count: number | undefined; tone: "warning" | "critical" }> = {
    "/reminders": { count: stats?.pending, tone: "warning" },
    "/exceptions": { count: exceptions?.length, tone: "critical" },
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="relative flex size-8 items-center justify-center">
          <span className="bg-primary/30 absolute -inset-1 animate-ping rounded-xl opacity-50" />
          <div className="bg-gradient-to-tr from-primary to-[var(--ticker-accent)] text-primary-foreground relative flex size-8 items-center justify-center rounded-lg">
            <ZapIcon className="node-pulse size-4" />
          </div>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold">Appointment Agent</p>
          <p className="text-primary text-[10px] font-bold tracking-wider uppercase">
            Your Clinic Agent
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
          const Icon = item.icon
          const badge = navBadges[item.href]
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="size-4" />
                {item.label}
              </span>
              {!!badge?.count && badge.count > 0 && (
                <span
                  className={cn(
                    "badge-pulse rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold",
                    badge.tone === "warning"
                      ? "bg-status-warning/15 text-status-warning"
                      : "bg-status-critical/15 text-status-critical"
                  )}
                >
                  {badge.count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/15 text-primary relative flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold">
            CA
            <span className="border-sidebar absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 bg-emerald-500" />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-bold">Clinic Admin</p>
            <p className="text-primary flex items-center gap-1.5 font-mono text-[10px]">
              <span className="relative flex size-1.5">
                <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                <span className="bg-primary relative inline-flex size-1.5 rounded-full" />
              </span>
              n8n Live Sync
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
