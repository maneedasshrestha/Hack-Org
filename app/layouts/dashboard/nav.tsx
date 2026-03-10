"use client";
import type { Theme, SxProps, Breakpoint } from "@mui/material/styles";

import { useEffect, useState } from "react";
import { varAlpha } from "minimal-shared/utils";

import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import { useTheme } from "@mui/material/styles";
import ListItemButton from "@mui/material/ListItemButton";
import Drawer, { drawerClasses } from "@mui/material/Drawer";

import { WorkspacesPopover } from "../components/workspaces-popover";

import type { NavItem } from "../nav-config-dashboard";
import type { WorkspacesPopoverProps } from "../components/workspaces-popover";
import { usePathname } from "@/app/routes/hooks";
import { Logo } from "@/components/logo";
import { Scrollbar } from "@/components/scrollbar";
import { RouterLink } from "@/app/routes/components";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ----------------------------------------------------------------------

export type NavContentProps = {
  data: NavItem[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  workspaces?: WorkspacesPopoverProps["data"];
  sx?: SxProps<Theme>;
};

export function NavDesktop({
  sx,
  data,
  slots,
  workspaces,
  layoutQuery,
}: NavContentProps & { layoutQuery: Breakpoint }) {
  const theme = useTheme();

  const [hackathons, setHackathons] = useState<WorkspacesPopoverProps["data"]>([]);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    const adminId = localStorage.getItem("adminId");
    if (!adminId) return;

    try {
      const response = await fetch(`${API_URL}/hackathon/my/${adminId}`);
      const result = await response.json();

      if (result.success && result.hackathons) {
        const workspaceData = result.hackathons.map((h: any) => ({
          id: h.id.toString(),
          name: h.name,
          logo: "/assets/icons/workspaces/logo-1.webp", // Default logo
          plan: h.role === "OWNER" ? "Owner" : "Member",
          joinCode: h.joinCode,
          website: h.website,
        }));
        setHackathons(workspaceData);

        // Set first hackathon as selected if none selected
        const selectedHackathonId = localStorage.getItem("selectedHackathonId");
        if (!selectedHackathonId && workspaceData.length > 0) {
          localStorage.setItem("selectedHackathonId", workspaceData[0].id);
          localStorage.setItem("selectedHackathonName", workspaceData[0].name);
        }
      }
    } catch (error) {
      console.error("Error fetching hackathons:", error);
    }
  };

  return (
    <Box
      sx={{
        pt: 2.5,
        px: 2.5,
        top: 0,
        left: 0,
        height: 1,
        display: "none",
        position: "fixed",
        flexDirection: "column",
        zIndex: "var(--layout-nav-zIndex)",
        width: "var(--layout-nav-vertical-width)",
        borderRight: `1px solid ${varAlpha(theme.vars.palette.grey["500Channel"], 0.12)}`,
        [theme.breakpoints.up(layoutQuery)]: {
          display: "flex",
        },
        ...sx,
      }}
    >
      <NavContent data={data} slots={slots} workspaces={hackathons} />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
  workspaces,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [hackathons, setHackathons] = useState<WorkspacesPopoverProps["data"]>([]);

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    const adminId = localStorage.getItem("adminId");
    if (!adminId) return;

    try {
      const response = await fetch(`${API_URL}/hackathon/my/${adminId}`);
      const result = await response.json();

      if (result.success && result.hackathons) {
        const workspaceData = result.hackathons.map((h: any) => ({
          id: h.id.toString(),
          name: h.name,
          logo: "/assets/icons/workspaces/logo-1.webp",
          plan: h.role === "OWNER" ? "Owner" : "Member",
          joinCode: h.joinCode,
          website: h.website,
        }));
        setHackathons(workspaceData);

        const selectedHackathonId = localStorage.getItem("selectedHackathonId");
        if (!selectedHackathonId && workspaceData.length > 0) {
          localStorage.setItem("selectedHackathonId", workspaceData[0].id);
          localStorage.setItem("selectedHackathonName", workspaceData[0].name);
        }
      }
    } catch (error) {
      console.error("Error fetching hackathons:", error);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: "unset",
          width: "var(--layout-nav-mobile-width)",
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} workspaces={hackathons} />
    </Drawer>
  );
}

// ----------------------------------------------------------------------

export function NavContent({ data, slots, workspaces = [], sx }: NavContentProps) {
  const pathname = usePathname();

  return (
    <>
      <Logo />

      {slots?.topArea}

      <WorkspacesPopover data={workspaces} sx={{ my: 2 }} />

      <Scrollbar fillContent>
        <Box
          component="nav"
          sx={[
            {
              display: "flex",
              flex: "1 1 auto",
              flexDirection: "column",
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <Box
            component="ul"
            sx={{
              gap: 0.5,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {data.map((item) => {
              const isActived = item.path === pathname;

              return (
                <ListItem disableGutters disablePadding key={item.title}>
                  <ListItemButton
                    disableGutters
                    component={RouterLink}
                    href={item.path}
                    sx={[
                      (theme) => ({
                        pl: 2,
                        py: 1,
                        gap: 2,
                        pr: 1.5,
                        borderRadius: 0.75,
                        typography: "body2",
                        fontWeight: "fontWeightMedium",
                        color: theme.vars.palette.text.secondary,
                        minHeight: 44,
                        ...(isActived && {
                          fontWeight: "fontWeightSemiBold",
                          color: theme.vars.palette.primary.main,
                          bgcolor: varAlpha(
                            theme.vars.palette.primary.mainChannel,
                            0.08,
                          ),
                          "&:hover": {
                            bgcolor: varAlpha(
                              theme.vars.palette.primary.mainChannel,
                              0.16,
                            ),
                          },
                        }),
                      }),
                    ]}
                  >
                    <Box component="span" sx={{ width: 24, height: 24 }}>
                      {item.icon}
                    </Box>

                    <Box component="span" sx={{ flexGrow: 1 }}>
                      {item.title}
                    </Box>

                    {item.info && item.info}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}
    </>
  );
}