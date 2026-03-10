"use client";

import type { CardProps } from "@mui/material/Card";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { useTheme } from "@mui/material/styles";
import { Iconify } from "@/components/iconify";
import { fShortenNumber } from "@/app/utils/format-number";
import { PaletteColorKey } from "@/app/theme";

// ----------------------------------------------------------------------

type StatsCardProps = CardProps & {
  title: string;
  total: number;
  icon: string;
  color?: PaletteColorKey;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
};

export function StatsCard({
  sx,
  icon,
  title,
  total,
  color = "primary",
  subtitle,
  trend,
  ...other
}: StatsCardProps) {
  const theme = useTheme();

  return (
    <Card
      sx={[
        () => ({
          p: 3,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          display: "flex",
          borderRadius: 2,
          alignItems: "center",
          justifyContent: "center",
          bgcolor: `${color}.lighter`,
          color: `${color}.main`,
        }}
      >
        <Iconify icon={icon} width={24} />
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 0.5, typography: "body2", color: "text.secondary" }}>
          {title}
        </Box>

        <Box sx={{ typography: "h4", fontWeight: "fontWeightBold" }}>
          {fShortenNumber(total)}
        </Box>

        {(subtitle || trend) && (
          <Box
            sx={{
              mt: 1,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: trend && trend.value >= 0 ? "success.main" : "error.main",
            }}
          >
            {trend && (
              <>
                <Iconify
                  width={16}
                  icon={
                    trend.value >= 0
                      ? "eva:trending-up-fill"
                      : "eva:trending-down-fill"
                  }
                />
                <Box sx={{ typography: "body2", fontWeight: "fontWeightMedium" }}>
                  {trend.value >= 0 ? "+" : ""}
                  {trend.value}% {trend.label}
                </Box>
              </>
            )}
            {subtitle && !trend && (
              <Box sx={{ typography: "body2", color: "text.secondary" }}>
                {subtitle}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Card>
  );
}