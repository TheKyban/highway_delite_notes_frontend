"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  dob: z.string().min(1, "Date of birth is required"),
  otp: z.string().optional(),
});

export default function SignUpClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      dob: "",
      otp: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      if (!otpSent) {
        // Send OTP
        const response = await apiService.signup(values);

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
    <main className="flex min-h-screen w-full bg-white">
      {/* Form Section */}
      <div className="flex w-full flex-1 flex-col p-4 lg:p-8">
        {/* Header - Always at top */}
        <header className="flex items-center justify-center lg:justify-start w-full mb-8 lg:mb-16">
          <div className="flex items-center gap-3">
            <StarIcon className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-semibold text-[#232323]">HD</h1>
          </div>
        </header>

        {/* Form - Centered */}
        <div className="flex flex-1 items-center justify-center">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full max-w-sm lg:max-w-md space-y-6 lg:space-y-8"
            >
              {/* Title */}
              <div className="text-center lg:text-left space-y-3">
                <h2 className="text-3xl lg:text-4xl font-bold text-[#232323]">
                  {otpSent ? "Verify OTP" : "Sign up"}
                </h2>
                <p className="text-base lg:text-lg text-gray-500">
                  {otpSent
                    ? "Enter the OTP sent to your email"
                    : "Sign up to enjoy the features of HD"}
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
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormControl>
                        <Input
                          id="name"
                          {...field}
                          className="h-14 px-4 text-base lg:text-lg border-2 rounded-lg peer border-blue-500"
                          placeholder=" "
                          disabled={isLoading || otpSent}
                        />
                      </FormControl>
                      <Label
                        htmlFor="name"
                        className="absolute left-3 -top-2.5 bg-white px-1 text-sm font-medium text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 "
                      >
                        Your Name
                      </Label>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />

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
                          className="h-14 px-4 text-base lg:text-lg border-2 rounded-lg border-blue-500 peer"
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

                {/* Date of Birth */}
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormControl>
                        <Input
                          id="dob"
                          type="date"
                          {...field}
                          className="h-14 px-4 text-base lg:text-lg border-2 rounded-lg peer border-blue-500"
                          disabled={isLoading || otpSent}
                        />
                      </FormControl>
                      <Label
                        htmlFor="dob"
                        className="absolute left-3 -top-2.5 bg-white px-1 text-sm font-medium text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                      >
                        Date of Birth
                      </Label>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />

                {otpSent && (
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
                            className="h-14 px-4 text-base lg:text-lg border-2 rounded-lg border-blue-500 peer"
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
                )}
              </div>

              {/* Action */}
              <div className="space-y-6">
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

                <p className="text-center text-sm lg:text-lg text-gray-600">
                  Already have an account?{" "}
                  <button
                    onClick={() => router.push("/signin")}
                    className="font-semibold text-[#357aff] underline hover:text-[#357aff]/90"
                  >
                    Sign in
                  </button>
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
            alt="Promotional banner for the sign up page"
            src="/img19.jpg"
            fill
            sizes="(max-width: 1024px) 0vw, 50vw"
            priority
          />
        </div>
      </div>
    </main>
  );
}
