
"use client";

import { useEffect, useState, type ReactNode } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, Wrench, LogOut, Flame, Loader2, Menu, X, Cog, CalendarCheck, Briefcase, Folder, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Role } from '@/lib/types';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from '@/components/dashboard/notification-bell';
import { AIChat } from '@/components/dashboard/ai-chat';


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Store a token to be checked by the file serving API
        document.cookie = "firebase-auth-token=true; path=/;";
        const storedRole = localStorage.getItem('userRole') as Role | null;
        if (storedRole) {
          setRole(storedRole);
        } else {
          signOut(auth);
          router.replace('/login');
        }
      } else {
        // Clear the token cookie on logout
        document.cookie = "firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.replace('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);


  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('userRole');
     // Clear the token cookie on logout
    document.cookie = "firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dasbor', roles: ['Admin', 'Supervisor', 'Leader Teknisi'] },
    { href: '/dashboard/management', icon: Briefcase, label: 'Manajemen', roles: ['Admin', 'Supervisor'] },
    { href: '/dashboard/attendance', icon: CalendarCheck, label: 'Absensi', roles: ['Admin', 'Supervisor', 'Leader Teknisi'] },
    { href: '/dashboard/drive', icon: Folder, label: 'Drive', roles: ['Admin', 'Supervisor', 'Leader Teknisi'] },
    { href: '/dashboard/spare-parts', icon: Wrench, label: 'Spare Parts', roles: ['Admin', 'Supervisor', 'Leader Teknisi'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(role || ''));

  const navContent = (
    <>
        <div className="mb-8 flex items-center gap-2 p-4">
          <Flame className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">Dovin Pratama</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-2 px-4">
          {filteredNavItems.map((item) => (
             <NextLink href={item.href} key={item.label} passHref>
                <Button 
                    variant={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === item.href) ? "secondary" : "ghost"} 
                    className="w-full justify-start gap-2"
                    asChild={false}
                    onClick={() => {
                        if (item.href !== '#') router.push(item.href)
                    }}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </Button>
            </NextLink>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <Button onClick={handleLogout} variant="outline" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
    </>
  );

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
    <div className="grid h-screen w-full md:grid-cols-[256px_1fr]">
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        {navContent}
      </aside>
      <div className="flex flex-col h-screen overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <div className="md:hidden">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex w-72 flex-col bg-card p-0">
                           {navContent}
                        </SheetContent>
                    </Sheet>
                </div>
                <h2 className="text-lg font-semibold">Selamat Datang, {role}!</h2>
            </div>
            <div className="flex items-center gap-2">
                <AIChat />
                <NotificationBell />
                <ThemeToggle />
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="h-full w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
