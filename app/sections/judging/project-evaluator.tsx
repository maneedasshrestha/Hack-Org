"use client";

import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import { Iconify } from "@/components/iconify";

import type { JudgingCriteria, JudgeAssignment, ScoreFormData } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ProjectEvaluatorProps = {
  assignmentId: number;
  adminId: number;
  onComplete?: () => void;
};

export function ProjectEvaluator({ assignmentId, adminId, onComplete }: ProjectEvaluatorProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assignment, setAssignment] = useState<JudgeAssignment | null>(null);
  const [criteria, setCriteria] = useState<JudgingCriteria[]>([]);
  const [scores, setScores] = useState<Record<number, { score: number; feedback: string }>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch assignment and criteria
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/assignments/${assignmentId}/evaluate`, {
        headers: { "x-admin-id": adminId.toString() },
      });
      const data = await response.json();

      if (data.success) {
        setAssignment(data.assignment);
        setCriteria(data.criteria);

        // Initialize scores from existing data or defaults
        const initialScores: Record<number, { score: number; feedback: string }> = {};
        data.criteria.forEach((c: JudgingCriteria) => {
          const existing = data.assignment.existingScores?.find(
            (s: { criteriaId: number }) => s.criteriaId === c.id
          );
          initialScores[c.id] = {
            score: existing?.score || 0,
            feedback: existing?.feedback || "",
          };
        });
        setScores(initialScores);
      }
    } catch (err) {
      console.error("Error fetching assignment:", err);
    } finally {
      setLoading(false);
    }
  }, [assignmentId, adminId]);

  useState(() => {
    fetchData();
  });

  // Update score for a criteria
  const handleScoreChange = (criteriaId: number, score: number) => {
    setScores((prev) => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], score },
    }));
  };

  // Update feedback for a criteria
  const handleFeedbackChange = (criteriaId: number, feedback: string) => {
    setScores((prev) => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], feedback },
    }));
  };

  // Submit all scores
  const handleSubmit = async () => {
    // Validate all criteria have scores
    const scoresArray = Object.entries(scores).map(([criteriaId, data]) => ({
      criteriaId: parseInt(criteriaId),
      score: data.score,
      feedback: data.feedback,
    }));

    if (scoresArray.length !== criteria.length) {
      setSnackbar({ open: true, message: "Please score all criteria", severity: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/assignments/${assignmentId}/scores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminId.toString(),
        },
        body: JSON.stringify({ scores: scoresArray }),
      });

      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: "Scores submitted successfully!", severity: "success" });
        onComplete?.();
      } else {
        setSnackbar({ open: true, message: data.error || "Failed to submit scores", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to submit scores", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!assignment) {
    return <Alert severity="error">Assignment not found</Alert>;
  }

  const project = assignment.project;
  const totalPossibleScore = criteria.reduce((sum, c) => sum + c.maxScore * c.weight, 0);
  const currentScore = Object.entries(scores).reduce((sum, [id, data]) => {
    const c = criteria.find((cr) => cr.id === parseInt(id));
    return sum + (c ? data.score * c.weight : 0);
  }, 0);
  const scorePercentage = totalPossibleScore > 0 ? (currentScore / totalPossibleScore) * 100 : 0;

  return (
    <Box>
      {/* Project Info Card */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {project?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Team: <strong>{project?.teamName}</strong>
            </Typography>
            {project?.description && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                {project.description}
              </Typography>
            )}
          </Box>
          <Chip
            label={assignment.isCompleted ? "Evaluated" : "Pending"}
            color={assignment.isCompleted ? "success" : "warning"}
          />
        </Stack>

        {/* Project Links */}
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          {project?.repoUrl && (
            <Button
              variant="outlined"
              size="small"
              href={project.repoUrl}
              target="_blank"
              startIcon={<Iconify icon="mdi:github" />}
            >
              Repository
            </Button>
          )}
          {project?.demoUrl && (
            <Button
              variant="outlined"
              size="small"
              href={project.demoUrl}
              target="_blank"
              startIcon={<Iconify icon="mdi:open-in-new" />}
            >
              Live Demo
            </Button>
          )}
          {project?.presentationUrl && (
            <Button
              variant="outlined"
              size="small"
              href={project.presentationUrl}
              target="_blank"
              startIcon={<Iconify icon="mdi:presentation" />}
            >
              Presentation
            </Button>
          )}
          {project?.videoUrl && (
            <Button
              variant="outlined"
              size="small"
              href={project.videoUrl}
              target="_blank"
              startIcon={<Iconify icon="mdi:video" />}
            >
              Video
            </Button>
          )}
        </Stack>
      </Card>

      {/* Score Summary */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Score
        </Typography>
        <Stack direction="row" spacing={3} alignItems="center">
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={scorePercentage}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Typography variant="h4" color="primary.main" fontWeight="bold">
            {scorePercentage.toFixed(1)}%
          </Typography>
        </Stack>
      </Card>

      {/* Scoring Form */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Evaluation Criteria
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Score each criteria from 0 to the maximum score. Provide feedback for each criteria.
        </Typography>

        <Stack spacing={4}>
          {criteria.map((c, index) => (
            <Box key={c.id}>
              {index > 0 && <Divider sx={{ mb: 3 }} />}
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {c.name}
                    </Typography>
                    {c.description && (
                      <Typography variant="caption" color="text.secondary">
                        {c.description}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={`Max: ${c.maxScore}`} size="small" variant="outlined" />
                    <Chip label={`Weight: ${c.weight}`} size="small" variant="outlined" color="primary" />
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={3} alignItems="center">
                  <Typography variant="h6" color="primary.main" sx={{ minWidth: 40 }}>
                    {scores[c.id]?.score || 0}
                  </Typography>
                  <Slider
                    value={scores[c.id]?.score || 0}
                    onChange={(_, value) => handleScoreChange(c.id, value as number)}
                    min={0}
                    max={c.maxScore}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    sx={{ flex: 1 }}
                  />
                </Stack>

                <TextField
                  label="Feedback (optional)"
                  value={scores[c.id]?.feedback || ""}
                  onChange={(e) => handleFeedbackChange(c.id, e.target.value)}
                  multiline
                  rows={2}
                  fullWidth
                  placeholder="Provide feedback for this criteria..."
                />
              </Stack>
            </Box>
          ))}
        </Stack>

        {/* Submit Button */}
        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={fetchData}>
            Reset
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <Iconify icon="mdi:check" />}
          >
            {submitting ? "Submitting..." : "Submit Evaluation"}
          </Button>
        </Box>
      </Card>

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