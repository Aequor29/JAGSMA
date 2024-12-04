// components/registration/SignUp.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
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
import { useRouter } from "next/navigation";

// Updated Zod schema to match backend registration schema
const formSchema = z
  .object({
    username: z
      .string()
      .min(2, {
        message: "Username must be at least 2 characters.",
      })
      .regex(/^[a-zA-Z0-9]+$/, {
        message: "Username must be alphanumeric.",
      }),
    email: z.string().email({ message: "Invalid email address" }),
    dob: z.string().refine(
      (date) => {
        return !isNaN(Date.parse(date));
      },
      { message: "Invalid date of birth" }
    ),
    phone: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, {
      message: "Phone must be in format XXX-XXX-XXXX",
    }),
    zipcode: z
      .string()
      .regex(/^\d{5}$/, { message: "Zipcode must be 5 digits" }),
    password: z
      .string()
      .min(4, { message: "Password must be at least 4 characters" }),
    confirmPassword: z
      .string()
      .min(4, { message: "Password must be at least 4 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export default function SignUp() {
  const { registerUser } = useAuth();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: "",
      zipcode: "",
      dob: "",
    },
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSignup: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setError(null);
    const { username, password, email, phone, zipcode, dob } = data;
    const errorMessage = await registerUser({
      username,
      password,
      email,
      phone,
      zipcode,
      dob,
    });
    setLoading(false);
    if (errorMessage) {
      setError(errorMessage);
    } else {
      // Registration successful, redirect or perform other actions
      // router.push("/main");
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
            onSubmit={form.handleSubmit(handleSignup)}
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
                    <Input
                      placeholder="Enter your username"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.username?.message?.toString()}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.email?.message?.toString()}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} required />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.dob?.message?.toString()}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="123-456-7890" {...field} required />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.phone?.message?.toString()}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zipcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" {...field} required />
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
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                      required
                    />
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
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.confirmPassword?.message?.toString()}
                  </FormMessage>
                </FormItem>
              )}
            />
            <CardFooter className="flex justify-between">
              <Button type="submit" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
