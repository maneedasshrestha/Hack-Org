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
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import { Iconify } from "@/components/iconify";

import type { Judge, Project } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type JudgeManagerProps = {
  hackathonId: number;
  adminId: number;
};

export function JudgeManager({ hackathonId, adminId }: JudgeManagerProps) {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState<Judge | null>(null);
  const [newJudgeEmail, setNewJudgeEmail] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch judges and projects
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [judgesRes] = await Promise.all([
        fetch(`${API_URL}/hackathon/${hackathonId}/judges`, {
          headers: { "x-admin-id": adminId.toString() },
        }),
      ]);

      const judgesData = await judgesRes.json();
      if (judgesData.success) {
        setJudges(judgesData.judges);
      }

      // Fetch projects for assignment
      const projectsRes = await fetch(`${API_URL}/hackathon/${hackathonId}/projects`, {
        headers: { "x-admin-id": adminId.toString() },
      });
      const projectsData = await projectsRes.json();
      if (projectsData.success) {
        setProjects(projectsData.projects);
      }
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [hackathonId, adminId]);

  useState(() => {
    fetchData();
  });

  // Add judge by email
  const handleAddJudge = async () => {
    if (!newJudgeEmail.trim()) {
      setSnackbar({ open: true, message: "Email is required", severity: "error" });
      return;
    }

    setSaving(true);
    try {
      // First, find admin by email (we'll need to create this endpoint or use existing)
      // For now, we'll assume the admin ID is passed directly
      // In a real app, you'd search for the admin by email first

      const response = await fetch(`${API_URL}/hackathon/${hackathonId}/judges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminId.toString(),
        },
        body: JSON.stringify({ adminId: parseInt(newJudgeEmail) }), // This should be admin ID
      });

      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: "Judge added successfully", severity: "success" });
        setAddModalOpen(false);
        setNewJudgeEmail("");
        fetchData();
      } else {
        setSnackbar({ open: true, message: data.error || "Failed to add judge", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to add judge", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Remove judge
  const handleRemoveJudge = async (judgeId: number) => {
    if (!confirm("Are you sure you want to remove this judge?")) return;

    try {
      const response = await fetch(`${API_URL}/judges/${judgeId}`, {
        method: "DELETE",
        headers: { "x-admin-id": adminId.toString() },
      });
      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: "Judge removed successfully", severity: "success" });
        fetchData();
      } else {
        setSnackbar({ open: true, message: data.error || "Failed to remove judge", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to remove judge", severity: "error" });
    }
  };

  // Open assign modal
  const handleOpenAssign = (judge: Judge) => {
    setSelectedJudge(judge);
    setSelectedProjects([]);
    setAssignModalOpen(true);
  };

  // Assign projects to judge
  const handleAssignProjects = async () => {
    if (!selectedJudge || selectedProjects.length === 0) {
      setSnackbar({ open: true, message: "Select at least one project", severity: "error" });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/judges/${selectedJudge.id}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminId.toString(),
        },
        body: JSON.stringify({ projectIds: selectedProjects }),
      });

      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: data.message || "Projects assigned successfully", severity: "success" });
        setAssignModalOpen(false);
        fetchData();
      } else {
        setSnackbar({ open: true, message: data.error || "Failed to assign projects", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to assign projects", severity: "error" });
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
        <Typography variant="h6">Judges</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setAddModalOpen(true)}>
          Add Judge
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {judges.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No judges added yet. Add judges to start assigning projects for evaluation.
          </Typography>
        </Card>
      ) : (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Judge</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Assigned Projects</TableCell>
                <TableCell align="center">Added On</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {judges.map((judge) => (
                <TableRow key={judge.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {judge.admin.fullname?.charAt(0)?.toUpperCase() || "J"}
                      </Avatar>
                      <Typography fontWeight="medium">{judge.admin.fullname}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{judge.admin.email}</TableCell>
                  <TableCell align="center">
                    <Chip label={judge._count?.assignments || 0} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                    {new Date(judge.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1 }}
                      onClick={() => handleOpenAssign(judge)}
                    >
                      Assign Projects
                    </Button>
                    <IconButton size="small" color="error" onClick={() => handleRemoveJudge(judge.id)}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Judge Modal */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Judge</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the Admin ID of the user you want to add as a judge.
          </Typography>
          <TextField
            label="Admin ID"
            value={newJudgeEmail}
            onChange={(e) => setNewJudgeEmail(e.target.value)}
            fullWidth
            type="number"
            placeholder="Enter admin ID"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddJudge} disabled={saving}>
            {saving ? "Adding..." : "Add Judge"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Projects Modal */}
      <Dialog open={assignModalOpen} onClose={() => setAssignModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Assign Projects to {selectedJudge?.admin.fullname}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select projects for this judge to evaluate.
          </Typography>
          {projects.length === 0 ? (
            <Alert severity="info">No projects available for assignment.</Alert>
          ) : (
            <TableContainer component={Card} sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox"></TableCell>
                    <TableCell>Project Name</TableCell>
                    <TableCell>Team</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow
                      key={project.id}
                      hover
                      selected={selectedProjects.includes(project.id)}
                      onClick={() => {
                        setSelectedProjects((prev) =>
                          prev.includes(project.id)
                            ? prev.filter((id) => id !== project.id)
                            : [...prev, project.id]
                        );
                      }}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={selectedProjects.includes(project.id)} />
                      </TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.teamName}</TableCell>
                      <TableCell>
                        <Chip label={project.status} size="small" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignProjects} disabled={saving || selectedProjects.length === 0}>
            {saving ? "Assigning..." : `Assign ${selectedProjects.length} Projects`}
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