"use client";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { DashboardContent } from "../layouts/dashboard";

export default function BlogPage() {
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Itenary
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="body1">
            Itenary page content goes here...
          </Typography>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
