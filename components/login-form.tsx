"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Iconify } from "@/components/iconify";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-4", className)} {...props}>
      <div className="space-y-3">
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
          <Input id="password" type="password" required className="h-6" />
        </div>
      </div>

      <Button type="submit" className="w-full h-7 mt-1">
        Sign In
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
