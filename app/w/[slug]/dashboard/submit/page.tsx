"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { Iconify } from "@/components/iconify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Project {
  id: number;
  name: string;
  description: string;
  repoUrl: string;
  demoUrl: string;
  presentationUrl: string;
  videoUrl: string;
  teamName: string;
  teamMembers: string[];
  teamLeaderEmail: string;
  status: string;
  submittedAt: string;
}

export default function ProjectSubmissionPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hackathonId, setHackathonId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [registrationId, setRegistrationId] = useState<number | null>(null);
  const [existingProject, setExistingProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    repoUrl: "",
    demoUrl: "",
    presentationUrl: "",
    videoUrl: "",
    teamName: "",
    teamMembers: "",
    teamLeaderEmail: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserId = localStorage.getItem("userId");
        if (!storedUserId) {
          setError("Please log in to submit a project");
          return;
        }
        setUserId(parseInt(storedUserId));

        const websiteRes = await fetch(`${API_URL}/website/slug/${slug}`);
        const websiteData = await websiteRes.json();

        if (!websiteData.success || !websiteData.website?.hackathon?.id) {
          setError("Hackathon not found");
          return;
        }
        setHackathonId(websiteData.website.hackathon.id);

        const registrationRes = await fetch(
          `${API_URL}/registration/check?userId=${storedUserId}&hackathonId=${websiteData.website.hackathon.id}`
        );
        const registrationData = await registrationRes.json();

        if (registrationData.success && registrationData.registration) {
          setRegistrationId(registrationData.registration.id);
        }

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
            setFormData({
              name: userProject.name || "",
              description: userProject.description || "",
              repoUrl: userProject.repoUrl || "",
              demoUrl: userProject.demoUrl || "",
              presentationUrl: userProject.presentationUrl || "",
              videoUrl: userProject.videoUrl || "",
              teamName: userProject.teamName || "",
              teamMembers: (userProject.teamMembers || []).join(", "),
              teamLeaderEmail: userProject.teamLeaderEmail || "",
            });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        teamMembers: formData.teamMembers
          .split(",")
          .map((m) => m.trim())
          .filter((m) => m),
        registrationId,
      };

      const url = existingProject
        ? `${API_URL}/projects/${existingProject.id}`
        : `${API_URL}/hackathon/${hackathonId}/projects`;

      const res = await fetch(url, {
        method: existingProject ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("Project submitted successfully!");
        setExistingProject(data.project);
      } else {
        setError(data.error || "Failed to submit project");
      }
    } catch (err) {
      setError("Failed to submit project");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !hackathonId) {
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
            Submit your hackathon project
          </Typography>
        </Box>
        {existingProject && (
          <Chip
            label={existingProject.status}
            color={existingProject.status === "SUBMITTED" ? "info" : "default"}
          />
        )}
      </Stack>

      {/* Status Info */}
      {existingProject && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Iconify
              icon="mdi:file-document"
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
              Your project has been submitted successfully.
            </Alert>
          )}
        </Card>
      )}

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Submission Form */}
      {(!existingProject || existingProject.status === "DRAFT") && (
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Project Name"
                  required
                  fullWidth
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <TextField
                  label="Team Name"
                  required
                  fullWidth
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                />
                <TextField
                  label="Team Members (comma-separated emails)"
                  fullWidth
                  value={formData.teamMembers}
                  onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
                  helperText="Enter team member emails separated by commas"
                />
                <TextField
                  label="Team Leader Email"
                  type="email"
                  fullWidth
                  value={formData.teamLeaderEmail}
                  onChange={(e) => setFormData({ ...formData, teamLeaderEmail: e.target.value })}
                />
                <TextField
                  label="Description"
                  multiline
                  rows={4}
                  fullWidth
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <TextField
                  label="Repository URL"
                  type="url"
                  fullWidth
                  value={formData.repoUrl}
                  onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                  placeholder="https://github.com/..."
                />
                <TextField
                  label="Demo URL"
                  type="url"
                  fullWidth
                  value={formData.demoUrl}
                  onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                  placeholder="https://..."
                />
                <TextField
                  label="Presentation URL"
                  type="url"
                  fullWidth
                  value={formData.presentationUrl}
                  onChange={(e) => setFormData({ ...formData, presentationUrl: e.target.value })}
                />
                <TextField
                  label="Video URL"
                  type="url"
                  fullWidth
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                />

                {error && <Alert severity="error">{error}</Alert>}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} /> : <Iconify icon="mdi:send" />}
                >
                  {existingProject ? "Update Project" : "Submit Project"}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      )}

      {existingProject && existingProject.status !== "DRAFT" && (
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