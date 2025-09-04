"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If there's a user, also ensure role exists before redirecting
        const userRole = localStorage.getItem('userRole');
        if (userRole) {
          router.replace('/dashboard');
        } else {
          // This case might happen if auth state persists but role was cleared
          // Or if you need to fetch the role from a database
          // For now, we redirect to login to be safe.
          router.replace('/login');
        }
      } else {
        router.replace('/login');
      }
      // A small delay to avoid flash of content if redirection is too fast.
      const timer = setTimeout(() => setIsLoading(false), 200);
      return () => clearTimeout(timer);
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
