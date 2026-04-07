"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface BroadcasterContextType {
  currentBroadcaster: string;
  setCurrentBroadcaster: (name: string) => void;
  comparedBroadcasters: string[];
  setComparedBroadcasters: (names: string[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  dashboardData: Record<string, any>;
  setDashboardData: (data: Record<string, any>) => void;
  metrics: Record<string, any>;
  setMetrics: (data: Record<string, any>) => void;
}

const BroadcasterContext = createContext<BroadcasterContextType | undefined>(undefined);

export function BroadcasterProvider({ children }: { children: React.ReactNode }) {
  const [currentBroadcaster, setCurrentBroadcaster] = useState("");
  const [comparedBroadcasters, setComparedBroadcasters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<Record<string, any>>({});
  const [metrics, setMetrics] = useState<Record<string, any>>({});

  const value: BroadcasterContextType = {
    currentBroadcaster,
    setCurrentBroadcaster,
    comparedBroadcasters,
    setComparedBroadcasters,
    isLoading,
    setIsLoading,
    dashboardData,
    setDashboardData,
    metrics,
    setMetrics,
  };

  return (
    <BroadcasterContext.Provider value={value}>
      {children}
    </BroadcasterContext.Provider>
  );
}

export function useBroadcasterContext() {
  const context = useContext(BroadcasterContext);
  if (!context) {
    throw new Error(
      "useBroadcasterContext must be used within BroadcasterProvider"
    );
  }
  return context;
}
