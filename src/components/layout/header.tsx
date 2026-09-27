"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { MenuIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { SidebarNav } from "./sidebar-nav"
import { NAV_ITEMS } from "./nav-items"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const activeItem = NAV_ITEMS.find(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
  )

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    router.push(trimmed ? `/appointments?q=${encodeURIComponent(trimmed)}` : "/appointments")
  }

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/70 flex h-16 items-center gap-3 border-b px-4 backdrop-blur sm:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon className="size-5" />
        </Button>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <h2 className="mr-2 hidden shrink-0 text-lg font-bold sm:block">
        {activeItem?.label ?? "Appointment Agent"}
      </h2>

      <form onSubmit={handleSearch} className="max-w-sm flex-1">
        <div className="relative">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient, ID, doctor…"
            className="bg-muted/60 pl-8"
            aria-label="Search appointments"
          />
        </div>
      </form>
    </header>
  )
}
