"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";

import { _account } from "@/app/layouts/nav-config-account";
import { _notifications } from "@/app/_mock";
import { dashboardLayoutVars } from "@/app/layouts/dashboard/css-vars";
import { LayoutSection } from "@/app/layouts/core/layout-section";
import { HeaderSection } from "@/app/layouts/core/header-section";
import { MainSection } from "@/app/layouts/core/main-section";
import { AccountPopover } from "@/app/layouts/components/account-popover";
import { Logo } from "@/components/logo";

export default function WorkspaceDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams() as { slug?: string };
  const slug = params?.slug;
  const theme = useTheme();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/w/${slug}/login`);
    }
  }, [status, router, slug]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-current border-r-transparent text-blue-600"
            role="status"
          />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const header = (
    <HeaderSection
      disableElevation
      slots={{
        topArea: (
          <Alert severity="info" sx={{ display: "none", borderRadius: 0 }}>
            This is an info Alert.
          </Alert>
        ),
        leftArea: <Logo />,
        rightArea: (
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0, sm: 0.75 } }}>
            <AccountPopover data={_account} />
          </Box>
        ),
      }}
      slotProps={{ container: { maxWidth: false } }}
    />
  );

  return (
    <LayoutSection
      headerSection={header}
      cssVars={dashboardLayoutVars(theme)}
    >
      <MainSection>{children}</MainSection>
    </LayoutSection>
  );
}
