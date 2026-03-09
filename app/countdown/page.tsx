"use client";
import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Popover,
  TextField,
  Stack,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

// @ts-ignore: No types for react-confetti
import Confetti from "react-confetti";

const CountdownPage = () => {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Convert countdown to ms
  const getMs = ({
    days,
    hours,
    minutes,
    seconds,
  }: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }) => (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds) * 1000;

  // Open modal
  const handleOpenModal = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget as HTMLButtonElement);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setAnchorEl(null);
  };

  // Start countdown
  const handleStart = () => {
    const ms = getMs(countdown);
    setRemaining(ms);
    setActive(true);
    setPaused(false);
    handleCloseModal();
    setShowConfetti(false);
    if (timerRef.current !== null) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setRemaining((prev: number) => {
        if (prev <= 1000) {
          if (timerRef.current !== null) clearInterval(timerRef.current);
          setActive(false);
          setShowConfetti(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
  };

  // Pause
  const handlePause = () => {
    setPaused(true);
    if (timerRef.current !== null) clearInterval(timerRef.current);
  };

  // Reset
  const handleReset = () => {
    setActive(false);
    setPaused(false);
    setRemaining(getMs(countdown));
    setShowConfetti(false);
    if (timerRef.current !== null) clearInterval(timerRef.current);
  };

  // Reconfigure
  const handleReconfigure = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPaused(false);
    setActive(false);
    setShowConfetti(false);
    if (timerRef.current !== null) clearInterval(timerRef.current);
    setAnchorEl(event.currentTarget as HTMLButtonElement);
    setModalOpen(true);
  };

  // Format time
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Modal content
  const modalContent = (
    <Box
      sx={{
        p: 3,
        minWidth: 320,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 4,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Set Countdown
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Days"
          type="number"
          value={countdown.days}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCountdown({ ...countdown, days: Math.max(0, +e.target.value) })
          }
          inputProps={{ min: 0 }}
        />
        <TextField
          label="Hours"
          type="number"
          value={countdown.hours}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCountdown({ ...countdown, hours: Math.max(0, +e.target.value) })
          }
          inputProps={{ min: 0, max: 23 }}
        />
        <TextField
          label="Minutes"
          type="number"
          value={countdown.minutes}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCountdown({
              ...countdown,
              minutes: Math.max(0, +e.target.value),
            })
          }
          inputProps={{ min: 0, max: 59 }}
        />
        <TextField
          label="Seconds"
          type="number"
          value={countdown.seconds}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCountdown({
              ...countdown,
              seconds: Math.max(0, +e.target.value),
            })
          }
          inputProps={{ min: 0, max: 59 }}
        />
      </Stack>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" color="primary" onClick={handleStart}>
          Start
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleCloseModal}>
          Cancel
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        bgcolor: "#f9fafb", // matches HomePage bg-gray-50
        p: 4,
      }}
    >
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />
      )}

      <Typography
        variant="h4"
        sx={{ mb: 3, color: "#1a202c", fontWeight: 600 }}
      >
        Countdown Timer
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          sx={{ fontWeight: 700, color: "#2563eb" }} // primary blue
        >
          {active || paused ? formatTime(remaining) : "--"}
        </Typography>
      </Box>
      <Stack direction="row" spacing={2}>
        {!active && !paused && (
          <Button
            variant="contained"
            sx={{ bgcolor: "#2563eb", color: "#fff", boxShadow: 2 }}
            onClick={handleOpenModal}
          >
            Add Countdown
          </Button>
        )}
        {active && (
          <>
            <Button
              variant="outlined"
              sx={{ borderColor: "#fbbf24", color: "#fbbf24" }}
              onClick={handlePause}
            >
              Pause
            </Button>
            <Button
              variant="outlined"
              sx={{ borderColor: "#ef4444", color: "#ef4444" }}
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              sx={{ bgcolor: "#6366f1", color: "#fff" }}
              onClick={handleReconfigure}
            >
              Reconfigure
            </Button>
          </>
        )}
        {paused && (
          <>
            <Button
              variant="contained"
              sx={{ bgcolor: "#2563eb", color: "#fff" }}
              onClick={handleStart}
            >
              Resume
            </Button>
            <Button
              variant="outlined"
              sx={{ borderColor: "#ef4444", color: "#ef4444" }}
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              sx={{ bgcolor: "#6366f1", color: "#fff" }}
              onClick={handleReconfigure}
            >
              Reconfigure
            </Button>
          </>
        )}
      </Stack>
      <Popover
        open={modalOpen}
        anchorEl={anchorEl}
        onClose={handleCloseModal}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          paper: { sx: { borderRadius: 2, boxShadow: 6, bgcolor: "#fff" } },
        }}
      >
        {modalContent}
      </Popover>
    </Box>
  );
};

export default CountdownPage;
