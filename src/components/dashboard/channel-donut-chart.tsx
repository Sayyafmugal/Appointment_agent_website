"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const SERIES = [
  { key: "sms", label: "SMS", color: "var(--chart-1)" },
  { key: "email", label: "Email", color: "var(--chart-3)" },
]

export function ChannelDonutChart({ bySms, byEmail }: { bySms: number; byEmail: number }) {
  const data = [
    { name: "SMS", value: bySms, color: SERIES[0].color },
    { name: "Email", value: byEmail, color: SERIES[1].color },
  ]
  const total = bySms + byEmail

  return (
    <Card className="shimmer-card h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Reminders by Channel</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-muted-foreground py-16 text-center text-sm">
            No reminders sent yet.
          </p>
        ) : (
          <div className="chart-breathe h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  strokeWidth={2}
                  stroke="var(--card)"
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: 12,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={28}
                  formatter={(value) => (
                    <span className="text-foreground text-xs">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
