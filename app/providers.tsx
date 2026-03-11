"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "./theme";
import { Toaster } from "@/components/ui/toaster";
import { HackathonProvider } from "@/contexts/HackathonContext";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <HackathonProvider>
          {children}
        </HackathonProvider>
      </SessionProvider>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
