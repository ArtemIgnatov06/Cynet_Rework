import { useCallback, useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_AGENT_URL ?? "http://localhost:8000";

export function useSaasCloudData(mode = "manageable", count = 6) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${BASE_URL}/api/saasCloud?mode=${encodeURIComponent(mode)}&count=${count}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load SaaS & Cloud data");
    } finally {
      setLoading(false);
    }
  }, [count, mode]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
