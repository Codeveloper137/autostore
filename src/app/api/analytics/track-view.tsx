"use client";
import { useEffect } from "react";

type Props = { type: "VEHICLE_VIEW" | "PAGE_VIEW" | "SITE_VIEW"; vehicleId?: string; path: string };

export function TrackView({ type, vehicleId, path }: Props) {
  useEffect(() => {
    void fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, vehicleId, path }),
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}