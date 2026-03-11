"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { Iconify } from "@/components/iconify";
import { DashboardContent } from "@/app/layouts/dashboard";
import { ProjectEvaluator } from "@/app/sections/judging/project-evaluator";

export default function ProjectEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const hackathonId = parseInt(params.hackathonId as string);
  const assignmentId = parseInt(params.assignmentId as string);

  const [adminId, setAdminId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAdminId = localStorage.getItem("adminId");
    if (!storedAdminId) {
      setLoading(false);
      return;
    }
    setAdminId(parseInt(storedAdminId));
    setLoading(false);
  }, []);

  const handleComplete = () => {
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

  if (!adminId) {
    return (
      <DashboardContent>
        <Alert severity="error" sx={{ m: 3 }}>
          Not authenticated
        </Alert>
        <Box sx={{ px: 3 }}>
          <Button onClick={() => router.push("/judging")}>Back to Judging</Button>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      {/* Back Button */}
      <Button
        startIcon={<Iconify icon="mdi:arrow-left" />}
        onClick={() => router.push(`/judging/${hackathonId}`)}
        sx={{ mb: 3 }}
      >
        Back to Judging Board
      </Button>

      {/* Project Evaluator */}
      <ProjectEvaluator
        assignmentId={assignmentId}
        adminId={adminId}
        onComplete={handleComplete}
      />
    </DashboardContent>
  );
}