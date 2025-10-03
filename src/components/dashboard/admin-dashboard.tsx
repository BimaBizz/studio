
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, Shield, Server, Briefcase, CalendarCheck, Wrench } from "lucide-react";
import type { User, Role, Attendance, SparePart, Trouble } from "@/lib/types";
import Link from "next/link";
import { AttendanceSummaryCard } from "./attendance-summary-card";
import { SparePartsSummaryCard } from "./spare-parts-summary-card";
import { MonthlyAttendanceChart } from "./monthly-attendance-chart";
import TroublesDurationSummary from "./troubles-duration-summary";

interface AdminDashboardProps {
  users: User[];
  roles: Role[];
  todaysAttendance: Attendance[];
  monthlyAttendance: Attendance[];
  spareParts: SparePart[];
  troubles: Trouble[];
}

export default function AdminDashboard({ users, roles, todaysAttendance, monthlyAttendance, spareParts, troubles }: AdminDashboardProps) {
  const roleNames = roles.map(r => r.name).join(', ');

  const featureCards = [
    { title: "Manajemen", description: "Kelola pengguna dan tim", href: "/dashboard/management", icon: Briefcase },
    { title: "Absensi", description: "Lacak absensi tim", href: "/dashboard/attendance", icon: CalendarCheck },
    { title: "Spare Parts", description: "Kelola suku cadang", href: "/dashboard/spare-parts", icon: Wrench },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dasbor Admin</h1>
        <p className="text-muted-foreground">Awasi dan kelola seluruh sistem Dovin Pratama.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">pengguna dalam sistem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peran yang Ditetapkan</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground truncate" title={roleNames}>
              {roleNames || 'Belum ada peran'}
            </p>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
