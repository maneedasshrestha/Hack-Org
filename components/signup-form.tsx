"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Iconify } from "@/components/iconify";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-4 w-70", className)} {...props}>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium leading-none">
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            required
            className="h-6"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium leading-none">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            required
            className="h-6"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium leading-none"
          >
            Password
          </label>
          <Input id="password" type="password" required className="h-6" />
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
            type="password"
            required
            className="h-6"
          />
        </div>
      </div>

      <Button type="submit" className="w-full h-7 mt-1">
        Create Account
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
