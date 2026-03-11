"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types
export type Hackathon = {
  id: string;
  name: string;
  logo?: string;
  plan: string;
  joinCode?: string;
  website?: {
    id: number;
    title: string;
    slug: string;
    status: string;
  };
};

type HackathonContextType = {
  // Currently selected hackathon
  selectedHackathonId: string | null;
  selectedHackathonName: string | null;

  // All hackathons for the admin
  hackathons: Hackathon[];

  // Loading states
  loading: boolean;

  // Actions
  setSelectedHackathon: (id: string, name: string) => void;
  refreshHackathons: () => Promise<void>;

  // Get current hackathon's join code
  getSelectedJoinCode: () => string | null;

  // Get current hackathon's website ID
  getSelectedWebsiteId: () => number | null;
};

const HackathonContext = createContext<HackathonContextType | undefined>(undefined);

// ----------------------------------------------------------------------

type HackathonProviderProps = {
  children: ReactNode;
};

export function HackathonProvider({ children }: HackathonProviderProps) {
  const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(null);
  const [selectedHackathonName, setSelectedHackathonName] = useState<string | null>(null);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all hackathons for the admin
  const refreshHackathons = useCallback(async () => {
    const adminId = localStorage.getItem("adminId");
    if (!adminId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/hackathon/my/${adminId}`);
      const result = await response.json();

      if (result.success && result.hackathons) {
        const hackathonData: Hackathon[] = result.hackathons.map((h: any) => ({
          id: h.id.toString(),
          name: h.name,
          logo: "/assets/icons/workspaces/logo-1.webp",
          plan: h.role === "OWNER" ? "Owner" : "Member",
          joinCode: h.joinCode,
          website: h.website,
        }));
        setHackathons(hackathonData);

        // Auto-select if no selection exists
        const storedId = localStorage.getItem("selectedHackathonId");
        if (!storedId && hackathonData.length > 0) {
          setSelectedHackathonId(hackathonData[0].id);
          setSelectedHackathonName(hackathonData[0].name);
          localStorage.setItem("selectedHackathonId", hackathonData[0].id);
          localStorage.setItem("selectedHackathonName", hackathonData[0].name);
        }
      }
    } catch (error) {
      console.error("Error fetching hackathons:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedId = localStorage.getItem("selectedHackathonId");
    const storedName = localStorage.getItem("selectedHackathonName");

    if (storedId) {
      setSelectedHackathonId(storedId);
      setSelectedHackathonName(storedName);
    }

    refreshHackathons();
  }, [refreshHackathons]);

  // Listen for hackathon change events from WorkspacesPopover
  useEffect(() => {
    const handleHackathonChanged = (event: CustomEvent<Hackathon>) => {
      const hackathon = event.detail;
      setSelectedHackathonId(hackathon.id);
      setSelectedHackathonName(hackathon.name);
    };

    const handleHackathonJoined = (event: CustomEvent<any>) => {
      // Refresh the hackathons list when a new one is joined
      refreshHackathons();
    };

    window.addEventListener("hackathonChanged", handleHackathonChanged as EventListener);
    window.addEventListener("hackathonJoined", handleHackathonJoined as EventListener);

    return () => {
      window.removeEventListener("hackathonChanged", handleHackathonChanged as EventListener);
      window.removeEventListener("hackathonJoined", handleHackathonJoined as EventListener);
    };
  }, [refreshHackathons]);

  // Set selected hackathon
  const setSelectedHackathon = useCallback((id: string, name: string) => {
    setSelectedHackathonId(id);
    setSelectedHackathonName(name);
    localStorage.setItem("selectedHackathonId", id);
    localStorage.setItem("selectedHackathonName", name);

    // Dispatch event for other components
    window.dispatchEvent(
      new CustomEvent("hackathonChanged", {
        detail: { id, name },
      })
    );

    // Store website ID if available
    const hackathon = hackathons.find((h) => h.id === id);
    if (hackathon?.website?.id) {
      localStorage.setItem("currentWebsiteId", hackathon.website.id.toString());
    }
  }, [hackathons]);

  // Get join code for selected hackathon
  const getSelectedJoinCode = useCallback(() => {
    const hackathon = hackathons.find((h) => h.id === selectedHackathonId);
    return hackathon?.joinCode || null;
  }, [hackathons, selectedHackathonId]);

  // Get website ID for selected hackathon
  const getSelectedWebsiteId = useCallback(() => {
    const hackathon = hackathons.find((h) => h.id === selectedHackathonId);
    return hackathon?.website?.id || null;
  }, [hackathons, selectedHackathonId]);

  const value: HackathonContextType = {
    selectedHackathonId,
    selectedHackathonName,
    hackathons,
    loading,
    setSelectedHackathon,
    refreshHackathons,
    getSelectedJoinCode,
    getSelectedWebsiteId,
  };

  return (
    <HackathonContext.Provider value={value}>
      {children}
    </HackathonContext.Provider>
  );
}

// ----------------------------------------------------------------------

export function useHackathon(): HackathonContextType {
  const context = useContext(HackathonContext);
  if (context === undefined) {
    throw new Error("useHackathon must be used within a HackathonProvider");
  }
  return context;
}