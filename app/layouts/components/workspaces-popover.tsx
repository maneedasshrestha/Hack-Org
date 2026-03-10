"use client";
import type { ButtonBaseProps } from "@mui/material/ButtonBase";

import { useState, useCallback, useEffect } from "react";
import { varAlpha } from "minimal-shared/utils";

import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import MenuList from "@mui/material/MenuList";
import ButtonBase from "@mui/material/ButtonBase";
import MenuItem, { menuItemClasses } from "@mui/material/MenuItem";
import { Label } from "@/components/label";
import { Iconify } from "@/components/iconify";

// ----------------------------------------------------------------------

export type WorkspacesPopoverProps = ButtonBaseProps & {
  data?: {
    id: string;
    name: string;
    logo: string;
    plan: string;
    joinCode?: string;
    website?: any;
  }[];
};

export function WorkspacesPopover({
  data = [],
  sx,
  ...other
}: WorkspacesPopoverProps) {
  const [workspace, setWorkspace] = useState(data[0]);

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(
    null,
  );

  // Update workspace when data changes
  useEffect(() => {
    if (data.length > 0) {
      const selectedId = localStorage.getItem("selectedHackathonId");
      const selected = data.find((w) => w.id === selectedId) || data[0];
      setWorkspace(selected);
    }
  }, [data]);

  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setOpenPopover(event.currentTarget);
    },
    [],
  );

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleChangeWorkspace = useCallback(
    (newValue: (typeof data)[number]) => {
      setWorkspace(newValue);
      // Store selected hackathon in localStorage
      localStorage.setItem("selectedHackathonId", newValue.id);
      localStorage.setItem("selectedHackathonName", newValue.name);
      if (newValue.website?.id) {
        localStorage.setItem("currentWebsiteId", newValue.website.id);
      }
      handleClosePopover();
      // Trigger a custom event for other components to listen to
      window.dispatchEvent(new CustomEvent("hackathonChanged", { detail: newValue }));
    },
    [handleClosePopover],
  );

  const renderAvatar = (alt: string, src: string) => (
    <Box
      component="img"
      alt={alt}
      src={src}
      sx={{ width: 24, height: 24, borderRadius: "50%" }}
    />
  );

  const renderLabel = (plan: string) => (
    <Label color={plan === "Member" ? "default" : "info"}>{plan}</Label>
  );

  // Show placeholder if no hackathons
  if (data.length === 0) {
    return (
      <ButtonBase
        disableRipple
        sx={{
          pl: 2,
          py: 3,
          gap: 1.5,
          pr: 1.5,
          width: 1,
          borderRadius: 1.5,
          textAlign: "left",
          justifyContent: "flex-start",
          bgcolor: (theme) =>
            varAlpha(theme.vars.palette.grey["500Channel"], 0.08),
          ...sx,
        }}
        {...other}
      >
        <Box
          component="span"
          sx={{
            gap: 1,
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            typography: "body2",
            fontWeight: "fontWeightSemiBold",
          }}
        >
          No Hackathons
        </Box>
      </ButtonBase>
    );
  }

  return (
    <>
      <ButtonBase
        disableRipple
        onClick={handleOpenPopover}
        sx={{
          pl: 2,
          py: 3,
          gap: 1.5,
          pr: 1.5,
          width: 1,
          borderRadius: 1.5,
          textAlign: "left",
          justifyContent: "flex-start",
          bgcolor: (theme) =>
            varAlpha(theme.vars.palette.grey["500Channel"], 0.08),
          ...sx,
        }}
        {...other}
      >
        {renderAvatar(workspace?.name || "Hackathon", workspace?.logo || "/assets/icons/workspaces/logo-1.webp")}

        <Box
          sx={{
            gap: 1,
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            typography: "body2",
            fontWeight: "fontWeightSemiBold",
          }}
        >
          {workspace?.name}
          {renderLabel(workspace?.plan || "Member")}
        </Box>

        <Iconify
          width={16}
          icon="carbon:chevron-sort"
          sx={{ color: "text.disabled" }}
        />
      </ButtonBase>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 260,
            display: "flex",
            flexDirection: "column",
            [`& .${menuItemClasses.root}`]: {
              p: 1.5,
              gap: 1.5,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: {
                bgcolor: "action.selected",
                fontWeight: "fontWeightSemiBold",
              },
            },
          }}
        >
          {data.map((option) => (
            <MenuItem
              key={option.id}
              selected={option.id === workspace?.id}
              onClick={() => handleChangeWorkspace(option)}
            >
              {renderAvatar(option.name, option.logo)}

              <Box component="span" sx={{ flexGrow: 1 }}>
                {option.name}
              </Box>

              {renderLabel(option.plan)}
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </>
  );
}
