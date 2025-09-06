
"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Attendance } from "@/lib/types"
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale";
import { useTheme } from "next-themes"

interface MonthlyAttendanceChartProps {
  attendanceData: Attendance[]
}

export function MonthlyAttendanceChart({ attendanceData }: MonthlyAttendanceChartProps) {
  const { theme } = useTheme()
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const chartData = useMemo(() => {
    return daysInMonth.map(day => {
      const recordsForDay = attendanceData.filter(record => isSameDay(new Date(record.date), day))
      const summary = {
        Hadir: 0,
        Izin: 0,
        Sakit: 0,
        Alpa: 0,
      }
      recordsForDay.forEach(record => {
        if (record.status in summary) {
          summary[record.status]++
        }
      })
      return {
        date: format(day, "d"), // Format date as '1', '2', '3'...
        ...summary,
      }
    })
  }, [attendanceData, daysInMonth])
  
  const tickColor = theme === 'dark' ? '#A1A1AA' : '#71717A'; // Zinc 400 for dark, Zinc 500 for light

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan Absensi Bulanan</CardTitle>
        <CardDescription>Gambaran umum absensi tim untuk {format(now, "MMMM yyyy", { locale: IndonesianLocale })}.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis
              dataKey="date"
              stroke={tickColor}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={tickColor}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
                contentStyle={{
                    backgroundColor: theme === 'dark' ? 'hsl(240 10% 4%)' : 'hsl(0 0% 100%)',
                    borderColor: theme === 'dark' ? 'hsl(240 4% 16%)' : 'hsl(240 6% 90%)',
                    borderRadius: '0.5rem',
                }}
                cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Bar dataKey="Hadir" stackId="a" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Izin" stackId="a" fill="hsl(var(--chart-4))" />
            <Bar dataKey="Sakit" stackId="a" fill="hsl(var(--chart-5))" />
            <Bar dataKey="Alpa" stackId="a" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
