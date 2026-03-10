"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Copy as CopyIcon, Check as CheckIcon } from "lucide-react";
// Copy-to-clipboard button with icon and popup
function CopyButton({ text, onCopy }: { text: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      setCopied(false);
    }
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        marginLeft: 8,
        padding: "2px 8px",
        borderRadius: 4,
        border: "1px solid #ccc",
        background: copied ? "#d1fae5" : "#f9fafb",
        cursor: "pointer",
        fontSize: 12,
        display: "flex",
        alignItems: "center",
      }}
      aria-label="Copy group code"
    >
      {copied ? (
        <CheckIcon size={18} color="#34d399" strokeWidth={2.2} />
      ) : (
        <CopyIcon size={18} color="#6b7280" strokeWidth={2.2} />
      )}
    </button>
  );
}
import { Button } from "@/components/ui/button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
// import { _users } from "@/app/_mock";

const MAX_GROUP_SIZE = 4;

const DashBoardParticipant = () => {
  const { data: session, status } = useSession();
  const [showCopiedPopup, setShowCopiedPopup] = useState(false);
  // Group state (keep for now, but focus on user details)
  const [group, setGroup] = useState<{
    name: string;
    members: {
      name: string;
      avatarUrl: string;
      id: string;
      isLeader?: boolean;
    }[];
    leaderId: string;
  } | null>(null);
  const [modal, setModal] = useState<null | "join" | "create">(null);
  const [groupName, setGroupName] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [error, setError] = useState("");

  // Leave group handler
  const handleLeaveGroup = () => {
    setGroup(null);
  };

  // Use authenticated user
  const user = session?.user;

  // Modal handlers (kept for group logic)
  const openJoin = () => {
    setModal("join");
    setGroupCode("");
    setError("");
  };
  const openCreate = () => {
    setModal("create");
    setGroupName("");
    setError("");
  };
  const closeModal = () => setModal(null);

  // Simulate join/create group (kept for now)
  const handleJoin = () => {
    if (!groupCode.trim()) {
      setError("Please enter a group code.");
      return;
    }
    setGroup({
      name: `Group ${groupCode}`,
      members: [
        {
          name: user?.name || "Participant",
          avatarUrl: user?.image || "",
          id: user?.id || "user-id",
          isLeader: false,
        },
        // ...add more mock members if needed
      ],
      leaderId: "leader-id",
    });
    setModal(null);
  };
  const handleCreate = () => {
    if (!groupName.trim()) {
      setError("Please enter a group name.");
      return;
    }
    setGroup({
      name: groupName,
      members: [
        {
          name: user?.name || "Participant",
          avatarUrl: user?.image || "",
          id: user?.id || "user-id",
          isLeader: true,
        },
      ],
      leaderId: user?.id || "user-id",
    });
    setModal(null);
  };

  // Simulate apply for hackathon
  const handleApply = () => {
    alert("Applied for Hackathon!");
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-10 px-4">
        <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <Typography variant="h5">Loading...</Typography>
        </div>
      </div>
    );
  }

  // UI
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-10 px-4">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 flex flex-col items-center">
        {/* User Profile Section */}
        <Avatar
          src={user?.image || ""}
          alt={user?.name || "User"}
          sx={{ width: 64, height: 64, mb: 2 }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography
          variant="h4"
          className="font-bold mb-2 text-gray-900 dark:text-white"
        >
          Welcome, {user?.name || "Participant"}!
        </Typography>
        <Typography className="mb-2 text-gray-600 dark:text-gray-300">
          <span className="font-semibold">Email:</span> {user?.email || "—"}
        </Typography>
        {user?.username && (
          <Typography className="mb-2 text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Username:</span> @{user.username}
          </Typography>
        )}
        <Typography className="mb-4 text-gray-600 dark:text-gray-300">
          <span className="font-semibold">Account Status:</span> Active
        </Typography>

        <div className="h-2"></div>

        {/* Group state (kept for now) */}
        {!group && (
          <div className="flex gap-4 w-full max-w-xl justify-center">
            <Button
              className="flex-1 min-w-0"
              onClick={openJoin}
              variant="default"
              size="lg"
            >
              Join Group
            </Button>
            <Button
              className="flex-1 min-w-0"
              onClick={openCreate}
              variant="secondary"
              size="lg"
            >
              Create Group
            </Button>
          </div>
        )}

        {/* Group info (kept for now) */}
        {group && (
          <div className="w-full mt-6">
            <Typography
              variant="h6"
              className="mb-2 text-gray-900 dark:text-white"
            >
              Group: <span className="font-semibold">{group.name}</span>
            </Typography>
            {/* Group Code Portion */}
            <div className="flex items-center mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-200">
                Code:
              </span>
              <span className="ml-2 font-mono text-base">
                {group.name.replace(/[^A-Z0-9]/gi, "").slice(0, 8) ||
                  "CODE1234"}
              </span>
              <CopyButton
                text={
                  group.name.replace(/[^A-Z0-9]/gi, "").slice(0, 8) ||
                  "CODE1234"
                }
                onCopy={() => {
                  setShowCopiedPopup(true);
                  setTimeout(() => setShowCopiedPopup(false), 1500);
                }}
              />
            </div>
            {/* Copied popup */}
            {showCopiedPopup && (
              <div
                style={{
                  position: "fixed",
                  top: 24,
                  right: 24,
                  background: "#34d399",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  zIndex: 1000,
                  fontWeight: 500,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <CheckIcon
                  size={20}
                  color="white"
                  strokeWidth={2.2}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "50%",
                  }}
                />
                Copied to clipboard!
              </div>
            )}
            <Typography className="mb-2 text-gray-600 dark:text-gray-300">
              Members ({group.members.length}/{MAX_GROUP_SIZE}):
            </Typography>
            <div className="h-1"></div>
            <Stack direction="row" spacing={2} className="mb-4">
              {group.members.map((m) => (
                <div key={m.id} className="flex flex-col items-center">
                  <Avatar
                    src={m.avatarUrl}
                    alt={m.name}
                    sx={{ width: 48, height: 48 }}
                  />
                  <span className="text-xs mt-1 text-gray-700 dark:text-gray-200">
                    {m.name.split(" ")[0]}
                    {m.isLeader && (
                      <span className="ml-1 text-blue-500 font-bold">★</span>
                    )}
                  </span>
                </div>
              ))}
              {/* Empty slots */}
              {Array.from({
                length: MAX_GROUP_SIZE - group.members.length,
              }).map((_, i) => (
                <div key={i} className="flex flex-col items-center opacity-40">
                  <Avatar sx={{ width: 48, height: 48, bgcolor: "#e0e0e0" }} />
                  <span className="text-xs mt-1">Empty</span>
                </div>
              ))}
            </Stack>
            {/* Leave Group Button */}
            <Button
              onClick={handleLeaveGroup}
              variant="destructive"
              size="sm"
              className="w-full mb-2"
            >
              Leave Group
            </Button>
            {/* Only leader, group size >2 */}
            {group.leaderId === (user?.id || "user-id") &&
              group.members.length > 2 && (
                <Button
                  onClick={handleApply}
                  variant="default"
                  size="lg"
                  className="w-full mt-2"
                >
                  Apply for Hackathon
                </Button>
              )}
          </div>
        )}
      </div>

      {/* Modal for join/create (kept for now) */}
      <Dialog open={!!modal} onClose={closeModal}>
        <DialogTitle>
          {modal === "join" ? "Join a Group" : "Create a Group"}
        </DialogTitle>
        <DialogContent className="flex flex-col gap-4 mt-2">
          {modal === "join" ? (
            <TextField
              label="Group Code"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              autoFocus
              fullWidth
              variant="outlined"
              error={!!error}
              helperText={error}
            />
          ) : (
            <TextField
              label="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              autoFocus
              fullWidth
              variant="outlined"
              error={!!error}
              helperText={error}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="ghost" onClick={closeModal}>
            Cancel
          </Button>
          {modal === "join" ? (
            <Button variant="default" onClick={handleJoin}>
              Join
            </Button>
          ) : (
            <Button variant="default" onClick={handleCreate}>
              Create
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DashBoardParticipant;
