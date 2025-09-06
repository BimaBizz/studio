
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { type User } from '@/lib/types';

const FormSchema = z.object({
  email: z.string().email({ message: "Silakan masukkan alamat email yang valid." }),
  password: z.string().min(6, { message: "Kata sandi harus minimal 6 karakter." }),
});

export function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const loggedInUser = userCredential.user;

      // After successful login, fetch the user's role from their Firestore document
      const userDocRef = doc(db, "users", loggedInUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as User;
        localStorage.setItem('userRole', userData.role);
        
        toast({
          title: "Login Berhasil",
          description: "Selamat datang kembali!",
        });
        
        router.push('/dashboard');
      } else {
        throw new Error("Profil pengguna tidak ditemukan. Hubungi admin.");
      }

    } catch (error: any) {
        let description = "Silakan periksa kembali email dan kata sandi Anda.";
        if (error.code === 'auth/user-not-found' || error.message.includes("Profil pengguna tidak ditemukan")) {
            description = "Pengguna tidak ditemukan atau profil belum lengkap. Silakan hubungi admin.";
        } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = "Email atau kata sandi yang Anda masukkan salah.";
        }
        
        toast({
            title: "Autentikasi Gagal",
            description: description,
            variant: "destructive",
        });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="nama@contoh.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kata Sandi</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            'Masuk...'
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" /> Masuk
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
