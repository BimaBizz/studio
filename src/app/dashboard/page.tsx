"use client";

import { useEffect, useState } from 'react';
import { type Role } from '@/lib/types';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import SupervisorDashboard from '@/components/dashboard/supervisor-dashboard';
import LeaderTeknisiDashboard from '@/components/dashboard/leader-teknisi-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as Role | null;
    setRole(storedRole);
  }, []);

  if (!role) {
    return (
        <div>
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
    <div>
      {role === 'Admin' && <AdminDashboard />}
      {role === 'Supervisor' && <SupervisorDashboard />}
      {role === 'Leader Teknisi' && <LeaderTeknisiDashboard />}
    </div>
  );
}
