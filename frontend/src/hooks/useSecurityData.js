import { useState, useEffect, useCallback } from "react";
import { fetchSecurityOverview } from "../api/securityApi";

/**
 * useSecurityData
 * ───────────────
 * Fetches the full security overview and computes the overall health score.
 * Polling interval (ms) can be passed as an argument; default is 0 (no polling).
 */
export function useSecurityData(pollInterval = 0) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const raw = await fetchSecurityOverview();
      // Compute overall score as average of section scores
      const avg =
        raw.sections.reduce((sum, s) => sum + s.score, 0) /
        raw.sections.length;
      setData({ ...raw, overallScore: Math.round(avg) });
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    if (pollInterval > 0) {
      const id = setInterval(load, pollInterval);
      return () => clearInterval(id);
    }
  }, [load, pollInterval]);

  return { data, loading, error, refresh: load };
}
