
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ListChecks, Users, BarChart, Briefcase, CalendarCheck, Folder, Wrench } from "lucide-react";
import Link from "next/link";
import { type Attendance } from "@/lib/types";
import { AttendanceSummaryCard } from "./attendance-summary-card";

interface SupervisorDashboardProps {
  todaysAttendance: Attendance[];
}

export default function SupervisorDashboard({ todaysAttendance }: SupervisorDashboardProps) {

  const featureCards = [
    { title: "Management", description: "Manage users and teams", href: "/dashboard/management", icon: Briefcase },
    { title: "Attendance", description: "Track team attendance", href: "/dashboard/attendance", icon: CalendarCheck },
    { title: "Drive", description: "Access shared files", href: "/dashboard/drive", icon: Folder },
    { title: "Spare Parts", description: "Manage equipment parts", href: "/dashboard/spare-parts", icon: Wrench },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Supervisor Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">tasks currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">technicians in your team</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">task completion rate this month</p>
          </CardContent>
        </Card>
        <AttendanceSummaryCard attendanceRecords={todaysAttendance} />
      </div>

       <div className="space-y-4">
        <h2 className="text-2xl font-bold">Quick Access</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
