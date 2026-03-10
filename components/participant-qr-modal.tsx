"use client";

import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import { Iconify } from "@/components/iconify";
import QRCodeDisplay from "./qr-code-display";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ParticipantQRModalProps {
  open: boolean;
  onClose: () => void;
  participantId: string;
  registrationId?: string;
}

interface ParticipantData {
  id: string;
  name: string;
  email: string;
  image?: string;
  githubUsername?: string;
  status: string;
  qrIdentifier?: string;
  registeredAt: string;
  hackathon?: {
    id: number;
    title: string;
    slug: string;
  };
  claimedEntitlements?: Array<{
    name: string;
    claimedAt: string;
    claimedBy: string;
  }>;
}

export default function ParticipantQRModal({
  open,
  onClose,
  participantId,
  registrationId,
}: ParticipantQRModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participant, setParticipant] = useState<ParticipantData | null>(null);

  useEffect(() => {
    if (open && registrationId) {
      fetchParticipantData();
    }
  }, [open, registrationId]);

  const fetchParticipantData = async () => {
    if (!registrationId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch registration details with QR identifier
      const response = await fetch(
        `${API_URL}/registration/${registrationId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch participant data");
      }

      const data = await response.json();

      if (data.registration) {
        setParticipant({
          id: data.registration.user?.id?.toString() || participantId,
          name: data.registration.user?.name || "Unknown",
          email: data.registration.user?.email || "",
          image: data.registration.user?.image,
          githubUsername: data.registration.user?.githubUsername,
          status: data.registration.status,
          qrIdentifier: data.registration.qrIdentifier,
          registeredAt: data.registration.registeredAt,
          hackathon: data.registration.website,
        });
      }
    } catch (err) {
      console.error("Error fetching participant:", err);
      setError("Failed to load participant data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Participant QR Code
          <IconButton onClick={onClose} size="small">
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : participant ? (
          <Stack spacing={3}>
            {/* Participant Info */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={participant.image}
                alt={participant.name}
                sx={{ width: 64, height: 64 }}
              >
                {participant.name?.charAt(0)?.toUpperCase() || "?"}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">{participant.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {participant.email}
                </Typography>
                {participant.githubUsername && (
                  <Typography variant="caption" color="textSecondary">
                    @{participant.githubUsername}
                  </Typography>
                )}
              </Box>
              <Chip
                label={participant.status}
                color={getStatusColor(participant.status) as any}
                size="small"
              />
            </Box>

            {/* Hackathon Info */}
            {participant.hackathon && (
              <>
                <Divider />
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Hackathon
                  </Typography>
                  <Typography variant="body1">
                    {participant.hackathon.title}
                  </Typography>
                </Box>
              </>
            )}

            <Divider />

            {/* QR Code */}
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <QRCodeDisplay
                data={participant.qrIdentifier || ""}
                size={200}
                title="Scan for Entitlement Verification"
              />
            </Box>

            {/* Registration Info */}
            <Box>
              <Typography variant="caption" color="textSecondary">
                Registered
              </Typography>
              <Typography variant="body2">
                {formatDate(participant.registeredAt)}
              </Typography>
            </Box>

            {/* Claimed Entitlements */}
            {participant.claimedEntitlements &&
              participant.claimedEntitlements.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      Claimed Entitlements
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {participant.claimedEntitlements.map((claim, index) => (
                        <Chip
                          key={index}
                          label={claim.name}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                </>
              )}

            {participant.status !== "APPROVED" && (
              <Alert severity="warning">
                This participant is not yet approved. QR code will be generated
                upon approval.
              </Alert>
            )}
          </Stack>
        ) : (
          <Alert severity="info">No participant data available</Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {participant?.qrIdentifier && (
          <Button variant="contained" onClick={handlePrint}>
            Print QR
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}