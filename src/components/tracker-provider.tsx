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
  refresh: () => Promise<void>;
  setTrackers: React.Dispatch<React.SetStateAction<TrackerHydrated[]>>;
};

const TrackerContext = createContext<TrackerContextValue | null>(null);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const [trackers, setTrackers] = useState<TrackerHydrated[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listTrackers();
      setTrackers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ trackers, loading, refresh, setTrackers }),
    [trackers, loading, refresh]
  );

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
}

export function useTrackers() {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error("useTrackers must be used within TrackerProvider");
  return ctx;
}
