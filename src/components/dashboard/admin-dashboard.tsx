
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, Shield, Server, Briefcase, CalendarCheck, Folder, Wrench } from "lucide-react";
import { RoleManager } from "@/components/dashboard/admin/role-manager";
import type { User, Role, Attendance, DriveFile, SparePart } from "@/lib/types";
import Link from "next/link";
import { AttendanceSummaryCard } from "./attendance-summary-card";
import { DriveSummaryCard } from "./drive-summary-card";
import { SparePartsSummaryCard } from "./spare-parts-summary-card";

interface AdminDashboardProps {
  users: User[];
  roles: Role[];
  todaysAttendance: Attendance[];
  driveFiles: DriveFile[];
  spareParts: SparePart[];
}

export default function AdminDashboard({ users, roles, todaysAttendance, driveFiles, spareParts }: AdminDashboardProps) {
  const roleNames = roles.map(r => r.name).join(', ');

  const featureCards = [
    { title: "Management", description: "Manage users and teams", href: "/dashboard/management", icon: Briefcase },
    { title: "Attendance", description: "Track team attendance", href: "/dashboard/attendance", icon: CalendarCheck },
    { title: "Drive", description: "Access shared files", href: "/dashboard/drive", icon: Folder },
    { title: "Spare Parts", description: "Manage equipment parts", href: "/dashboard/spare-parts", icon: Wrench },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Oversee and manage the entire TechFlow system.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">users in the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles Defined</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground truncate" title={roleNames}>
              {roleNames || 'No roles defined'}
            </p>
          </CardContent>
        </Card>
        <AttendanceSummaryCard attendanceRecords={todaysAttendance} />
        <DriveSummaryCard driveFiles={driveFiles} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SparePartsSummaryCard spareParts={spareParts} />
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

      <RoleManager />
    </div>
  );
}
