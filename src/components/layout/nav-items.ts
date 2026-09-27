import {
  AlertTriangleIcon,
  CalendarCheck2Icon,
  HouseIcon,
  LineChartIcon,
  ListChecksIcon,
  SendIcon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview & Pipeline", icon: HouseIcon },
  { href: "/dashboard", label: "Dashboard", icon: LineChartIcon },
  { href: "/appointments", label: "Appointments", icon: CalendarCheck2Icon },
  { href: "/reminders", label: "Reminder Queue", icon: SendIcon },
  { href: "/activity", label: "Activity Audit", icon: ListChecksIcon },
  { href: "/exceptions", label: "Exceptions", icon: AlertTriangleIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
]
