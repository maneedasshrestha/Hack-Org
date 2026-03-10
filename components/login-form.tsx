"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Iconify } from "@/components/iconify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch(
        `${API_URL}/loginadmin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      // Store JWT in localStorage
      localStorage.setItem("token", result.token);
      localStorage.setItem("adminId", result.id);
      localStorage.setItem("adminEmail", result.email);
      localStorage.setItem("adminName", result.fullname);
      // Clear any previous website ID to prevent conflicts
      localStorage.removeItem("currentWebsiteId");
      console.log("Token obtained:", result.token);

      // Check onboarding status and redirect accordingly
      if (result.onboardingCompleted === false) {
        window.location.href = "/onboarding";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-4", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="space-y-3">
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
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none"
            >
              Password
            </label>
            <Link
              href="#"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="h-6"
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full h-7 mt-1" disabled={isLoading}>
        {isLoading ? "Signing In..." : "Sign In"}
      </Button>

      <p className="text-center text-sm text-muted-foreground mt-2">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary hover:underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
