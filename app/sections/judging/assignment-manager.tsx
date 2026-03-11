"use client";

import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import { Iconify } from "@/components/iconify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ProjectInfo = {
  id: number;
  name: string;
  teamName: string;
  status: string;
};

type JudgeInfo = {
  id: number;
  adminId: number;
  name: string;
  email: string;
  assignments: {
    projectId: number;
    assignmentId: number;
    isCompleted: boolean;
  }[];
  totalAssigned: number;
  completed: number;
};

type MatrixData = {
  projects: ProjectInfo[];
  judges: JudgeInfo[];
  projectAssignmentCounts: Record<number, number>;
};

type AssignmentManagerProps = {
  hackathonId: number;
  adminId: number;
};

export function AssignmentManager({ hackathonId, adminId }: AssignmentManagerProps) {
  const [matrix, setMatrix] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [randomAssignOpen, setRandomAssignOpen] = useState(false);
  const [selectedJudges, setSelectedJudges] = useState<number[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [projectsPerJudge, setProjectsPerJudge] = useState<string>("3");
  const [onlyUnassigned, setOnlyUnassigned] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchMatrix = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/judging/hackathon/${hackathonId}/assignments/matrix`, {
        headers: { "x-admin-id": adminId.toString() },
      });
      const data = await response.json();
      if (data.success) {
        setMatrix(data.matrix);
      } else {
        setError(data.error || "Failed to fetch assignments");
      }
    } catch (err) {
      console.error("Error fetching matrix:", err);
      setError("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  }, [hackathonId, adminId]);

  useState(() => {
    fetchMatrix();
  });

  const handleBulkAssign = async () => {
    if (selectedJudges.length === 0 || selectedProjects.length === 0) {
      setSnackbar({ open: true, message: "Select at least one judge and one project", severity: "error" });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/judging/hackathon/${hackathonId}/assignments/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminId.toString(),
        },
        body: JSON.stringify({
          judgeIds: selectedJudges,
          projectIds: selectedProjects,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: data.message, severity: "success" });
        setBulkAssignOpen(false);
        setSelectedJudges([]);
        setSelectedProjects([]);
        fetchMatrix();
      } else {
        setSnackbar({ open: true, message: data.error || "Failed to assign", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to assign", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleRandomAssign = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/judging/hackathon/${hackathonId}/assignments/random`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminId.toString(),
        },
        body: JSON.stringify({
          projectsPerJudge: parseInt(projectsPerJudge) || undefined,
          onlyUnassigned,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: data.message, severity: "success" });
        setRandomAssignOpen(false);
        fetchMatrix();
      } else {
        setSnackbar({ open: true, message: data.error || "Failed to assign", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to assign", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const toggleProject = (projectId: number) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const toggleJudge = (judgeId: number) => {
    setSelectedJudges((prev) =>
      prev.includes(judgeId) ? prev.filter((id) => id !== judgeId) : [...prev, judgeId]
    );
  };

  const selectAllProjects = () => {
    if (matrix) {
      setSelectedProjects(matrix.projects.map((p) => p.id));
    }
  };

  const selectAllJudges = () => {
    if (matrix) {
      setSelectedJudges(matrix.judges.map((j) => j.id));
    }
  };

  const clearSelection = () => {
    setSelectedProjects([]);
    setSelectedJudges([]);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!matrix) {
    return <Alert severity="info">No data available</Alert>;
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6">Project Assignments</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="mdi:shuffle" />}
            onClick={() => setRandomAssignOpen(true)}
          >
            Auto Assign
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={() => setBulkAssignOpen(true)}
          >
            Bulk Assign
          </Button>
        </Stack>
      </Stack>

      {matrix.judges.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No judges added yet. Add judges first before assigning projects.
          </Typography>
        </Card>
      ) : matrix.projects.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No submitted projects yet. Projects will appear here once submitted.
          </Typography>
        </Card>
      ) : (
        <TableContainer component={Card}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 40 }}>#</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Project / Team</TableCell>
                <TableCell align="center" sx={{ minWidth: 60 }}>
                  Assigned
                </TableCell>
                {matrix.judges.map((judge) => (
                  <TableCell key={judge.id} align="center" sx={{ minWidth: 80 }}>
                    <Stack spacing={0.5} alignItems="center">
                      <Typography variant="caption" fontWeight="medium" noWrap>
                        {judge.name.split(" ")[0]}
                      </Typography>
                      <Chip
                        label={`${judge.completed}/${judge.totalAssigned}`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {matrix.projects.map((project, index) => {
                const assignmentCount = matrix.projectAssignmentCounts[project.id] || 0;
                return (
                  <TableRow key={project.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {project.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {project.teamName}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={assignmentCount} size="small" color={assignmentCount > 0 ? "success" : "default"} />
                    </TableCell>
                    {matrix.judges.map((judge) => {
                      const assignment = judge.assignments.find((a) => a.projectId === project.id);
                      return (
                        <TableCell key={judge.id} align="center">
                          {assignment ? (
                            <Iconify
                              icon={assignment.isCompleted ? "mdi:check-circle" : "mdi:clock-outline"}
                              sx={{
                                color: assignment.isCompleted ? "success.main" : "warning.main",
                              }}
                            />
                          ) : (
                            <Box sx={{ width: 20, height: 20 }} />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Bulk Assign Dialog */}
      <Dialog open={bulkAssignOpen} onClose={() => setBulkAssignOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Assign Projects to Judges</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">Select judges and projects to create assignments.</Alert>

            {/* Judge Selection */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Judges ({selectedJudges.length} selected)</Typography>
                <Button size="small" onClick={selectAllJudges}>
                  Select All
                </Button>
              </Stack>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {matrix.judges.map((judge) => (
                  <Chip
                    key={judge.id}
                    label={judge.name}
                    onClick={() => toggleJudge(judge.id)}
                    onDelete={selectedJudges.includes(judge.id) ? () => toggleJudge(judge.id) : undefined}
                    color={selectedJudges.includes(judge.id) ? "primary" : "default"}
                    variant={selectedJudges.includes(judge.id) ? "filled" : "outlined"}
                  />
                ))}
              </Stack>
            </Box>

            {/* Project Selection */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Projects ({selectedProjects.length} selected)</Typography>
                <Button size="small" onClick={selectAllProjects}>
                  Select All
                </Button>
              </Stack>
              <TableContainer component={Card} sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableBody>
                    {matrix.projects.map((project) => (
                      <TableRow
                        key={project.id}
                        hover
                        selected={selectedProjects.includes(project.id)}
                        onClick={() => toggleProject(project.id)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedProjects.includes(project.id)} size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{project.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {project.teamName}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkAssign} disabled={saving}>
            {saving ? "Assigning..." : `Assign ${selectedJudges.length * selectedProjects.length} Assignments`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Random Assign Dialog */}
      <Dialog open={randomAssignOpen} onClose={() => setRandomAssignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Auto Assign Projects</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Automatically distribute projects among judges. This will create assignments for all judges.
            </Typography>
            <TextField
              label="Projects per Judge (optional)"
              type="number"
              value={projectsPerJudge}
              onChange={(e) => setProjectsPerJudge(e.target.value)}
              fullWidth
              helperText="Leave empty to distribute all projects evenly"
            />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Checkbox
                checked={onlyUnassigned}
                onChange={(e) => setOnlyUnassigned(e.target.checked)}
              />
              <Typography variant="body2">Only assign projects without any judge</Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRandomAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRandomAssign} disabled={saving}>
            {saving ? "Assigning..." : "Auto Assign"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        message={snackbar.message}
      />
    </Box>
  );
}