"use client";

// Type for hackathon workspace data
export type HackathonWorkspace = {
  id: string;
  name: string;
  logo: string;
  plan: string;
  joinCode?: string;
  website?: any;
};

// This is now a placeholder - actual workspaces are fetched dynamically
// in the NavContent component based on the admin's hackathons
export const _workspaces: HackathonWorkspace[] = [];