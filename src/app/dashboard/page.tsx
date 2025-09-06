
"use client";

import { useEffect, useState } from 'react';
import { type Role, type User, type Attendance, type DriveFile } from '@/lib/types';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import SupervisorDashboard from '@/components/dashboard/supervisor-dashboard';
import LeaderTeknisiDashboard from '@/components/dashboard/leader-teknisi-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { startOfToday, endOfToday } from 'date-fns';
import { getFiles } from '@/services/drive';

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [todaysAttendance, setTodaysAttendance] = useState<Attendance[]>([]);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as string | null;
    setRole(storedRole);

    const fetchData = async () => {
      try {
        // Fetch data relevant to all roles that need it
        const todayStart = startOfToday();
        const todayEnd = endOfToday();
        const attendanceQuery = query(
            collection(db, "attendance"),
            where("date", ">=", Timestamp.fromDate(todayStart)),
            where("date", "<=", Timestamp.fromDate(todayEnd))
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const attendanceList = attendanceSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: (data.date as Timestamp).toDate().toISOString(),
            } as Attendance;
        });
        setTodaysAttendance(attendanceList);
        
        const fetchedFiles = await getFiles();
        setDriveFiles(fetchedFiles);
        
        // Fetch additional data only for Admin
        if (storedRole === 'Admin') {
            const usersCollection = collection(db, "users");
            const userSnapshot = await getDocs(usersCollection);
            const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(userList);

            const rolesCollection = collection(db, "roles");
            const roleSnapshot = await getDocs(rolesCollection);
            const roleList = roleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role));
            setRoles(roleList);
        }
      } catch (error) {
          console.error("Error fetching dashboard data: ", error);
          toast({
              title: "Error",
              description: "Failed to fetch dashboard data.",
              variant: "destructive"
          });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (isLoading || !role) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-8 w-1/4 mb-4" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      {role === 'Admin' && <AdminDashboard users={users} roles={roles} todaysAttendance={todaysAttendance} driveFiles={driveFiles} />}
      {role === 'Supervisor' && <SupervisorDashboard todaysAttendance={todaysAttendance} driveFiles={driveFiles} />}
      {role === 'Leader Teknisi' && <LeaderTeknisiDashboard todaysAttendance={todaysAttendance} driveFiles={driveFiles} />}
    </div>
  );
}
