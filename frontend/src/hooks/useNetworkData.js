import { useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_AGENT_URL ?? "http://localhost:8000";

export function useNetworkData(mode = "critical", count = 3) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${BASE_URL}/api/network?mode=${mode}&count=${count}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => { if (!cancelled) { setData(json); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setLoading(false); } });

    return () => { cancelled = true; };
  }, [mode, count]);

  return { data, loading, error };
}
