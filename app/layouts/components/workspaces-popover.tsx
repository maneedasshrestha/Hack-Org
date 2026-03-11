"use client";
import type { ButtonBaseProps } from "@mui/material/ButtonBase";

import { useState, useCallback } from "react";
import { varAlpha } from "minimal-shared/utils";

import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import MenuList from "@mui/material/MenuList";
import ButtonBase from "@mui/material/ButtonBase";
import MenuItem, { menuItemClasses } from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { Label } from "@/components/label";
import { Iconify } from "@/components/iconify";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ----------------------------------------------------------------------

export type WorkspacesPopoverProps = ButtonBaseProps & {
  selectedHackathonId?: string | null;
  selectedHackathonName?: string | null;
  hackathons: {
    id: string;
    name: string;
    logo: string;
    plan: string;
    joinCode?: string;
    website?: any;
  }[];
  onHackathonChange?: (id: string, name: string) => void;
  onHackathonJoined?: () => void;
};

export function WorkspacesPopover({
  selectedHackathonId,
  selectedHackathonName,
  hackathons,
  onHackathonChange,
  onHackathonJoined,
  sx,
  ...other
}: WorkspacesPopoverProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Find the currently selected workspace
  const workspace = hackathons.find(h => h.id === selectedHackathonId) || hackathons[0];

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
    (newValue: (typeof hackathons)[number]) => {
      handleClosePopover();
      // Call the parent's handler to update global state
      if (onHackathonChange) {
        onHackathonChange(newValue.id, newValue.name);
      }
    },
    [handleClosePopover, onHackathonChange],
  );

  const handleShareCode = useCallback(
    (event: React.MouseEvent, joinCode: string, hackathonName: string) => {
      event.stopPropagation();
      if (joinCode) {
        navigator.clipboard.writeText(joinCode);
        toast.success(`Hackathon code copied!`, {
          description: `${hackathonName} - ${joinCode}`,
        });
      } else {
        toast.error("No join code available for this hackathon");
      }
    },
    [],
  );

  const handleOpenJoinDialog = useCallback(() => {
    handleClosePopover();
    setJoinDialogOpen(true);
    setJoinCode("");
    setJoinError(null);
  }, [handleClosePopover]);

  const handleCloseJoinDialog = useCallback(() => {
    setJoinDialogOpen(false);
    setJoinCode("");
    setJoinError(null);
  }, []);

  const handleJoinHackathon = useCallback(async () => {
    const adminId = localStorage.getItem("adminId");
    if (!adminId) {
      setJoinError("Please log in first");
      return;
    }

    if (!joinCode.trim()) {
      setJoinError("Join code is required");
      return;
    }

    setJoinLoading(true);
    setJoinError(null);

    try {
      const response = await fetch(`${API_URL}/hackathon/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: parseInt(adminId),
          joinCode: joinCode.trim().toUpperCase(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to join hackathon");
      }

      // Store hackathon info in localStorage
      localStorage.setItem("selectedHackathonId", result.hackathon.id.toString());
      localStorage.setItem("selectedHackathonName", result.hackathon.name);
      if (result.hackathon.website?.id) {
        localStorage.setItem("currentWebsiteId", result.hackathon.website.id.toString());
      }

      toast.success(`Successfully joined "${result.hackathon.name}"!`);

      handleCloseJoinDialog();

      // Notify parent to refresh hackathons list
      if (onHackathonJoined) {
        onHackathonJoined();
      }

      // Trigger a custom event for other components to listen to
      window.dispatchEvent(new CustomEvent("hackathonJoined", { detail: result.hackathon }));
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setJoinLoading(false);
    }
  }, [joinCode, handleCloseJoinDialog, onHackathonJoined]);

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
  if (hackathons.length === 0) {
    return (
      <>
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
        <Button
          fullWidth
          variant="soft"
          startIcon={<Iconify icon="mdi:plus" />}
          onClick={handleOpenJoinDialog}
          sx={{ mt: 1 }}
        >
          Join Hackathon
        </Button>

        {/* Join Hackathon Dialog */}
        <Dialog open={joinDialogOpen} onClose={handleCloseJoinDialog} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Iconify icon="mdi:account-plus" />
            Join Hackathon
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Join Code"
                placeholder="ABCD1234"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                inputProps={{ maxLength: 8, style: { textTransform: "uppercase" } }}
                disabled={joinLoading}
                sx={{ mb: 2 }}
                helperText="Enter the 8-character code shared by the hackathon organizer"
              />

              {joinError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {joinError}
                </Alert>
              )}

              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={handleCloseJoinDialog} disabled={joinLoading}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleJoinHackathon}
                  disabled={joinLoading || !joinCode.trim()}
                  startIcon={joinLoading ? <CircularProgress size={16} /> : null}
                >
                  {joinLoading ? "Joining..." : "Join"}
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Box sx={{ position: "relative", ...sx }} {...other}>
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
          }}
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

        {/* Quick share button for current hackathon */}
        {workspace?.joinCode && (
          <Tooltip title="Share hackathon code" arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleShareCode(e, workspace.joinCode!, workspace.name);
              }}
              sx={{
                position: "absolute",
                right: 32,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <Iconify width={16} icon="solar:share-bold" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

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
            width: 280,
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
          {hackathons.map((option) => (
            <MenuItem
              key={option.id}
              selected={option.id === selectedHackathonId}
              onClick={() => handleChangeWorkspace(option)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1, minWidth: 0 }}>
                {renderAvatar(option.name, option.logo)}

                <Box component="span" sx={{ flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {option.name}
                </Box>

                {renderLabel(option.plan)}
              </Box>

              {option.joinCode && (
                <Tooltip title="Copy join code" arrow>
                  <IconButton
                    size="small"
                    onClick={(e) => handleShareCode(e, option.joinCode!, option.name)}
                    sx={{
                      ml: 1,
                      flexShrink: 0,
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <Iconify width={18} icon="solar:copy-bold" />
                  </IconButton>
                </Tooltip>
              )}
            </MenuItem>
          ))}

          {/* Divider and Join Button */}
          <Box sx={{ borderTop: 1, borderColor: "divider", mt: 0.5, pt: 0.5 }}>
            <MenuItem
              onClick={handleOpenJoinDialog}
              sx={{
                color: "primary.main",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <Iconify icon="mdi:plus-circle" width={20} sx={{ mr: 1.5 }} />
              Join another hackathon
            </MenuItem>
          </Box>
        </MenuList>
      </Popover>

      {/* Join Hackathon Dialog */}
      <Dialog open={joinDialogOpen} onClose={handleCloseJoinDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Iconify icon="mdi:account-plus" />
          Join Hackathon
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Join Code"
              placeholder="ABCD1234"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              inputProps={{ maxLength: 8, style: { textTransform: "uppercase" } }}
              disabled={joinLoading}
              sx={{ mb: 2 }}
              helperText="Enter the 8-character code shared by the hackathon organizer"
            />

            {joinError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {joinError}
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={handleCloseJoinDialog} disabled={joinLoading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleJoinHackathon}
                disabled={joinLoading || !joinCode.trim()}
                startIcon={joinLoading ? <CircularProgress size={16} /> : null}
              >
                {joinLoading ? "Joining..." : "Join"}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}