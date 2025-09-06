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
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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
      // Try to sign in
      await signInWithEmailAndPassword(auth, data.email, data.password);
      // In a real app, you'd fetch user role from your database after login.
      // For now, we are just logging in. Role is managed in the Users page.
      // We will set a temporary role to allow navigation.
      localStorage.setItem('userRole', 'Admin'); 
      router.push('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // If user doesn't exist, create a new account
        try {
          await createUserWithEmailAndPassword(auth, data.email, data.password);
          // Set a temporary role for the new user.
          localStorage.setItem('userRole', 'Admin'); 
          toast({
            title: "Akun Dibuat",
            description: "Selamat datang! Akun baru Anda telah berhasil dibuat.",
          });
          router.push('/dashboard');
        } catch (creationError: any) {
          toast({
            title: "Error",
            description: creationError.message,
            variant: "destructive",
          });
        }
      } else {
        // Handle other errors (e.g., wrong password)
        toast({
          title: "Autentikasi Gagal",
          description: "Silakan periksa kembali email dan kata sandi Anda.",
          variant: "destructive",
        });
      }
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
