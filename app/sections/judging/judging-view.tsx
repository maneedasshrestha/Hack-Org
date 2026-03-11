"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import { Iconify } from "@/components/iconify";
import { DashboardContent } from "@/app/layouts/dashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type JudgingHackathon = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  isOrganizer: boolean;
  isJudge: boolean;
  totalProjects: number;
  totalJudges: number;
  criteriaCount: number;
  evaluatedProjects: number;
  myAssignedProjects?: number;
  myCompletedEvaluations?: number;
};

export function JudgingView() {
  const router = useRouter();
  const [hackathons, setHackathons] = useState<JudgingHackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHackathons = async () => {
      setLoading(true);
      setError(null);
      try {
        const adminId = localStorage.getItem("adminId");
        if (!adminId) {
          setError("Not authenticated");
          return;
        }

        const response = await fetch(`${API_URL}/judging/hackathons`, {
          headers: { "x-admin-id": adminId },
        });

        const data = await response.json();
        if (data.success) {
          setHackathons(data.hackathons);
        } else {
          setError(data.error || "Failed to fetch hackathons");
        }
      } catch (err) {
        console.error("Error fetching hackathons:", err);
        setError("Failed to load hackathons");
      } finally {
        setLoading(false);
      }
    };

    fetchHackathons();
  }, []);

  const handleSelectHackathon = (hackathonId: number) => {
    router.push(`/judging/${hackathonId}`);
  };

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Judging
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a hackathon to manage judging criteria, assign judges, and view evaluations.
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Hackathons Grid */}
      {hackathons.length === 0 ? (
        <Card sx={{ p: 5, textAlign: "center" }}>
          <Iconify icon="mdi:gavel" width={48} sx={{ color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No Hackathons Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You don't have access to judging for any hackathons. Create a hackathon or ask an organizer to add you as a judge.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {hackathons.map((hackathon) => (
            <Grid key={hackathon.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  p: 3,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-4px)",
                  },
                }}
                onClick={() => handleSelectHackathon(hackathon.id)}
              >
                <Stack spacing={2} sx={{ flex: 1 }}>
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" fontWeight="bold">
                      {hackathon.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      {hackathon.isOrganizer && (
                        <Chip label="Organizer" size="small" color="primary" variant="outlined" />
                      )}
                      {hackathon.isJudge && (
                        <Chip label="Judge" size="small" color="secondary" variant="outlined" />
                      )}
                    </Stack>
                  </Stack>

                  {hackathon.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      {hackathon.description.substring(0, 100)}
                      {hackathon.description.length > 100 ? "..." : ""}
                    </Typography>
                  )}

                  {/* Stats */}
                  <Stack direction="row" spacing={2} sx={{ mt: "auto" }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Projects
                      </Typography>
                      <Typography variant="h6">{hackathon.totalProjects}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Judges
                      </Typography>
                      <Typography variant="h6">{hackathon.totalJudges}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Criteria
                      </Typography>
                      <Typography variant="h6">{hackathon.criteriaCount}</Typography>
                    </Box>
                  </Stack>

                  {/* Progress */}
                  {hackathon.totalProjects > 0 && (
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          Evaluation Progress
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {hackathon.evaluatedProjects}/{hackathon.totalProjects}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={(hackathon.evaluatedProjects / hackathon.totalProjects) * 100}
                        sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}

                  {/* Judge Progress */}
                  {hackathon.isJudge && hackathon.myAssignedProjects !== undefined && (
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          My Evaluations
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {hackathon.myCompletedEvaluations}/{hackathon.myAssignedProjects}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={
                          hackathon.myAssignedProjects > 0
                            ? (hackathon.myCompletedEvaluations! / hackathon.myAssignedProjects) * 100
                            : 0
                        }
                        color="secondary"
                        sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}

                  {/* Action Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: "auto" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectHackathon(hackathon.id);
                    }}
                  >
                    {hackathon.isJudge && !hackathon.isOrganizer ? "Start Evaluating" : "Manage Judging"}
                  </Button>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </DashboardContent>
  );
}