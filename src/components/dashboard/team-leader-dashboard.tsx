
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wrench, CheckCircle, Clock, CalendarCheck } from "lucide-react";
import Link from "next/link";
import { type Attendance, type SparePart, type Trouble } from "@/lib/types";
import { AttendanceSummaryCard } from "./attendance-summary-card";
import { SparePartsSummaryCard } from "./spare-parts-summary-card";
import { MonthlyAttendanceChart } from "./monthly-attendance-chart";
import TroublesDurationSummary from "./troubles-duration-summary";

interface TeamLeaderDashboardProps {
  todaysAttendance: Attendance[];
  monthlyAttendance: Attendance[];
  spareParts: SparePart[];
  troubles: Trouble[];
}

export default function TeamLeaderDashboard({ todaysAttendance, monthlyAttendance, spareParts, troubles }: TeamLeaderDashboardProps) {

  const featureCards = [
    { title: "Absensi", description: "Lacak absensi tim", href: "/dashboard/attendance", icon: CalendarCheck },
    { title: "Spare Parts", description: "Kelola suku cadang", href: "/dashboard/spare-parts", icon: Wrench },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dasbor Team Leader</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tugas Diberikan</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">tugas yang harus diselesaikan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai Hari Ini</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">tugas selesai dengan sukses</p>
          </CardContent>
        </Card>
        <SparePartsSummaryCard spareParts={spareParts} />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <MonthlyAttendanceChart attendanceData={monthlyAttendance} />
        </div>
        <div className="space-y-6">
            <AttendanceSummaryCard attendanceRecords={todaysAttendance} />
            <TroublesDurationSummary troubles={troubles} />
        </div>
      </div>


      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Akses Cepat</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {featureCards.map((card) => (
            <Link href={card.href} key={card.title}>
              <Card className="hover:bg-accent hover:text-accent-foreground transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-semibold">{card.title}</CardTitle>
                  <card.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
