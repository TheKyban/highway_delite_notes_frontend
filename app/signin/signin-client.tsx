"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiService } from "@/lib/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { isAxiosError } from "axios";

const formSchema = z.object({
  email: z.string().email("Invalid email"),
  otp: z.string().optional(),
});

export default function SignInClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      otp: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      if (!otpSent) {
        // Send OTP
        const response = await apiService.login({
          email: values.email,
        });

        if (response.success) {
          setOtpSent(true);
          setError(null);
        }
      } else {
        // Verify OTP
        const response = await apiService.verifyOTP({
          email: values.email,
          otp: values.otp || "",
        });

        if (response.success) {
          // Add small delay to ensure cookie is set before redirect
          setTimeout(() => {
            router.push("/dashboard");
          }, 100);
        }
      }
    } catch (error) {
      if (isAxiosError(error))
        setError(
          error.response?.data.message ||
            "Authentication failed. Please try again."
        );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex w-full min-h-screen bg-gray-50">
      {/* Left Panel - Form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-4 lg:p-8">
        <div className="w-full max-w-sm">
          {/* Logo for mobile */}
          <div className="flex justify-center lg:hidden mb-8">
            <div className="flex items-center gap-2">
              <StarIcon className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-[#232323]">HD</span>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#232323] mb-2">
              {otpSent ? "Verify OTP" : "Sign In"}
            </h2>
            <p className="text-base lg:text-lg text-gray-600 mb-8">
              {otpSent
                ? "Enter the OTP sent to your email"
                : "Enter your email to receive an OTP"}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">Email</Label>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                        disabled={isLoading || otpSent}
                        className="h-12 text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {otpSent && (
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="otp">OTP</Label>
                      <FormControl>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          {...field}
                          disabled={isLoading}
                          className="h-12 text-base"
                          maxLength={6}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 lg:h-14 text-base font-semibold bg-blue-500 hover:bg-blue-600 rounded-lg"
              >
                {isLoading
                  ? "Processing..."
                  : otpSent
                  ? "Verify OTP"
                  : "Send OTP"}
              </Button>
            </form>
          </Form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => router.push("/signup")}
                className="font-semibold text-blue-500 underline hover:text-blue-600"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Image (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-500 relative">
        {/* Logo positioned at top left */}
        <div className="absolute top-8 left-8 z-10">
          <div className="flex items-center gap-2">
            <StarIcon className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">HD</span>
          </div>
        </div>

        <Image
          src="/signin-bg.jpg"
          alt="Sign in background"
          fill
          className="object-cover"
          priority
        />
      </div>
    </main>
  );
}
