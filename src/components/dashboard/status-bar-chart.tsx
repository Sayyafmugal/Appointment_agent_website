"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS: Record<string, string> = {
  Scheduled: "var(--chart-1)",
  Completed: "var(--chart-3)",
  Cancelled: "var(--chart-2)",
}

export function StatusBarChart({
  data,
}: {
  data: { status: string; count: number }[]
}) {
  const hasData = data.some((d) => d.count > 0)

  return (
    <Card className="shimmer-card h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Appointments by Status</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-muted-foreground py-16 text-center text-sm">
            No appointments yet.
          </p>
        ) : (
          <div className="chart-breathe h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="status"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  width={28}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={56}>
                  {data.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={COLORS[entry.status] ?? "var(--chart-4)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
