"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { Iconify } from "@/components/iconify";
import { ProjectSubmissionForm } from "@/app/sections/judging/project-submission-form";
import type { Project } from "@/app/sections/judging/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProjectSubmissionPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [hackathonId, setHackathonId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [registrationId, setRegistrationId] = useState<number | null>(null);
  const [existingProject, setExistingProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user info from session/localStorage
        // This depends on your auth implementation
        const storedUserId = localStorage.getItem("userId");
        if (!storedUserId) {
          setError("Please log in to submit a project");
          return;
        }
        setUserId(parseInt(storedUserId));

        // Get hackathon info from slug
        const websiteRes = await fetch(`${API_URL}/website/slug/${slug}`);
        const websiteData = await websiteRes.json();

        if (!websiteData.success || !websiteData.website?.hackathon?.id) {
          setError("Hackathon not found");
          return;
        }
        setHackathonId(websiteData.website.hackathon.id);

        // Check if user is registered for this hackathon
        const registrationRes = await fetch(
          `${API_URL}/registration/check?userId=${storedUserId}&hackathonId=${websiteData.website.hackathon.id}`
        );
        const registrationData = await registrationRes.json();

        if (registrationData.success && registrationData.registration) {
          setRegistrationId(registrationData.registration.id);
        }

        // Check for existing project
        const projectsRes = await fetch(
          `${API_URL}/hackathon/${websiteData.website.hackathon.id}/projects`
        );
        const projectsData = await projectsRes.json();

        if (projectsData.success) {
          const userProject = projectsData.projects.find(
            (p: Project) => p.registrationId === registrationData.registration?.id
          );
          if (userProject) {
            setExistingProject(userProject);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load page");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  const handleSuccess = () => {
    // Refresh page or redirect
    window.location.reload();
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

  if (!hackathonId || !userId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Unable to load submission form</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {existingProject ? "Your Project" : "Submit Project"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Submit your hackathon project for evaluation
          </Typography>
        </Box>
        {existingProject && (
          <Chip
            label={existingProject.status}
            color={
              existingProject.status === "SUBMITTED"
                ? "info"
                : existingProject.status === "JUDGED"
                ? "success"
                : "default"
            }
          />
        )}
      </Stack>

      {/* Status Info */}
      {existingProject && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Iconify
              icon={
                existingProject.status === "JUDGED"
                  ? "mdi:check-circle"
                  : existingProject.status === "UNDER_REVIEW"
                  ? "mdi:progress-clock"
                  : "mdi:file-document"
              }
              sx={{ fontSize: 40, color: "primary.main" }}
            />
            <Box>
              <Typography variant="subtitle1" fontWeight="medium">
                {existingProject.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Team: {existingProject.teamName} | Submitted:{" "}
                {new Date(existingProject.submittedAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Stack>

          {existingProject.status === "SUBMITTED" && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Your project has been submitted and is waiting to be assigned to judges for evaluation.
            </Alert>
          )}

          {existingProject.status === "UNDER_REVIEW" && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Your project is currently being evaluated by judges. Results will be available soon.
            </Alert>
          )}

          {existingProject.status === "JUDGED" && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Your project has been evaluated! Check the leaderboard for results.
            </Alert>
          )}
        </Card>
      )}

      {/* Submission Form */}
      {!existingProject || existingProject.status === "DRAFT" ? (
        <ProjectSubmissionForm
          hackathonId={hackathonId}
          userId={userId}
          registrationId={registrationId || undefined}
          existingProject={existingProject}
          onSuccess={handleSuccess}
        />
      ) : (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Your project has been submitted and cannot be modified at this stage.
          </Typography>
          <Button variant="outlined" href={`/w/${slug}/dashboard`}>
            Go to Dashboard
          </Button>
        </Card>
      )}
    </Box>
  );
}