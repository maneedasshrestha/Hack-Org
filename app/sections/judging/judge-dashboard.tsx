"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { ProjectEvaluator } from "./project-evaluator";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type JudgeAssignment = {
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
    status: string;
  };
  scores: { id: number; criteriaId: number; score: number }[];
};

type JudgeProfile = {
  id: number;
  adminId: number;
  hackathonId: number;
  hackathon: { id: number; name: string };
  admin: { id: number; fullname: string; email: string };
};

export function JudgeDashboard() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [hackathonId, setHackathonId] = useState<number | null>(null);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [judgeProfile, setJudgeProfile] = useState<JudgeProfile | null>(null);
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get admin ID from localStorage
        const storedAdminId = localStorage.getItem("adminId");
        if (!storedAdminId) {
          setError("Not authenticated");
          return;
        }
        setAdminId(parseInt(storedAdminId));

        // Get hackathon ID from slug
        const websiteRes = await fetch(`${API_URL}/website/slug/${slug}`, {
          headers: { "x-admin-id": storedAdminId },
        });
        const websiteData = await websiteRes.json();

        if (!websiteData.success || !websiteData.website?.hackathon?.id) {
          setError("Hackathon not found");
          return;
        }
        setHackathonId(websiteData.website.hackathon.id);

        // Get judge profile and assignments
        const judgeRes = await fetch(
          `${API_URL}/hackathon/${websiteData.website.hackathon.id}/my-judge-profile`,
          {
            headers: { "x-admin-id": storedAdminId },
          }
        );
        const judgeData = await judgeRes.json();

        if (!judgeData.success) {
          setError("You are not a judge for this hackathon");
          return;
        }

        setJudgeProfile(judgeData.judge);
        setAssignments(judgeData.assignments);
      } catch (err) {
        console.error(err);
        setError("Failed to load judge data");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  // Refresh assignments after evaluation
  const handleEvaluationComplete = async () => {
    if (!hackathonId || !adminId) return;

    try {
      const res = await fetch(`${API_URL}/hackathon/${hackathonId}/my-judge-profile`, {
        headers: { "x-admin-id": adminId.toString() },
      });
      const data = await res.json();
      if (data.success) {
        setAssignments(data.assignments);
        setSelectedAssignment(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // If evaluating a specific project
  if (selectedAssignment && adminId) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<Iconify icon="mdi:arrow-left" />}
          onClick={() => setSelectedAssignment(null)}
          sx={{ mb: 3 }}
        >
          Back to Projects
        </Button>
        <ProjectEvaluator
          assignmentId={selectedAssignment}
          adminId={adminId}
          onComplete={handleEvaluationComplete}
        />
      </Box>
    );
  }

  const completedCount = assignments.filter((a) => a.isCompleted).length;
  const totalCount = assignments.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Judge Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {judgeProfile?.hackathon?.name}
      </Typography>

      {/* Progress Card */}
      <Card sx={{ p: 3, mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Evaluation Progress</Typography>
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

      {/* Assignments List */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Assigned Projects
      </Typography>

      {assignments.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Iconify icon="mdi:folder-open-outline" width={48} sx={{ color: "text.disabled", mb: 2 }} />
          <Typography color="text.secondary">
            No projects assigned yet. Contact the organizer for project assignments.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {assignments.map((assignment) => (
            <Card
              key={assignment.id}
              sx={{
                p: 3,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-2px)",
                },
                border: assignment.isCompleted ? "2px solid" : "none",
                borderColor: "success.main",
              }}
              onClick={() => !assignment.isCompleted && setSelectedAssignment(assignment.id)}
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
                    <Button variant="contained" size="small">
                      Evaluate
                    </Button>
                  )}
                </Stack>
              </Stack>

              {assignment.project.demoUrl && (
                <Button
                  variant="text"
                  size="small"
                  href={assignment.project.demoUrl}
                  target="_blank"
                  startIcon={<Iconify icon="mdi:open-in-new" />}
                  sx={{ mt: 1 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  View Demo
                </Button>
              )}
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}