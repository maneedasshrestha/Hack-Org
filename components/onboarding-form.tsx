"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Iconify } from "@/components/iconify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function OnboardingForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create hackathon state
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");

  // Join hackathon state
  const [joinCode, setJoinCode] = useState("");

  // Get admin info from localStorage
  const adminId = typeof window !== "undefined" ? localStorage.getItem("adminId") : null;
  const adminName = typeof window !== "undefined" ? localStorage.getItem("adminName") : "";

  const handleCreateHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) {
      setError("Please log in first");
      return;
    }

    if (!createName.trim()) {
      setError("Hackathon name is required");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create hackathon
      const response = await fetch(`${API_URL}/hackathon/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: parseInt(adminId),
          name: createName.trim(),
          description: createDescription.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create hackathon");
      }

      // Complete onboarding
      const onboardingResponse = await fetch(`${API_URL}/admin/onboarding-complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: parseInt(adminId),
        }),
      });

      if (!onboardingResponse.ok) {
        console.error("Failed to mark onboarding as complete");
      }

      // Store hackathon info in localStorage
      localStorage.setItem("selectedHackathonId", result.hackathon.id.toString());
      localStorage.setItem("selectedHackathonName", result.hackathon.name);
      if (result.hackathon.website?.id) {
        localStorage.setItem("currentWebsiteId", result.hackathon.website.id.toString());
      }

      setSuccess(`Hackathon "${result.hackathon.name}" created! Join code: ${result.hackathon.joinCode}`);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) {
      setError("Please log in first");
      return;
    }

    if (!joinCode.trim()) {
      setError("Join code is required");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Join hackathon
      const response = await fetch(`${API_URL}/hackathon/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: parseInt(adminId),
          joinCode: joinCode.trim().toUpperCase(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to join hackathon");
      }

      // Complete onboarding
      const onboardingResponse = await fetch(`${API_URL}/admin/onboarding-complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: parseInt(adminId),
        }),
      });

      if (!onboardingResponse.ok) {
        console.error("Failed to mark onboarding as complete");
      }

      // Store hackathon info in localStorage
      localStorage.setItem("selectedHackathonId", result.hackathon.id.toString());
      localStorage.setItem("selectedHackathonName", result.hackathon.name);
      if (result.hackathon.website?.id) {
        localStorage.setItem("currentWebsiteId", result.hackathon.website.id.toString());
      }

      setSuccess(`Successfully joined "${result.hackathon.name}"!`);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)} {...props}>
      {/* Tab buttons */}
      <div className="flex rounded-lg border border-border bg-muted/50 p-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab("create");
            setError(null);
            setSuccess(null);
          }}
          className={cn(
            "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "create"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Iconify icon="mdi:plus-circle" className="mr-2 inline-block h-4 w-4" />
          Create
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("join");
            setError(null);
            setSuccess(null);
          }}
          className={cn(
            "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "join"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Iconify icon="mdi:account-plus" className="mr-2 inline-block h-4 w-4" />
          Join
        </button>
      </div>

      {/* Create Hackathon Form */}
      {activeTab === "create" && (
        <form onSubmit={handleCreateHackathon} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium leading-none">
              Hackathon Name *
            </label>
            <Input
              id="name"
              type="text"
              placeholder="My Awesome Hackathon"
              required
              className="h-9"
              disabled={isLoading}
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium leading-none">
              Description (optional)
            </label>
            <Input
              id="description"
              type="text"
              placeholder="A brief description of your hackathon"
              className="h-9"
              disabled={isLoading}
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              {success}
            </div>
          )}

          <Button type="submit" className="w-full h-9" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Hackathon"}
          </Button>
        </form>
      )}

      {/* Join Hackathon Form */}
      {activeTab === "join" && (
        <form onSubmit={handleJoinHackathon} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="joinCode" className="text-sm font-medium leading-none">
              Join Code *
            </label>
            <Input
              id="joinCode"
              type="text"
              placeholder="ABCD1234"
              required
              className="h-9 uppercase"
              disabled={isLoading}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Enter the 8-character code shared by the hackathon organizer
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              {success}
            </div>
          )}

          <Button type="submit" className="w-full h-9" disabled={isLoading}>
            {isLoading ? "Joining..." : "Join Hackathon"}
          </Button>
        </form>
      )}
    </div>
  );
}