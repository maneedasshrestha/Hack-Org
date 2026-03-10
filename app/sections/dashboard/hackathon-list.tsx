"use client";

import type { CardProps } from "@mui/material/Card";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import CardHeader from "@mui/material/CardHeader";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import { Label } from "@/components/label";
import { Iconify } from "@/components/iconify";
import { fDate } from "@/app/utils/format-time";

// ----------------------------------------------------------------------

type HackathonItem = {
  id: number;
  title: string;
  slug: string;
  status: string;
  participantCount: number;
  mentorCount: number;
  updatedAt: string;
};

type HackathonListProps = CardProps & {
  title?: string;
  subheader?: string;
  hackathons: HackathonItem[];
  onHackathonClick?: (hackathon: HackathonItem) => void;
};

export function HackathonList({
  title = "Your Hackathons",
  subheader,
  hackathons,
  onHackathonClick,
  sx,
  ...other
}: HackathonListProps) {
  return (
    <Card sx={sx} {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          hackathons.length > 0 && (
            <Box sx={{ typography: "body2", color: "text.secondary", mr: 1 }}>
              {hackathons.length} total
            </Box>
          )
        }
      />

      {hackathons.length === 0 ? (
        <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
          <Iconify icon="mdi:calendar-blank" width={48} sx={{ mb: 1, opacity: 0.5 }} />
          <Box sx={{ typography: "body2" }}>No hackathons yet</Box>
        </Box>
      ) : (
        <Box sx={{ maxHeight: 360, overflow: "auto" }}>
          {hackathons.slice(0, 5).map((hackathon) => (
            <ListItemButton
              key={hackathon.id}
              onClick={() => onHackathonClick?.(hackathon)}
              sx={{
                py: 2,
                borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "primary.lighter", color: "primary.main" }}>
                  <Iconify icon="mdi:calendar-star" />
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        typography: "subtitle2",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 200,
                      }}
                    >
                      {hackathon.title}
                    </Box>
                    <Label
                      variant="soft"
                      color={hackathon.status === "PUBLISHED" ? "success" : "warning"}
                      sx={{ ml: "auto" }}
                    >
                      {hackathon.status}
                    </Label>
                  </Box>
                }
                secondary={
                  <Box
                    sx={{
                      mt: 0.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      typography: "caption",
                      color: "text.secondary",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Iconify icon="mdi:account-group" width={14} />
                      {hackathon.participantCount} participants
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Iconify icon="mdi:account-school" width={14} />
                      {hackathon.mentorCount} mentors
                    </Box>
                  </Box>
                }
              />
            </ListItemButton>
          ))}
        </Box>
      )}
    </Card>
  );
}