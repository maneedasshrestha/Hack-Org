"use client";

import { useSession } from "next-auth/react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import { DashboardContent } from "../layouts/dashboard";
import { Iconify } from "@/components/iconify";
import type { IconifyProps } from "@/components/iconify";

// ----------------------------------------------------------------------

type ProfileFieldProps = {
  icon: IconifyProps["icon"];
  label: string;
  value?: string | null;
};

function ProfileField({ icon, label, value }: ProfileFieldProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 1.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "action.selected",
          color: "primary.main",
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={22} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight="fontWeightMedium" noWrap>
          {value || "—"}
        </Typography>
      </Box>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <DashboardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  const user = session?.user;

  return (
    <DashboardContent maxWidth="lg">
      {/* Page title */}
      <Typography variant="h4" sx={{ mb: 4 }}>
        Profile
      </Typography>

      <Card
        sx={{
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Banner */}
        <Box
          sx={{
            height: 160,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.vars.palette.primary.dark} 0%, ${theme.vars.palette.primary.light} 100%)`,
          }}
        />

        {/* Avatar + name */}
        <Box sx={{ px: 3, pb: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "center", sm: "flex-end" }}
            spacing={2}
            sx={{ mt: "-56px", mb: 3 }}
          >
            <Avatar
              src={user?.image ?? ""}
              alt={user?.name ?? "User"}
              sx={{
                width: 112,
                height: 112,
                border: (theme) =>
                  `4px solid ${theme.vars.palette.background.paper}`,
                boxShadow: 4,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ pb: { sm: 1 } }}>
              <Typography variant="h5" fontWeight="fontWeightBold">
                {user?.name ?? "Unknown User"}
              </Typography>
              {user?.username && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  @{user.username}
                </Typography>
              )}
            </Box>
          </Stack>

          <Divider sx={{ mb: 3, borderStyle: "dashed" }} />

          {/* Details grid */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            divider={
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderStyle: "dashed" }}
              />
            }
          >
            {/* Left column */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="overline"
                sx={{ color: "text.secondary", mb: 1, display: "block" }}
              >
                Account Info
              </Typography>

              <ProfileField
                icon="solar:pen-bold"
                label="Full Name"
                value={user?.name}
              />
              <ProfileField
                icon="solar:chat-round-dots-bold"
                label="Email Address"
                value={user?.email}
              />
              {user?.username && (
                <ProfileField
                  icon="socials:github"
                  label="GitHub Username"
                  value={user.username}
                />
              )}
            </Box>

            {/* Right column */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="overline"
                sx={{ color: "text.secondary", mb: 1, display: "block" }}
              >
                System Info
              </Typography>

              <ProfileField
                icon="solar:settings-bold-duotone"
                label="User ID"
                value={user?.id}
              />
              <ProfileField
                icon="solar:shield-keyhole-bold-duotone"
                label="Authentication Provider"
                value="GitHub"
              />
              <ProfileField
                icon="solar:check-circle-bold"
                label="Account Status"
                value="Active"
              />
            </Box>
          </Stack>
        </Box>
      </Card>
    </DashboardContent>
  );
}
