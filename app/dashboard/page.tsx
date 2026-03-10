"use client";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StatsCard } from "../sections/dashboard/stats-card";
import { HackathonStatusChart } from "../sections/dashboard/hackathon-status-chart";
import { HackathonList } from "../sections/dashboard/hackathon-list";
import { RecentRegistrations } from "../sections/dashboard/recent-registrations";
import { QuickActions } from "../sections/dashboard/quick-actions";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type StatsData = {
  summary: {
    totalHackathons: number;
    publishedHackathons: number;
    draftHackathons: number;
    totalParticipants: number;
    pendingRegistrations: number;
    approvedRegistrations: number;
    rejectedRegistrations: number;
    totalMentors: number;
    activeMentors: number;
  };
  hackathons: Array<{
    id: number;
    title: string;
    slug: string;
    status: string;
    participantCount: number;
    mentorCount: number;
    updatedAt: string;
  }>;
  recentRegistrations: Array<{
    id: number;
    userName: string;
    userEmail: string;
    status: string;
    registeredAt: string;
    hackathonTitle: string;
    hackathonSlug: string;
  }>;
  registrationTrends: Array<{
    month: string;
    count: number;
  }>;
};

export function OverviewAnalyticsView() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [adminName, setAdminName] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const adminId = localStorage.getItem("adminId");
      const adminName = localStorage.getItem("adminName");

      if (!adminId) {
        router.push("/login");
        return;
      }

      setAdminName(adminName || "Admin");

      try {
        const response = await fetch(`${API_URL}/stats/admin/${adminId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        } else {
          throw new Error("Failed to load stats");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleHackathonClick = (hackathon: { slug: string }) => {
    router.push(`/w/${hackathon.slug}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No data available
      </Alert>
    );
  }

  return (
    <>
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, {adminName}! Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Total Hackathons"
            total={stats.summary.totalHackathons}
            icon="mdi:calendar-star"
            color="primary"
            subtitle={`${stats.summary.publishedHackathons} published`}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Total Participants"
            total={stats.summary.totalParticipants}
            icon="mdi:account-group"
            color="info"
            subtitle={`${stats.summary.approvedRegistrations} approved`}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Pending Approvals"
            total={stats.summary.pendingRegistrations}
            icon="mdi:clock-outline"
            color="warning"
            subtitle="Awaiting review"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Total Mentors"
            total={stats.summary.totalMentors}
            icon="mdi:account-school"
            color="secondary"
            subtitle={`${stats.summary.activeMentors} active`}
          />
        </Grid>

        {/* Charts Row */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <HackathonStatusChart
            chart={{
              published: stats.summary.publishedHackathons,
              draft: stats.summary.draftHackathons,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <HackathonList
            hackathons={stats.hackathons}
            onHackathonClick={handleHackathonClick}
          />
        </Grid>

        {/* Bottom Row */}
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <RecentRegistrations registrations={stats.recentRegistrations} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <QuickActions />
        </Grid>
      </Grid>
    </>
  );
}

export default OverviewAnalyticsView;