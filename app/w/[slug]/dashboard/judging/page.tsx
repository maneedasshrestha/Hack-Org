"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import { CriteriaManager } from "@/app/sections/judging/criteria-manager";
import { JudgeManager } from "@/app/sections/judging/judge-manager";
import { Leaderboard } from "@/app/sections/judging/leaderboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type HackathonInfo = {
  id: number;
  name: string;
  joinCode: string;
};

export default function JudgingManagementPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [tab, setTab] = useState(0);
  const [hackathonId, setHackathonId] = useState<number | null>(null);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Get hackathon ID from slug (we need to fetch hackathon by website slug)
        // For now, we'll assume the hackathon ID is available via the API
        // You may need to adjust this based on your actual API structure
        const response = await fetch(`${API_URL}/website/slug/${slug}`, {
          headers: {
            "x-admin-id": storedAdminId,
          },
        });
        const data = await response.json();

        if (data.success && data.website?.hackathon?.id) {
          setHackathonId(data.website.hackathon.id);
        } else {
          setError("Hackathon not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load hackathon data");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

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

  if (!hackathonId || !adminId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Unable to load judging data</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Judging Management
      </Typography>

      <Card sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Criteria" icon={<TabIcon name="criteria" />} iconPosition="start" />
          <Tab label="Judges" icon={<TabIcon name="judges" />} iconPosition="start" />
          <Tab label="Leaderboard" icon={<TabIcon name="leaderboard" />} iconPosition="start" />
        </Tabs>
      </Card>

      <Box sx={{ mt: 3 }}>
        {tab === 0 && <CriteriaManager hackathonId={hackathonId} adminId={adminId} />}
        {tab === 1 && <JudgeManager hackathonId={hackathonId} adminId={adminId} />}
        {tab === 2 && <Leaderboard hackathonId={hackathonId} adminId={adminId} />}
      </Box>
    </Box>
  );
}

// Tab icon component
function TabIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    criteria: "mdi:format-list-checks",
    judges: "mdi:account-star",
    leaderboard: "mdi:trophy",
  };
  return <Box component="span" className="material-icons" sx={{ mr: 1, fontSize: 20 }}>{icons[name]}</Box>;
}