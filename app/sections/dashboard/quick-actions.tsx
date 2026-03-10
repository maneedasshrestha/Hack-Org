"use client";

import type { CardProps } from "@mui/material/Card";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import CardHeader from "@mui/material/CardHeader";
import Stack from "@mui/material/Stack";
import { Iconify } from "@/components/iconify";
import { useRouter } from "next/navigation";

// ----------------------------------------------------------------------

type QuickAction = {
  label: string;
  icon: string;
  path: string;
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Create Hackathon",
    icon: "mingcute:add-line",
    path: "/website",
    color: "primary",
  },
  {
    label: "View Participants",
    icon: "solar:users-group-rounded-bold",
    path: "/user",
    color: "info",
  },
  {
    label: "Manage Mentors",
    icon: "mdi:account-school",
    path: "/mentors",
    color: "secondary",
  },
  {
    label: "Send Emails",
    icon: "solar:letter-bold",
    path: "/mail",
    color: "success",
  },
];

type QuickActionsProps = CardProps & {
  title?: string;
  subheader?: string;
};

export function QuickActions({
  title = "Quick Actions",
  subheader = "Shortcuts to common tasks",
  sx,
  ...other
}: QuickActionsProps) {
  const router = useRouter();

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Stack spacing={1.5} sx={{ p: 3 }}>
        {QUICK_ACTIONS.map((action) => (
          <Button
            key={action.path}
            variant="outlined"
            color={action.color}
            startIcon={<Iconify icon={action.icon} />}
            onClick={() => router.push(action.path)}
            sx={{
              justifyContent: "flex-start",
              py: 1.5,
              "&:hover": {
                bgcolor: `${action.color}.lighter`,
              },
            }}
          >
            {action.label}
          </Button>
        ))}
      </Stack>
    </Card>
  );
}