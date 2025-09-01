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

export default function SignInPage() {
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
          router.push("/dashboard");
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
    <main className="flex min-h-screen w-full bg-white">
      {/* Form Section */}
      <div className="flex w-full my-[30%] lg:my-0 flex-1 flex-col p-4 lg:p-8">
        {/* Header - Always at top */}
        <header className="flex items-center justify-center lg:justify-start w-full mb-4 lg:mb-16">
          <div className="flex items-center gap-3">
            <StarIcon className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-semibold text-[#232323]">HD</h1>
          </div>
        </header>

        {/* Form - Centered */}
        <div className="flex lg:flex-1 items-center justify-center">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full max-w-md space-y-8"
            >
              {/* Title */}
              <div className="space-y-3 text-center lg:text-left">
                <h2 className="text-3xl lg:text-4xl font-bold text-[#232323]">
                  Sign In
                </h2>
                <p className="text-base lg:text-lg text-[#959595]">
                  Please login to continue to your account.
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          {...field}
                          className="h-14 p-4 text-base lg:text-lg border-2 rounded-lg border-blue-500 peer"
                          placeholder=" "
                          disabled={isLoading || otpSent}
                        />
                      </FormControl>
                      <Label
                        htmlFor="email"
                        className="absolute left-3 -top-2.5 bg-white px-1 text-sm font-medium text-blue-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm"
                      >
                        Email
                      </Label>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />

                {/* OTP Field - Only show when OTP is sent */}
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormControl>
                        <Input
                          id="otp"
                          type="text"
                          {...field}
                          className="h-14 p-4 text-base lg:text-lg border-2 rounded-lg border-blue-500 peer"
                          placeholder=" "
                          disabled={isLoading || !otpSent}
                          maxLength={6}
                        />
                      </FormControl>
                      <Label
                        htmlFor="otp"
                        className="absolute left-3 -top-2.5 bg-white px-1 text-sm font-medium text-blue-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm"
                      >
                        OTP Code
                      </Label>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-base lg:text-lg font-semibold bg-[#357aff] hover:bg-[#357aff]/90 rounded-lg disabled:opacity-50"
                >
                  {isLoading
                    ? otpSent
                      ? "Verifying..."
                      : "Sending OTP..."
                    : otpSent
                    ? "Submit OTP"
                    : "Get OTP"}
                </Button>
                <p className="text-center text-sm lg:text-base text-[#6c6c6c]">
                  Need an account?{" "}
                  <a
                    href="/signup"
                    className="font-semibold text-[#357aff] underline hover:text-[#357aff]/90"
                  >
                    Create one
                  </a>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Image Section */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-3">
        <div className="relative w-full h-full">
          <Image
            className="object-cover rounded-2xl"
            alt="Promotional banner for the sign-in page"
            src="/img19.jpg"
            fill
          />
        </div>
      </div>
    </main>
  );
}
