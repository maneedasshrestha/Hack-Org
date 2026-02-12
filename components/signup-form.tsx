"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Iconify } from "@/components/iconify";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullname: formData.get("fullname") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    console.log("Sending data:", data);

    // Validate password confirmation
    const confirmPassword = formData.get("confirm-password") as string;
    if (data.password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Sending request to backend...");
      const response = await fetch(
        "https://hackorgbackend.onrender.com/api/createadmin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      const result = await response.json();
      console.log("Response:", result);

      if (!response.ok) {
        console.error("Error details:", result);
        throw new Error(
          result.message || result.error || "Failed to create account",
        );
      }

      console.log("Account created successfully:", result);

      // Redirect to login page or dashboard
      window.location.href = "/login";
    } catch (err) {
      console.error("Full error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-4 w-70", className)}
      {...props}
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium leading-none">
            Full Name
          </label>
          <Input
            id="name"
            name="fullname"
            type="text"
            placeholder="John Doe"
            required
            className="h-6"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium leading-none">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            className="h-6"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium leading-none"
          >
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="h-6"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="confirm-password"
            className="text-sm font-medium leading-none"
          >
            Confirm Password
          </label>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            required
            className="h-6"
            disabled={isLoading}
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full h-7 mt-1" disabled={isLoading}>
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground mt-2">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
