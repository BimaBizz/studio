
"use client";

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Trouble } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/badge';

interface TroublesDurationSummaryProps {
  troubles: Trouble[];
}

interface UnitSummary {
  unitName: string;
  totalDuration: number;
}

const TroublesDurationSummary = ({ troubles }: TroublesDurationSummaryProps) => {
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}j ${remainingMinutes}m`;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Waktu Henti Unit (Bulan Ini)</CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {summary.length > 0 ? (
          <ScrollArea className="h-40">
            <div className="space-y-4 pr-4">
              {summary.map(({ unitName, totalDuration }) => (
                <div key={unitName} className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate pr-2" title={unitName}>
                    {unitName}
                  </p>
                  <Badge variant="destructive">{formatDuration(totalDuration)}</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-muted-foreground">Tidak ada waktu henti bulan ini.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TroublesDurationSummary;
