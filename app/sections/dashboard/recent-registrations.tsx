"use client";

import type { CardProps } from "@mui/material/Card";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineDot from "@mui/lab/TimelineDot";
import { Label } from "@/components/label";
import { fToNow } from "@/app/utils/format-time";

// ----------------------------------------------------------------------

type RegistrationItem = {
  id: number;
  userName: string;
  userEmail: string;
  status: string;
  registeredAt: string;
  hackathonTitle: string;
  hackathonSlug: string;
};

type RecentRegistrationsProps = CardProps & {
  title?: string;
  subheader?: string;
  registrations: RegistrationItem[];
};

export function RecentRegistrations({
  title = "Recent Registrations",
  subheader,
  registrations,
  sx,
  ...other
}: RecentRegistrationsProps) {
  const getStatusColor = (status: string): "success" | "warning" | "error" => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "error";
      case "PENDING":
      default:
        return "warning";
    }
  };

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />

      {registrations.length === 0 ? (
        <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
          <Box sx={{ typography: "body2" }}>No recent registrations</Box>
        </Box>
      ) : (
        <Timeline
          sx={{
            m: 0,
            p: 3,
            [`& .MuiTimelineItem-root:before`]: {
              flex: 0,
              padding: 0,
            },
          }}
        >
          {registrations.slice(0, 5).map((registration, index) => (
            <TimelineItem key={registration.id}>
              <TimelineSeparator>
                <TimelineDot
                  color={getStatusColor(registration.status)}
                  sx={{ width: 12, height: 12, m: 0.5 }}
                />
                {index < registrations.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent sx={{ pb: 3 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ typography: "subtitle2" }}>
                      {registration.userName}
                    </Box>
                    <Label
                      variant="soft"
                      color={getStatusColor(registration.status)}
                      sx={{ fontSize: 10 }}
                    >
                      {registration.status}
                    </Label>
                  </Box>

                  <Box sx={{ typography: "body2", color: "text.secondary" }}>
                    registered for{" "}
                    <Box component="span" sx={{ fontWeight: "fontWeightMedium" }}>
                      {registration.hackathonTitle}
                    </Box>
                  </Box>

                  <Box sx={{ typography: "caption", color: "text.disabled" }}>
                    {fToNow(registration.registeredAt)}
                  </Box>
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </Card>
  );
}