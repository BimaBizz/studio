
import type { DriveFile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder } from "lucide-react";

interface DriveSummaryCardProps {
    driveFiles: DriveFile[];
}

export function DriveSummaryCard({ driveFiles }: DriveSummaryCardProps) {
    const totalFiles = driveFiles.length;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shared Drive</CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalFiles}</div>
                <p className="text-xs text-muted-foreground">total files available</p>
            </CardContent>
        </Card>
    );
}
