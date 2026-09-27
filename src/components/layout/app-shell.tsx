import { SidebarNav } from "./sidebar-nav"
import { Header } from "./header"
import { StatusTicker } from "./status-ticker"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <aside className="bg-sidebar text-sidebar-foreground hidden w-64 shrink-0 border-r md:block">
        <div className="sticky top-0 h-svh">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30">
          <StatusTicker />
          <Header />
        </div>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
