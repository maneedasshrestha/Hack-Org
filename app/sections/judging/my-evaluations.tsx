"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import { Iconify } from "@/components/iconify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Assignment = {
  id: number;
  judgeId: number;
  projectId: number;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  project: {
    id: number;
    name: string;
    description: string | null;
    teamName: string;
    demoUrl: string | null;
    repoUrl: string | null;
    presentationUrl: string | null;
    videoUrl: string | null;
    status: string;
  };
  scores: { id: number; criteriaId: number; score: number }[];
};

type MyEvaluationsProps = {
  hackathonId: number;
  adminId: number;
};

export function MyEvaluations({ hackathonId, adminId }: MyEvaluationsProps) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/hackathon/${hackathonId}/my-judge-profile`, {
        headers: { "x-admin-id": adminId.toString() },
      });
      const data = await response.json();
      if (data.success) {
        setAssignments(data.assignments || []);
      } else {
        setError(data.error || "Failed to fetch assignments");
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, [hackathonId, adminId]);

  useState(() => {
    fetchAssignments();
  });

  const handleEvaluate = (assignmentId: number) => {
    router.push(`/judging/${hackathonId}/evaluate/${assignmentId}`);
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

  const completedCount = assignments.filter((a) => a.isCompleted).length;
  const totalCount = assignments.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6">My Evaluations</Typography>
        <Button startIcon={<Iconify icon="mdi:refresh" />} onClick={fetchAssignments}>
          Refresh
        </Button>
      </Stack>

      {/* Progress Card */}
      {assignments.length > 0 && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Evaluation Progress</Typography>
            <Chip
              label={`${completedCount}/${totalCount} Completed`}
              color={completedCount === totalCount ? "success" : "primary"}
            />
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{ height: 12, borderRadius: 6, mb: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            {progressPercent.toFixed(0)}% of assigned projects evaluated
          </Typography>
        </Card>
      )}

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Iconify icon="mdi:folder-open-outline" width={48} sx={{ color: "text.disabled", mb: 2 }} />
          <Typography color="text.secondary">
            No projects assigned to you yet. Contact the organizer for project assignments.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {assignments.map((assignment) => (
            <Card
              key={assignment.id}
              sx={{
                p: 3,
                transition: "all 0.2s",
                border: assignment.isCompleted ? "2px solid" : "none",
                borderColor: "success.main",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6" fontWeight="medium">
                      {assignment.project.name}
                    </Typography>
                    {assignment.isCompleted && (
                      <Iconify icon="mdi:check-circle" sx={{ color: "success.main" }} />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Team: {assignment.project.teamName}
                  </Typography>
                  {assignment.project.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {assignment.project.description}
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={assignment.isCompleted ? "Evaluated" : "Pending"}
                    color={assignment.isCompleted ? "success" : "warning"}
                    size="small"
                  />
                  {!assignment.isCompleted && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleEvaluate(assignment.id)}
                    >
                      Evaluate
                    </Button>
                  )}
                </Stack>
              </Stack>

              {/* Project Links */}
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                {assignment.project.demoUrl && (
                  <Button
                    variant="text"
                    size="small"
                    href={assignment.project.demoUrl}
                    target="_blank"
                    startIcon={<Iconify icon="mdi:open-in-new" />}
                  >
                    Demo
                  </Button>
                )}
                {assignment.project.repoUrl && (
                  <Button
                    variant="text"
                    size="small"
                    href={assignment.project.repoUrl}
                    target="_blank"
                    startIcon={<Iconify icon="mdi:github" />}
                  >
                    Repo
                  </Button>
                )}
                {assignment.project.videoUrl && (
                  <Button
                    variant="text"
                    size="small"
                    href={assignment.project.videoUrl}
                    target="_blank"
                    startIcon={<Iconify icon="mdi:video" />}
                  >
                    Video
                  </Button>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}