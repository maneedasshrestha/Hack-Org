"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import { Iconify } from "@/components/iconify";

import type { Project, ProjectFormData } from "../judging/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ProjectSubmissionFormProps = {
  hackathonId: number;
  userId: number;
  registrationId?: number;
  existingProject?: Project | null;
  onSuccess?: () => void;
};

export function ProjectSubmissionForm({
  hackathonId,
  userId,
  registrationId,
  existingProject,
  onSuccess,
}: ProjectSubmissionFormProps) {
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    repoUrl: "",
    demoUrl: "",
    presentationUrl: "",
    videoUrl: "",
    teamName: "",
    teamMembers: [],
    teamLeaderEmail: "",
  });

  const [teamMemberInput, setTeamMemberInput] = useState("");

  // Initialize form with existing project data
  useEffect(() => {
    if (existingProject) {
      setFormData({
        name: existingProject.name,
        description: existingProject.description || "",
        repoUrl: existingProject.repoUrl || "",
        demoUrl: existingProject.demoUrl || "",
        presentationUrl: existingProject.presentationUrl || "",
        videoUrl: existingProject.videoUrl || "",
        teamName: existingProject.teamName,
        teamMembers: existingProject.teamMembers,
        teamLeaderEmail: existingProject.teamLeaderEmail || "",
      });
    }
  }, [existingProject]);

  // Add team member
  const handleAddTeamMember = () => {
    const email = teamMemberInput.trim();
    if (email && !formData.teamMembers.includes(email)) {
      setFormData((prev) => ({
        ...prev,
        teamMembers: [...prev.teamMembers, email],
      }));
      setTeamMemberInput("");
    }
  };

  // Remove team member
  const handleRemoveTeamMember = (email: string) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((m) => m !== email),
    }));
  };

  // Submit form
  const handleSubmit = async (asDraft: boolean = false) => {
    if (!formData.name.trim() || !formData.teamName.trim()) {
      setSnackbar({ open: true, message: "Project name and team name are required", severity: "error" });
      return;
    }

    setSaving(true);
    try {
      const url = existingProject
        ? `${API_URL}/projects/${existingProject.id}`
        : `${API_URL}/hackathon/${hackathonId}/projects`;

      const method = existingProject ? "PUT" : "POST";

      const body: Record<string, unknown> = {
        ...formData,
        registrationId,
      };

      if (asDraft) {
        body.status = "DRAFT";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        setSnackbar({
          open: true,
          message: existingProject ? "Project updated successfully!" : "Project submitted successfully!",
          severity: "success",
        });
        onSuccess?.();
      } else {
        setSnackbar({ open: true, message: data.error || "Failed to submit project", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to submit project", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        {existingProject ? "Update Project" : "Submit Your Project"}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Fill in the details below to {existingProject ? "update your" : "submit your"} project for evaluation.
      </Typography>

      <Stack spacing={3}>
        {/* Project Info */}
        <Typography variant="subtitle1" fontWeight="medium">
          Project Information
        </Typography>

        <TextField
          label="Project Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          fullWidth
          placeholder="Enter your project name"
        />

        <TextField
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          fullWidth
          multiline
          rows={4}
          placeholder="Describe your project in detail..."
        />

        {/* Project Links */}
        <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 2 }}>
          Project Links
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Repository URL"
            value={formData.repoUrl}
            onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
            fullWidth
            placeholder="https://github.com/username/repo"
          />
          <TextField
            label="Demo URL"
            value={formData.demoUrl}
            onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
            fullWidth
            placeholder="https://your-demo.com"
          />
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Presentation URL"
            value={formData.presentationUrl}
            onChange={(e) => setFormData({ ...formData, presentationUrl: e.target.value })}
            fullWidth
            placeholder="Link to presentation slides"
          />
          <TextField
            label="Video URL"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            fullWidth
            placeholder="Link to demo video"
          />
        </Stack>

        {/* Team Info */}
        <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 2 }}>
          Team Information
        </Typography>

        <TextField
          label="Team Name *"
          value={formData.teamName}
          onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
          fullWidth
          placeholder="Enter your team name"
        />

        <TextField
          label="Team Leader Email"
          value={formData.teamLeaderEmail}
          onChange={(e) => setFormData({ ...formData, teamLeaderEmail: e.target.value })}
          fullWidth
          type="email"
          placeholder="team-leader@example.com"
        />

        {/* Team Members */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Team Members (Email addresses)
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <TextField
              value={teamMemberInput}
              onChange={(e) => setTeamMemberInput(e.target.value)}
              fullWidth
              placeholder="Enter email address"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTeamMember();
                }
              }}
            />
            <Button variant="outlined" onClick={handleAddTeamMember}>
              Add
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {formData.teamMembers.map((email) => (
              <Chip
                key={email}
                label={email}
                onDelete={() => handleRemoveTeamMember(email)}
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>

        {/* Submit Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
          {!existingProject && (
            <Button variant="outlined" onClick={() => handleSubmit(true)} disabled={saving}>
              Save as Draft
            </Button>
          )}
          <Button
            variant="contained"
            size="large"
            onClick={() => handleSubmit(false)}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <Iconify icon="mdi:send" />}
          >
            {saving ? "Submitting..." : existingProject ? "Update Project" : "Submit Project"}
          </Button>
        </Stack>
      </Stack>

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
    </Card>
  );
}