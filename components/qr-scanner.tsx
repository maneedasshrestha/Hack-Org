"use client";

import { useEffect, useState, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { Html5Qrcode } from "html5-qrcode";
import { Camera as CameraIcon } from "lucide-react";

interface QRScannerProps {
  entitlementId: string;
  entitlementName: string;
  onClose: () => void;
  onScanSuccess: (qrData: string) => void;
}

const QR_SCANNER_ID = "qr-scanner-container-html5";

export default function QRScanner({
  entitlementId,
  entitlementName,
  onClose,
  onScanSuccess,
}: QRScannerProps) {
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatScannerError = (err: unknown, fallback: string) => {
    const baseMessage = err instanceof Error ? err.message : fallback;
    if (err instanceof DOMException && err.name === "NotReadableError") {
      return "Camera is already in use. Close other apps using the camera and try again.";
    }
    if (typeof window !== "undefined" && !window.isSecureContext) {
      return `${baseMessage} (Camera access requires HTTPS or localhost.)`;
    }
    return baseMessage;
  };

  const requestCameraAccess = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera API is not available in this browser");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });

    stream.getTracks().forEach((track) => track.stop());
  };

  const withTimeout = async <T,>(promise: Promise<T>, ms: number) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error("Camera initialization timed out")),
        ms,
      );
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };

  const isNotReadableError = (err: unknown) =>
    err instanceof DOMException && err.name === "NotReadableError";

  const startScanner = async (scanner: Html5Qrcode, cameraId: string) => {
    let attempt = 0;
    while (attempt < 2) {
      try {
        await withTimeout(
          scanner.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              onScanSuccess(decodedText);
              setIsScanning(false);
            },
            (errorMessage) => {
              console.debug("QR scan error:", errorMessage);
            }
          ),
          8000,
        );
        return;
      } catch (err) {
        if (isNotReadableError(err) && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          attempt += 1;
          continue;
        }
        throw err;
      }
    }
  };

  const initializeScanner = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Wait for container to be in DOM
      let attempts = 0;
      while (!containerRef.current && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        attempts++;
      }

      if (!containerRef.current) {
        setError("Failed to find scanner container");
        setIsLoading(false);
        return;
      }

      // Prompt for permission explicitly to avoid silent hangs.
      await withTimeout(requestCameraAccess(), 8000);

      // Get available devices
      const devices = await withTimeout(Html5Qrcode.getCameras(), 8000);
      if (!devices || devices.length === 0) {
        setError("No cameras found. Please check camera permissions.");
        setIsLoading(false);
        return;
      }

      const cameraDevices = devices.map((device, index) => ({
        id: device.id,
        label: device.label || `Camera ${index + 1}`,
      }));
      setCameras(cameraDevices);
      setSelectedCameraId(cameraDevices[0].id);

      // Create scanner instance with container element
      const html5QrCode = new Html5Qrcode(QR_SCANNER_ID);
      scannerRef.current = html5QrCode;

      // Start scanning with first camera (retry once for NotReadableError)
      await startScanner(html5QrCode, cameraDevices[0].id);

      setIsLoading(false);
    } catch (err) {
      console.error("Scanner initialization error:", err);
      setError(formatScannerError(err, "Failed to initialize scanner"));
      setIsLoading(false);
    }
  };

  const handleStartCamera = async () => {
    if (isLoading) return;
    setHasStarted(true);
    await initializeScanner();
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            if (scannerRef.current) {
              return scannerRef.current.clear();
            }
          })
          .catch(() => {});
      }
    };
  }, []);

  // Handle camera change
  const handleCameraChange = async (newCameraId: string) => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await withTimeout(
          scannerRef.current.start(
            newCameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              onScanSuccess(decodedText);
              setIsScanning(false);
            },
            () => {
              // Suppress error messages during scanning
            }
          ),
          8000,
        );
        setSelectedCameraId(newCameraId);
      }
    } catch (err) {
      setError(formatScannerError(err, "Failed to switch camera"));
    }
  };

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          if (scannerRef.current) {
            return scannerRef.current.clear();
          }
        })
        .catch(() => {});
    }
    onClose();
  };

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Scan Entitlement - {entitlementName}</DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          {!hasStarted ? (
            <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Click to enable the camera and start scanning.
              </Typography>
              <Button variant="contained" onClick={handleStartCamera}>
                Enable Camera
              </Button>
            </Stack>
          ) : (
            <>
              {isLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress />
                </Box>
              )}

              {cameras.length > 1 && (
                <FormControl fullWidth size="small">
                  <InputLabel>Camera</InputLabel>
                  <Select
                    value={selectedCameraId}
                    label="Camera"
                    onChange={(e) => handleCameraChange(e.target.value)}
                    startAdornment={
                      <CameraIcon size={18} style={{ marginRight: 8 }} />
                    }
                  >
                    {cameras.map((camera) => (
                      <MenuItem key={camera.id} value={camera.id}>
                        {camera.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Box
                id={QR_SCANNER_ID}
                ref={containerRef}
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  overflow: "hidden",
                  backgroundColor: "#000",
                  minHeight: 300,
                  "& video": {
                    width: "100%",
                    height: "auto",
                    display: "block",
                  },
                }}
              />

              {!isScanning && (
                <Typography
                  variant="body2"
                  color="success"
                  sx={{ textAlign: "center", mt: 2 }}
                >
                  ✓ QR Code scanned successfully! Verifying...
                </Typography>
              )}

              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ textAlign: "center" }}
              >
                Point your camera at a QR code to scan
              </Typography>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
