"use client";

import { api } from "@/lib/api";
import type { TrackerHydrated } from "@/lib/tracker-math";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type TrackerContextValue = {
  trackers: TrackerHydrated[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setTrackers: React.Dispatch<React.SetStateAction<TrackerHydrated[]>>;
};

const TrackerContext = createContext<TrackerContextValue | null>(null);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const [trackers, setTrackers] = useState<TrackerHydrated[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listTrackers();
      setTrackers(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to database";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ trackers, loading, error, refresh, setTrackers }),
    [trackers, loading, error, refresh]
  );

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
}

export function useTrackers() {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error("useTrackers must be used within TrackerProvider");
  return ctx;
}
