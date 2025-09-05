"use client";

import { useEffect, useState } from 'react';
import { type Role, type User } from '@/lib/types';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import SupervisorDashboard from '@/components/dashboard/supervisor-dashboard';
import LeaderTeknisiDashboard from '@/components/dashboard/leader-teknisi-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as string | null;
    setRole(storedRole);

    const fetchData = async () => {
      // Only fetch data if the user is an Admin
      if (storedRole === 'Admin') {
        try {
          const usersCollection = collection(db, "users");
          const userSnapshot = await getDocs(usersCollection);
          const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
          setUsers(userList);

          const rolesCollection = collection(db, "roles");
          const roleSnapshot = await getDocs(rolesCollection);
          const roleList = roleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role));
          setRoles(roleList);
        } catch (error) {
          console.error("Error fetching dashboard data: ", error);
          toast({
              title: "Error",
              description: "Failed to fetch dashboard data.",
              variant: "destructive"
          });
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, [toast]);

  if (isLoading || !role) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-8 w-1/4 mb-4" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      {role === 'Admin' && <AdminDashboard users={users} roles={roles} />}
      {role === 'Supervisor' && <SupervisorDashboard />}
      {role === 'Leader Teknisi' && <LeaderTeknisiDashboard />}
    </div>
  );
}
