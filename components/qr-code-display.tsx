"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

interface QRCodeDisplayProps {
  data: string;
  size?: number;
  title?: string;
  showData?: boolean;
}

// Simple QR code generator using canvas
// For production, consider using 'qrcode.react' library
export default function QRCodeDisplay({
  data,
  size = 200,
  title,
  showData = true,
}: QRCodeDisplayProps) {
  // Generate QR code URL using a public API (for demo)
  // In production, use a proper QR library
  const qrUrl = useMemo(() => {
    if (!data) return null;
    // Using QR code API for generation
    const encodedData = encodeURIComponent(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&bgcolor=ffffff&color=000000`;
  }, [data, size]);

  if (!data) {
    return (
      <Paper
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.100",
          minHeight: size + 40,
        }}
      >
        <Typography variant="body2" color="textSecondary">
          No QR code available
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
          Participant needs to be approved first
        </Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      {title && (
        <Typography variant="subtitle1" fontWeight="medium">
          {title}
        </Typography>
      )}

      <Paper
        elevation={3}
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {qrUrl && (
          <img
            src={qrUrl}
            alt="QR Code"
            width={size}
            height={size}
            style={{ display: "block" }}
          />
        )}
      </Paper>

      {showData && (
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{
            fontFamily: "monospace",
            bgcolor: "grey.100",
            px: 1,
            py: 0.5,
            borderRadius: 1,
          }}
        >
          {data}
        </Typography>
      )}
    </Box>
  );
}