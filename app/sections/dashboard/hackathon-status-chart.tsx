"use client";

import type { CardProps } from "@mui/material/Card";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import {
  Chart,
  ChartLegends,
  ChartOptions,
  useChart,
} from "@/components/chart";
import { fNumber } from "@/app/utils/format-number";

// ----------------------------------------------------------------------

type HackathonStatusChartProps = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    published: number;
    draft: number;
  };
};

export function HackathonStatusChart({
  title = "Hackathon Status",
  subheader,
  chart,
  sx,
  ...other
}: HackathonStatusChartProps) {
  const chartSeries = [chart.published, chart.draft];

  const chartColors = ["#22c55e", "#f59e0b"]; // green for published, amber for draft

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    labels: ["Published", "Draft"],
    stroke: { width: 0 },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
        title: { formatter: (seriesName: string) => `${seriesName}` },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 600,
            },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: 700,
              formatter: (value: number) => fNumber(value),
            },
            total: {
              show: true,
              label: "Total",
              formatter: () => fNumber(chart.published + chart.draft),
            },
          },
        },
      },
    },
    legend: { show: false },
  });

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Chart
        type="donut"
        series={chartSeries}
        options={chartOptions}
        sx={{
          my: 4,
          mx: "auto",
          width: { xs: 200, xl: 220 },
          height: { xs: 200, xl: 220 },
        }}
      />

      <ChartLegends
        labels={["Published", "Draft"]}
        colors={chartColors}
        sx={{ p: 3, justifyContent: "center" }}
      />
    </Card>
  );
}