import AttendanceGrid from "@/components/dashboard/attendance/attendance-grid";

export default function AttendancePage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Sistem Absensi</h1>
                <p className="text-muted-foreground">
                    Lihat dan kelola catatan absensi tim.
                </p>
            </div>
            <AttendanceGrid />
        </div>
    );
}
