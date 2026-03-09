"use client";

import { useState } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { DashboardContent } from "../layouts/dashboard";
import { Toaster, toast } from "sonner";
import QRScanner from "@/components/qr-scanner";
import { Scan as ScanIcon, Plus as PlusIcon } from "lucide-react";

interface Entitlement {
  id: string;
  name: string;
  createdAt: Date;
}

export default function BlogPage() {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newEntitlementName, setNewEntitlementName] = useState("");
  const [scanningEntitlementId, setScanningEntitlementId] = useState<
    string | null
  >(null);

  const handleCreateEntitlement = () => {
    if (!newEntitlementName.trim()) {
      toast.error("Please enter an entitlement name");
      return;
    }

    const newEntitlement: Entitlement = {
      id: Date.now().toString(),
      name: newEntitlementName,
      createdAt: new Date(),
    };

    setEntitlements([...entitlements, newEntitlement]);
    setNewEntitlementName("");
    setOpenCreateDialog(false);
    toast.success(`Entitlement "${newEntitlementName}" created successfully`);
  };

  const handleDeleteEntitlement = (id: string) => {
    const entitlement = entitlements.find((e) => e.id === id);
    setEntitlements(entitlements.filter((e) => e.id !== id));
    toast.success(`Entitlement deleted`);
  };

  const handleScanStart = (id: string) => {
    setScanningEntitlementId(id);
  };

  const handleScanClose = () => {
    setScanningEntitlementId(null);
  };

  const handleScanSuccess = (qrData: string) => {
    const entitlement = entitlements.find(
      (e) => e.id === scanningEntitlementId,
    );
    if (entitlement) {
      // Mock API call
      const isVerified = mockVerifyEntitlement(qrData, entitlement.name);
      if (isVerified) {
        toast.success(
          `${qrData} has received "${entitlement.name}" entitlement`,
          {
            position: "top-right",
            duration: 4000,
          },
        );
      } else {
        toast.error(
          `${qrData} has NOT received "${entitlement.name}" entitlement`,
          {
            position: "top-right",
            duration: 4000,
          },
        );
      }
    }
    handleScanClose();
  };

  return (
    <DashboardContent maxWidth="xl">
      <Toaster position="top-right" />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 3, md: 5 },
        }}
      >
        <Typography variant="h4">Entitlement Verification</Typography>
        <Button
          variant="contained"
          startIcon={<PlusIcon size={20} />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create Entitlement
        </Button>
      </Box>

      {/* Create Entitlement Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Entitlement</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Entitlement Name"
            placeholder="e.g., Breakfast, Lunch, Certificate"
            value={newEntitlementName}
            onChange={(e) => setNewEntitlementName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleCreateEntitlement();
              }
            }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateEntitlement}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Entitlements List */}
      <Grid container spacing={3}>
        {entitlements.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ textAlign: "center", py: 5 }}>
              <Typography color="textSecondary">
                No entitlements created yet. Click the button above to create
                one.
              </Typography>
            </Card>
          </Grid>
        ) : (
          entitlements.map((entitlement) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={entitlement.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {entitlement.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Created: {entitlement.createdAt.toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ pt: 0 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ScanIcon size={18} />}
                    onClick={() => handleScanStart(entitlement.id)}
                    fullWidth
                  >
                    Scan Entitlement
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteEntitlement(entitlement.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* QR Scanner Modal */}
      {scanningEntitlementId && (
        <QRScanner
          entitlementId={scanningEntitlementId}
          entitlementName={
            entitlements.find((e) => e.id === scanningEntitlementId)?.name || ""
          }
          onClose={handleScanClose}
          onScanSuccess={handleScanSuccess}
        />
      )}
    </DashboardContent>
  );
}

// Mock API function
function mockVerifyEntitlement(
  participantQR: string,
  entitlementName: string,
): boolean {
  // Mock data - in reality this would be a backend API call
  const mockParticipants: Record<string, string[]> = {
    PARTICIPANT_001: ["breakfast", "lunch"],
    PARTICIPANT_002: ["breakfast", "certificate"],
    PARTICIPANT_003: ["lunch", "certificate"],
    PARTICIPANT_004: ["breakfast", "lunch", "certificate"],
  };

  const entitlements = mockParticipants[participantQR] || [];
  return entitlements.includes(entitlementName.toLowerCase());
}
