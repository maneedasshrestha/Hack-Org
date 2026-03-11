"use client";

import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import { Iconify } from "@/components/iconify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type OverviewData = {
  hackathon: {
    id: number;
    name: string;
    description: string | null;
  };
  isOrganizer: boolean;
  isJudge: boolean;
  projects: {
    total: number;
    submitted: number;
    underReview: number;
    judged: number;
  };
  judges: {
    total: number;
    totalAssignments: number;
    completedAssignments: number;
  };
  criteriaCount: number;
  myStats: {
    totalAssigned: number;
    completed: number;
    pending: number;
  } | null;
};

type JudgingOverviewProps = {
  hackathonId: number;
  adminId: number;
};

export function JudgingOverview({ hackathonId, adminId }: JudgingOverviewProps) {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/judging/hackathon/${hackathonId}/overview`, {
        headers: { "x-admin-id": adminId.toString() },
      });
      const data = await response.json();
      if (data.success) {
        setOverview(data.overview);
      } else {
        setError(data.error || "Failed to fetch overview");
      }
    } catch (err) {
      console.error("Error fetching overview:", err);
      setError("Failed to fetch overview");
    } finally {
      setLoading(false);
    }
  }, [hackathonId, adminId]);

  useState(() => {
    fetchOverview();
  });

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

  if (!overview) {
    return <Alert severity="info">No data available</Alert>;
  }

  const projectProgress =
    overview.projects.total > 0
      ? (overview.projects.judged / overview.projects.total) * 100
      : 0;

  const assignmentProgress =
    overview.judges.totalAssignments > 0
      ? (overview.judges.completedAssignments / overview.judges.totalAssignments) * 100
      : 0;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6">Overview</Typography>
        <Chip
          label={overview.isOrganizer ? "Organizer View" : "Judge View"}
          color={overview.isOrganizer ? "primary" : "secondary"}
          size="small"
        />
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ p: 2, textAlign: "center" }}>
            <Iconify icon="mdi:folder-multiple" width={32} sx={{ color: "primary.main", mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {overview.projects.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Projects
            </Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ p: 2, textAlign: "center" }}>
            <Iconify icon="mdi:account-group" width={32} sx={{ color: "secondary.main", mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {overview.judges.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Judges
            </Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ p: 2, textAlign: "center" }}>
            <Iconify icon="mdi:clipboard-check" width={32} sx={{ color: "success.main", mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {overview.judges.completedAssignments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed Reviews
            </Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ p: 2, textAlign: "center" }}>
            <Iconify icon="mdi:gavel" width={32} sx={{ color: "warning.main", mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {overview.criteriaCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Criteria
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Cards */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {/* Project Progress */}
        <Card sx={{ p: 3, flex: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Project Evaluation Progress
          </Typography>
          <LinearProgress
            variant="determinate"
            value={projectProgress}
            sx={{ height: 10, borderRadius: 5, mb: 1 }}
          />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              {overview.projects.judged} of {overview.projects.total} evaluated
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {projectProgress.toFixed(0)}%
            </Typography>
          </Stack>
        </Card>

        {/* Assignment Progress */}
        <Card sx={{ p: 3, flex: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Assignment Completion
          </Typography>
          <LinearProgress
            variant="determinate"
            value={assignmentProgress}
            color="secondary"
            sx={{ height: 10, borderRadius: 5, mb: 1 }}
          />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              {overview.judges.completedAssignments} of {overview.judges.totalAssignments} completed
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {assignmentProgress.toFixed(0)}%
            </Typography>
          </Stack>
        </Card>
      </Stack>

      {/* Judge's Personal Stats */}
      {overview.isJudge && overview.myStats && (
        <Card sx={{ p: 3, mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            My Assignments
          </Typography>
          <Stack direction="row" spacing={4}>
            <Box>
              <Typography variant="h4" color="primary.main">
                {overview.myStats.totalAssigned}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Assigned
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="success.main">
                {overview.myStats.completed}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completed
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="warning.main">
                {overview.myStats.pending}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pending
              </Typography>
            </Box>
          </Stack>
        </Card>
      )}
    </Box>
  );
}

// Import Grid at the top
import Grid from "@mui/material/Grid";