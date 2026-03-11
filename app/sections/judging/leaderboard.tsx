"use client";

import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { Iconify } from "@/components/iconify";

import type { LeaderboardEntry } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type LeaderboardProps = {
  hackathonId: number;
  adminId?: number;
  isPublic?: boolean;
};

export function Leaderboard({ hackathonId, adminId, isPublic = false }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (adminId) {
        headers["x-admin-id"] = adminId.toString();
      }

      const response = await fetch(`${API_URL}/hackathon/${hackathonId}/leaderboard`, {
        headers,
      });
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      } else {
        setError(data.error || "Failed to fetch leaderboard");
      }
    } catch (err) {
      setError("Failed to fetch leaderboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [hackathonId, adminId]);

  useState(() => {
    fetchLeaderboard();
  });

  const getRankColor = (rank: number) => {
    if (rank === 1) return "#FFD700"; // Gold
    if (rank === 2) return "#C0C0C0"; // Silver
    if (rank === 3) return "#CD7F32"; // Bronze
    return "transparent";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "emoji_events";
    if (rank === 2) return "military_tech";
    if (rank === 3) return "workspace_premium";
    return null;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card sx={{ p: 4, textAlign: "center" }}>
        <Iconify icon="mdi:trophy-outline" width={48} sx={{ color: "text.disabled", mb: 2 }} />
        <Typography color="text.secondary">
          No projects have been evaluated yet. Leaderboard will appear here once judging is complete.
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6">Leaderboard</Typography>
        <Button startIcon={<Iconify icon="mdi:refresh" />} onClick={fetchLeaderboard}>
          Refresh
        </Button>
      </Stack>

      {/* Top 3 podium view */}
      {leaderboard.length >= 3 && (
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="flex-end"
          spacing={2}
          sx={{ mb: 4 }}
        >
          {/* 2nd Place */}
          <Box sx={{ textAlign: "center", width: 120 }}>
            <Card
              sx={{
                p: 2,
                bgcolor: "grey.100",
                height: 100,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Iconify icon="mdi:medal" width={32} sx={{ color: "#C0C0C0", mb: 1 }} />
              <Typography variant="body2" fontWeight="bold" noWrap>
                {leaderboard[1]?.teamName}
              </Typography>
              <Typography variant="h6" color="primary">
                {leaderboard[1]?.avgScore?.toFixed(1)}
              </Typography>
            </Card>
            <Chip label="2nd" size="small" sx={{ mt: 1 }} />
          </Box>

          {/* 1st Place */}
          <Box sx={{ textAlign: "center", width: 140 }}>
            <Card
              sx={{
                p: 2,
                bgcolor: "warning.lighter",
                height: 130,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Iconify icon="mdi:trophy" width={40} sx={{ color: "#FFD700", mb: 1 }} />
              <Typography variant="body1" fontWeight="bold" noWrap>
                {leaderboard[0]?.teamName}
              </Typography>
              <Typography variant="h5" color="warning.main" fontWeight="bold">
                {leaderboard[0]?.avgScore?.toFixed(1)}
              </Typography>
            </Card>
            <Chip label="1st" color="warning" size="small" sx={{ mt: 1 }} />
          </Box>

          {/* 3rd Place */}
          <Box sx={{ textAlign: "center", width: 120 }}>
            <Card
              sx={{
                p: 2,
                bgcolor: "grey.100",
                height: 80,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Iconify icon="mdi:medal-outline" width={28} sx={{ color: "#CD7F32", mb: 1 }} />
              <Typography variant="body2" fontWeight="bold" noWrap>
                {leaderboard[2]?.teamName}
              </Typography>
              <Typography variant="h6" color="primary">
                {leaderboard[2]?.avgScore?.toFixed(1)}
              </Typography>
            </Card>
            <Chip label="3rd" size="small" sx={{ mt: 1 }} />
          </Box>
        </Stack>
      )}

      {/* Full table */}
      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ width: 60 }}>Rank</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Team</TableCell>
              <TableCell align="center">Score</TableCell>
              <TableCell align="center">Judges</TableCell>
              <TableCell align="center">Status</TableCell>
              {!isPublic && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.map((entry) => (
              <TableRow
                key={entry.id}
                hover
                sx={{
                  bgcolor: entry.rank <= 3 ? `${getRankColor(entry.rank)}20` : "inherit",
                }}
              >
                <TableCell align="center">
                  <Stack direction="row" alignItems="center" justifyContent="center">
                    {getRankIcon(entry.rank) ? (
                      <Iconify
                        icon={`mdi:${getRankIcon(entry.rank)}`}
                        sx={{ color: getRankColor(entry.rank) }}
                      />
                    ) : (
                      <Typography fontWeight="bold">{entry.rank}</Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography fontWeight="medium">{entry.name}</Typography>
                  {entry.description && (
                    <Typography variant="caption" color="text.secondary">
                      {entry.description.substring(0, 50)}
                      {entry.description.length > 50 ? "..." : ""}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{entry.teamName}</TableCell>
                <TableCell align="center">
                  <Typography fontWeight="bold" color="primary.main">
                    {entry.avgScore?.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="center">{entry.judgeCount}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={entry.status}
                    size="small"
                    color={
                      entry.status === "WINNER"
                        ? "success"
                        : entry.status === "FINALIST"
                        ? "warning"
                        : "default"
                    }
                  />
                </TableCell>
                {!isPublic && (
                  <TableCell align="right">
                    {entry.demoUrl && (
                      <Button
                        size="small"
                        variant="outlined"
                        href={entry.demoUrl}
                        target="_blank"
                      >
                        View Demo
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
        Showing {leaderboard.length} evaluated projects
      </Typography>
    </Box>
  );
}