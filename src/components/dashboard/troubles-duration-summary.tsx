
"use client";

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Trouble } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';
import { useTheme } from 'next-themes';

interface TroublesDurationSummaryProps {
  troubles: Trouble[];
}

interface UnitSummary {
  unitName: string;
  totalDuration: number;
}

const TroublesDurationSummary = ({ troubles }: TroublesDurationSummaryProps) => {
  const { theme } = useTheme();

  const summary: UnitSummary[] = useMemo(() => {
    const unitMap = new Map<string, number>();

    troubles.forEach(trouble => {
      const currentDuration = unitMap.get(trouble.unitName) || 0;
      unitMap.set(trouble.unitName, currentDuration + trouble.durationMinutes);
    });

    const sortedSummary = Array.from(unitMap.entries())
      .map(([unitName, totalDuration]) => ({ unitName, totalDuration }))
      .sort((a, b) => b.totalDuration - a.totalDuration); // Sort descending

    return sortedSummary;
  }, [troubles]);

  const tickColor = theme === 'dark' ? '#A1A1AA' : '#71717A';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Waktu Henti Unit (Bulan Ini)</CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {summary.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={summary}
              layout="vertical"
              margin={{
                top: 5,
                right: 10,
                left: -10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis 
                type="number" 
                stroke={tickColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}m`}
              />
              <YAxis
                type="category"
                dataKey="unitName"
                stroke={tickColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={80}
                tick={{textAnchor: 'start'}}
                dx={-85}
              />
              <Tooltip
                contentStyle={{
                    backgroundColor: theme === 'dark' ? 'hsl(240 10% 4%)' : 'hsl(0 0% 100%)',
                    borderColor: theme === 'dark' ? 'hsl(240 4% 16%)' : 'hsl(240 6% 90%)',
                    borderRadius: '0.5rem',
                }}
                cursor={{ fill: 'hsl(var(--muted))' }}
                formatter={(value: number) => [`${value} menit`, 'Durasi']}
              />
              <Bar dataKey="totalDuration" name="Durasi" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Tidak ada waktu henti bulan ini.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TroublesDurationSummary;
