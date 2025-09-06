
import type { SparePart } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

interface SparePartsSummaryCardProps {
    spareParts: SparePart[];
}

export function SparePartsSummaryCard({ spareParts }: SparePartsSummaryCardProps) {
    const totalParts = spareParts.length;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spare Parts</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalParts}</div>
                <p className="text-xs text-muted-foreground">unique items registered</p>
            </CardContent>
        </Card>
    );
}
