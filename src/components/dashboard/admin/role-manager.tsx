"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { assignUserRoleWithValidation } from "@/ai/flows/assign-user-role-with-validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Bot, CheckCircle, Sparkles } from "lucide-react";

const FormSchema = z.object({
  roleName: z.string().min(2, {
    message: "Role name must be at least 2 characters.",
  }),
});

export function RoleManager() {
  const [result, setResult] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      roleName: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    setResult(null);
    try {
      const response = await assignUserRoleWithValidation({ userRequestRole: data.roleName });
      setResult(response.systemRoleId);
      toast({
        title: "Success",
        description: "Role ID has been successfully generated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error assigning role:", error);
      toast({
        title: "Error",
        description: "Failed to generate Role ID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">AI-Powered Role Management</CardTitle>
        </div>
        <CardDescription>
          Use generative AI to validate and assign a new system role ID based on your request.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="roleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User-Requested Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'Senior Network Technician'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {result && (
              <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-800">Generated System Role ID</h4>
                    <p className="mt-1 font-mono text-sm text-green-700 bg-green-100 px-2 py-1 rounded-sm inline-block">{result}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Generating...' : 
              (<>
                <Sparkles className="mr-2 h-4 w-4"/>
                Generate Role ID
              </>)}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
