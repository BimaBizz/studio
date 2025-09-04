"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Users, Wrench, LogOut, Flame, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Role } from '@/lib/types';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as Role | null;
    if (!storedRole) {
      router.replace('/login');
    } else {
      setRole(storedRole);
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard', roles: ['Admin', 'Supervisor', 'Leader Teknisi'] },
    { href: '#', icon: Wrench, label: 'Tasks', roles: ['Supervisor', 'Leader Teknisi'] },
    { href: '#', icon: Users, label: 'Team', roles: ['Admin', 'Supervisor'] },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!role) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 flex-col border-r bg-card p-4 md:flex">
        <div className="mb-8 flex items-center gap-2">
          <Flame className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">TechFlow</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {navItems.filter(item => item.roles.includes(role)).map((item) => (
            <Button key={item.label} variant="ghost" className="justify-start gap-2">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
        <div>
          <Button onClick={handleLogout} variant="outline" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <h2 className="text-lg font-semibold">Welcome, {role}!</h2>
          <div className="md:hidden">
            <Button onClick={handleLogout} variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
