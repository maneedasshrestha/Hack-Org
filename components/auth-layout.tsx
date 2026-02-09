"use client";

import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function AuthLayout({
  children,
  title,
  description,
  className,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen max-h-screen lg:grid-cols-2 bg-background overflow-hidden">
      <div className="flex flex-col gap-4 p-6 md:p-8 z-10 overflow-y-auto">
        <div className="flex justify-center md:justify-start h-2">
          <Link href="/" className="flex items-center tracking-tight">
            <img
              className="w-auto h-6"
              src="brand_images/hackorg_banner.png"
              alt=""
            />
          </Link>
        </div>
        {/* main form content */}
        <div className="flex flex-1 items-center justify-center py-4">
          <div className={cn("w-xl max-w-95 space-y-5", className)}>
            <div className="space-y-1.5 text-center md:text-left">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent z-10" />
        <img
          src="/assets/auth-bg.jpg"
          alt="Authentication Background"
          className="absolute inset-0 h-full w-full object-cover grayscale-[0.2] contrast-[1.1]"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-5" />

        <div className="absolute bottom-8 left-8 right-8 z-20 space-y-2.5">
          <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
            Join the community
          </div>
          <h2 className="text-2xl font-bold text-white leading-tight">
            The ultimate platform for <br />
            <span className="text-primary-foreground">
              hackathon innovation
            </span>
          </h2>
          <p className="text-white/80 max-w-md text-sm leading-relaxed">
            Connect with mentors, find teammates, and build the future of
            technology.
          </p>
        </div>
      </div>
    </div>
  );
}
