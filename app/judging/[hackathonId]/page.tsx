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
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import { Iconify } from "@/components/iconify";
import { DashboardContent } from "@/app/layouts/dashboard";

import { CriteriaManager } from "@/app/sections/judging/criteria-manager";
import { JudgeManager } from "@/app/sections/judging/judge-manager";
import { Leaderboard } from "@/app/sections/judging/leaderboard";
import { JudgingOverview } from "@/app/sections/judging/judging-overview";
import { AssignmentManager } from "@/app/sections/judging/assignment-manager";
import { MyEvaluations } from "@/app/sections/judging/my-evaluations";

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

export default function HackathonJudgingPage() {
  const params = useParams();
  const router = useRouter();
  const hackathonId = parseInt(params.hackathonId as string);

  const [adminId, setAdminId] = useState<number | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    const storedAdminId = localStorage.getItem("adminId");
    if (!storedAdminId) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }
    setAdminId(parseInt(storedAdminId));
  }, []);

  useEffect(() => {
    if (!adminId || !hackathonId) return;

    const fetchOverview = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/judging/hackathon/${hackathonId}/overview`, {
          headers: { "x-admin-id": adminId.toString() },
        });
        const data = await response.json();
        if (data.success) {
          setOverview(data.overview);
        } else {
          setError(data.error || "Failed to fetch hackathon");
        }
      } catch (err) {
        console.error("Error fetching overview:", err);
        setError("Failed to load hackathon");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [adminId, hackathonId]);

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (error || !adminId) {
    return (
      <DashboardContent>
        <Alert severity="error" sx={{ m: 3 }}>
          {error || "Not authenticated"}
        </Alert>
        <Box sx={{ px: 3 }}>
          <Button startIcon={<Iconify icon="mdi:arrow-left" />} onClick={() => router.push("/judging")}>
            Back to Judging
          </Button>
        </Box>
      </DashboardContent>
    );
  }

  if (!overview) {
    return (
      <DashboardContent>
        <Alert severity="error" sx={{ m: 3 }}>
          Hackathon not found or you don't have access.
        </Alert>
        <Box sx={{ px: 3 }}>
          <Button startIcon={<Iconify icon="mdi:arrow-left" />} onClick={() => router.push("/judging")}>
            Back to Judging
          </Button>
        </Box>
      </DashboardContent>
    );
  }

  const { isOrganizer, isJudge } = overview;

  // Define tabs based on role
  const tabs = [];
  tabs.push({ label: "Overview", value: "overview" });

  if (isOrganizer) {
    tabs.push({ label: "Criteria", value: "criteria" });
    tabs.push({ label: "Judges", value: "judges" });
    tabs.push({ label: "Assignments", value: "assignments" });
  }

  if (isJudge) {
    tabs.push({ label: "My Evaluations", value: "evaluations" });
  }

  tabs.push({ label: "Leaderboard", value: "leaderboard" });

  const renderTabContent = () => {
    const tabValue = tabs[currentTab]?.value;

    switch (tabValue) {
      case "overview":
        return <JudgingOverview hackathonId={hackathonId} adminId={adminId} />;
      case "criteria":
        return <CriteriaManager hackathonId={hackathonId} adminId={adminId} />;
      case "judges":
        return <JudgeManager hackathonId={hackathonId} adminId={adminId} />;
      case "assignments":
        return <AssignmentManager hackathonId={hackathonId} adminId={adminId} />;
      case "evaluations":
        return <MyEvaluations hackathonId={hackathonId} adminId={adminId} />;
      case "leaderboard":
        return <Leaderboard hackathonId={hackathonId} adminId={adminId} />;
      default:
        return null;
    }
  };

  return (
    <DashboardContent>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Button
              startIcon={<Iconify icon="mdi:arrow-left" />}
              onClick={() => router.push("/judging")}
            >
              Back
            </Button>
          </Stack>
          <Typography variant="h4">{overview.hackathon.name}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            {isOrganizer && <Chip label="Organizer" color="primary" size="small" />}
            {isJudge && <Chip label="Judge" color="secondary" size="small" />}
          </Stack>
        </Box>
      </Stack>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab key={tab.value} label={tab.label} id={`judging-tab-${index}`} />
          ))}
        </Tabs>
      </Card>

      {/* Tab Content */}
      <Box>{renderTabContent()}</Box>
    </DashboardContent>
  );
}