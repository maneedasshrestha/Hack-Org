"use client";

import { useState, useEffect } from "react";
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
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { DashboardContent } from "../layouts/dashboard";
import { Toaster, toast } from "sonner";
import QRScanner from "@/components/qr-scanner";
import { Scan as ScanIcon, Plus as PlusIcon, Trash2 as TrashIcon } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Entitlement {
  id: number;
  name: string;
  description?: string;
  websiteId: number;
  createdAt: string;
  _count?: {
    claims: number;
  };
}

interface Hackathon {
  id: number;
  slug: string;
  title: string;
}

export default function EntitlementVerificationPage() {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newEntitlementName, setNewEntitlementName] = useState("");
  const [newEntitlementDescription, setNewEntitlementDescription] = useState("");
  const [scanningEntitlementId, setScanningEntitlementId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hackathonsLoading, setHackathonsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch admin's hackathons on mount
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const adminId = localStorage.getItem("adminId");
        if (!adminId) {
          setHackathonsLoading(false);
          setError("Please log in as an admin to manage entitlements");
          return;
        }

        const response = await fetch(`${API_URL}/websites/admin/${adminId}`);
        if (!response.ok) throw new Error("Failed to fetch hackathons");

        const data = await response.json();
        setHackathons(data.websites || []);

        // Auto-select first hackathon if available
        if (data.websites && data.websites.length > 0) {
          setSelectedHackathonId(data.websites[0].id.toString());
        }
      } catch (err) {
        console.error("Error fetching hackathons:", err);
        setError("Failed to load hackathons");
      } finally {
        setHackathonsLoading(false);
      }
    };

    fetchHackathons();
  }, []);

  // Fetch entitlements when hackathon is selected
  useEffect(() => {
    if (!selectedHackathonId) {
      setEntitlements([]);
      return;
    }

    const fetchEntitlements = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_URL}/entitlement/website/${selectedHackathonId}`
        );
        if (!response.ok) throw new Error("Failed to fetch entitlements");

        const data = await response.json();
        setEntitlements(data.entitlements || []);
      } catch (err) {
        console.error("Error fetching entitlements:", err);
        setError("Failed to load entitlements");
      } finally {
        setLoading(false);
      }
    };

    fetchEntitlements();
  }, [selectedHackathonId]);

  const handleCreateEntitlement = async () => {
    if (!newEntitlementName.trim()) {
      toast.error("Please enter an entitlement name");
      return;
    }

    if (!selectedHackathonId) {
      toast.error("Please select a hackathon first");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`${API_URL}/entitlement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteId: selectedHackathonId,
          name: newEntitlementName.trim(),
          description: newEntitlementDescription.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create entitlement");
      }

      const data = await response.json();
      setEntitlements([...entitlements, data.entitlement]);
      setNewEntitlementName("");
      setNewEntitlementDescription("");
      setOpenCreateDialog(false);
      toast.success(`Entitlement "${newEntitlementName}" created successfully`);
    } catch (err: any) {
      console.error("Error creating entitlement:", err);
      toast.error(err.message || "Failed to create entitlement");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEntitlement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entitlement?")) return;

    setDeleting(id);
    try {
      const response = await fetch(`${API_URL}/entitlement/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete entitlement");

      setEntitlements(entitlements.filter((e) => e.id.toString() !== id));
      toast.success("Entitlement deleted");
    } catch (err) {
      console.error("Error deleting entitlement:", err);
      toast.error("Failed to delete entitlement");
    } finally {
      setDeleting(null);
    }
  };

  const handleScanStart = (id: string) => {
    setScanningEntitlementId(id);
  };

  const handleScanClose = () => {
    setScanningEntitlementId(null);
  };

  const handleScanSuccess = async (qrData: string) => {
    const entitlement = entitlements.find(
      (e) => e.id.toString() === scanningEntitlementId
    );

    if (!entitlement) {
      toast.error("Entitlement not found");
      handleScanClose();
      return;
    }

    try {
      const adminId = localStorage.getItem("adminId");
      if (!adminId) {
        toast.error("Please log in to verify entitlements");
        handleScanClose();
        return;
      }

      const response = await fetch(`${API_URL}/entitlement/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrIdentifier: qrData,
          entitlementId: scanningEntitlementId,
          adminId: adminId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.alreadyClaimed) {
          toast.warning(data.error, {
            description: `Claimed on: ${new Date(data.claimedAt).toLocaleString()}`,
            duration: 5000,
          });
        } else {
          toast.error(data.error || "Verification failed");
        }
      } else {
        toast.success(data.message, {
          description: `Participant: ${data.participant?.name || data.participant?.email}`,
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Error verifying entitlement:", err);
      toast.error("Failed to verify entitlement. Please try again.");
    }

    handleScanClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4">Entitlement Verification</Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* Hackathon Selector */}
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="hackathon-select-label">Select Hackathon</InputLabel>
            <Select
              labelId="hackathon-select-label"
              value={selectedHackathonId}
              label="Select Hackathon"
              onChange={(e) => setSelectedHackathonId(e.target.value)}
              disabled={hackathonsLoading || hackathons.length === 0}
            >
              {hackathons.map((hackathon) => (
                <MenuItem key={hackathon.id} value={hackathon.id.toString()}>
                  {hackathon.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<PlusIcon size={20} />}
            onClick={() => setOpenCreateDialog(true)}
            disabled={!selectedHackathonId}
          >
            Create Entitlement
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {hackathonsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : !selectedHackathonId ? (
        <Card sx={{ textAlign: "center", py: 5 }}>
          <Typography color="textSecondary">
            {hackathons.length === 0
              ? "No hackathons found. Create a hackathon first."
              : "Select a hackathon to manage entitlements."}
          </Typography>
        </Card>
      ) : loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        /* Entitlements List */
        <Grid container spacing={3}>
          {entitlements.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Card sx={{ textAlign: "center", py: 5 }}>
                <Typography color="textSecondary">
                  No entitlements created yet. Click the button above to create one.
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
                    {entitlement.description && (
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {entitlement.description}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={`${entitlement._count?.claims || 0} claims`}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="caption" color="textSecondary">
                        Created: {formatDate(entitlement.createdAt)}
                      </Typography>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ pt: 0 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<ScanIcon size={18} />}
                      onClick={() => handleScanStart(entitlement.id.toString())}
                      fullWidth
                    >
                      Scan to Verify
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteEntitlement(entitlement.id.toString())}
                      disabled={deleting === entitlement.id.toString()}
                    >
                      {deleting === entitlement.id.toString() ? (
                        <CircularProgress size={20} />
                      ) : (
                        <TrashIcon size={18} />
                      )}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Create Entitlement Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => !creating && setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Entitlement</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Entitlement Name"
              placeholder="e.g., Breakfast, Lunch, Certificate"
              value={newEntitlementName}
              onChange={(e) => setNewEntitlementName(e.target.value)}
              disabled={creating}
              autoFocus
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              placeholder="Brief description of this entitlement"
              value={newEntitlementDescription}
              onChange={(e) => setNewEntitlementDescription(e.target.value)}
              disabled={creating}
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)} disabled={creating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateEntitlement}
            disabled={creating || !newEntitlementName.trim()}
          >
            {creating ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Scanner Modal */}
      {scanningEntitlementId && (
        <QRScanner
          entitlementId={scanningEntitlementId}
          entitlementName={
            entitlements.find((e) => e.id.toString() === scanningEntitlementId)?.name || ""
          }
          onClose={handleScanClose}
          onScanSuccess={handleScanSuccess}
        />
      )}
    </DashboardContent>
  );
}