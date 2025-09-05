import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AttendanceGrid from "@/components/dashboard/attendance/attendance-grid";

export default function AttendancePage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Attendance System</h1>
                <p className="text-muted-foreground">
                    View and manage team attendance records.
                </p>
            </div>
            <Tabs defaultValue="grid" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="grid">Attendance Grid</TabsTrigger>
                </TabsList>
                <TabsContent value="grid" className="space-y-4">
                    <AttendanceGrid />
                </TabsContent>
            </Tabs>
        </div>
    );
}
