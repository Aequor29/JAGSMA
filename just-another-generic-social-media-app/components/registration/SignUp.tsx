"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/app/context/AuthContext";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";

// Zod schema for validation
const formSchema = z
  .object({
    username: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
    email: z.string().email({ message: "Invalid email address" }),
    phone: z.string().regex(/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, {
      message: "Invalid phone number format",
    }),
    zipcode: z
      .string()
      .regex(/^\d{5}(-\d{4})?$/, { message: "Invalid ZIP code" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface FormData {
  email: string;
  phone: string;
  zipcode: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export default function SignUp() {
  const { register } = useAuth();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: "",
      zipcode: "",
    },
  });
  const [error, setError] = useState<string | null>(null);

  const handleSingup = async (data: FormData) => {
    const errorMessage = await register(data.username, data.password);
    if (errorMessage) {
      setError(errorMessage);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSingup)}
            className="space-y-4"
          >
            {error && <p className="text-red-500">{error}</p>}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.username?.message?.toString()}
                  </FormMessage>
                </FormItem>
              )}
            />
            {/* Other fields (email, phone, etc.) */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.email?.message?.toString()}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Phone number field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.phone?.message?.toString()}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* ZIP code field */}
            <FormField
              control={form.control}
              name="zipcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your ZIP code" {...field} />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.zipcode?.message?.toString()}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.password?.message?.toString()}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.confirmPassword?.message?.toString()}
                  </FormMessage>
                </FormItem>
              )}
            />
            <CardFooter className="flex justify-between">
              <Button type="submit">Sign Up</Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
