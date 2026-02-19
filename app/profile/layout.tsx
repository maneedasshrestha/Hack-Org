"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

import { _notifications } from "@/app/_mock";
import { AccountPopover } from "@/app/layouts/components/account-popover";
import { NotificationsPopover } from "@/app/layouts/components/notifications-popover";
import { Searchbar } from "@/app/layouts/components/searchbar";
import { HeaderSection } from "@/app/layouts/core/header-section";
import { LayoutSection } from "@/app/layouts/core/layout-section";
import { MainSection } from "@/app/layouts/core/main-section";
import { dashboardLayoutVars } from "@/app/layouts/dashboard/css-vars";
import { _account } from "@/app/layouts/nav-config-account";

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  const header = (
    <HeaderSection
      disableElevation
      slots={{
        topArea: (
          <Alert severity="info" sx={{ display: "none", borderRadius: 0 }}>
            This is an info Alert.
          </Alert>
        ),
        rightArea: (
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0, sm: 0.75 } }}>
            <Searchbar />
            <NotificationsPopover data={_notifications} />
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
