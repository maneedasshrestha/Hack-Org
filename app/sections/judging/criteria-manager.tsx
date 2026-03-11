"use client";

import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import { Iconify } from "@/components/iconify";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

import type { JudgingCriteria, CriteriaFormData } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type CriteriaManagerProps = {
  hackathonId: number;
  adminId: number;
};

export function CriteriaManager({ hackathonId, adminId }: CriteriaManagerProps) {
  const [criteria, setCriteria] = useState<JudgingCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<JudgingCriteria | null>(null);
  const [formData, setFormData] = useState<CriteriaFormData>({
    name: "",
    description: "",
    maxScore: 10,
    weight: 1.0,
  });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch criteria
  const fetchCriteria = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/hackathon/${hackathonId}/criteria`, {
        headers: {
          "x-admin-id": adminId.toString(),
        },
      });
      const data = await response.json();
      if (data.success) {
        setCriteria(data.criteria);
      } else {
        setError(data.error || "Failed to fetch criteria");
      }
    } catch (err) {
      setError("Failed to fetch criteria");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [hackathonId, adminId]);

  // Initial fetch
  useState(() => {
    fetchCriteria();
  });

  // Open modal for creating new criteria
  const handleCreate = () => {
    setEditingCriteria(null);
    setFormData({
      name: "",
      description: "",
      maxScore: 10,
      weight: 1.0,
    });
    setModalOpen(true);
  };

  // Open modal for editing criteria
  const handleEdit = (item: JudgingCriteria) => {
    setEditingCriteria(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      maxScore: item.maxScore,
      weight: item.weight,
    });
    setModalOpen(true);
  };

  // Delete criteria
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this criteria? This will also delete all associated scores.")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/criteria/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-id": adminId.toString(),
        },
      });
      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: "Criteria deleted successfully", severity: "success" });
        fetchCriteria();
      } else {
        setSnackbar({ open: true, message: data.error || "Failed to delete criteria", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to delete criteria", severity: "error" });
    }
  };

  // Save criteria (create or update)
  const handleSave = async () => {
    if (!formData.name.trim()) {
      setSnackbar({ open: true, message: "Name is required", severity: "error" });
      return;
    }

    setSaving(true);
    try {
      const url = editingCriteria
        ? `${API_URL}/criteria/${editingCriteria.id}`
        : `${API_URL}/hackathon/${hackathonId}/criteria`;
      const method = editingCriteria ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminId.toString(),
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setSnackbar({
          open: true,
          message: editingCriteria ? "Criteria updated successfully" : "Criteria created successfully",
          severity: "success",
        });
        setModalOpen(false);
        fetchCriteria();
      } else {
        setSnackbar({ open: true, message: data.error || "Failed to save criteria", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to save criteria", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6">Judging Criteria</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleCreate}>
          Add Criteria
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {criteria.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No criteria defined yet. Add your first judging criteria to get started.
          </Typography>
        </Card>
      ) : (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40 }}></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Max Score</TableCell>
                <TableCell align="center">Weight</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {criteria.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <DragIndicatorIcon color="disabled" fontSize="small" />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">{item.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                      {item.description || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{item.maxScore}</TableCell>
                  <TableCell align="center">{item.weight}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(item)}>
                      <Iconify icon="solar:pen-bold" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCriteria ? "Edit Criteria" : "Add Criteria"}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              placeholder="e.g., Innovation, Technical Complexity"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="What should judges look for in this criteria?"
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Max Score"
                type="number"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 10 })}
                fullWidth
                inputProps={{ min: 1, max: 100 }}
              />
              <TextField
                label="Weight"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 1 })}
                fullWidth
                inputProps={{ min: 0.1, max: 10, step: 0.1 }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}