import { useCallback, useEffect, useRef, useState } from "react";

const API_URL = (import.meta.env.VITE_AGENT_URL || "http://localhost:8000").replace(/\/$/, "");

function mapStatusFromScore(score) {
  if (score >= 90) return "ok";
  if (score >= 70) return "warning";
  return "critical";
}

function normalizeSection(section) {
  const score = section.score ?? 100;
  return {
    ...section,
    status: section.status ?? mapStatusFromScore(score),
    issues: Array.isArray(section.issues) ? section.issues : [],
  };
}

export function useSecurityData(pollMs = 30000) {
  const [data, setData] = useState({
    sections: [],
    overallScore: 0,
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setError("");

      const [
        emailRes,
        endpointsRes,
        mobileRes,
        usersRes,
        networkRes,
        saasRes,
      ] = await Promise.all([
        fetch(`${API_URL}/api/email?mode=critical&count=3`, { signal: controller.signal }),
        fetch(`${API_URL}/api/endpoints?mode=manageable&count=6`, { signal: controller.signal }),
        fetch(`${API_URL}/api/mobile?mode=manageable&count=6`, { signal: controller.signal }),
        fetch(`${API_URL}/api/users?mode=critical&count=5`, { signal: controller.signal }),
        fetch(`${API_URL}/api/network?mode=critical&count=3`, { signal: controller.signal }),
        fetch(`${API_URL}/api/saasCloud?mode=manageable&count=6`, { signal: controller.signal }),
      ]);

      const responses = [
        emailRes,
        endpointsRes,
        mobileRes,
        usersRes,
        networkRes,
        saasRes,
      ];

      for (const res of responses) {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
      }

      const [
        emailJson,
        endpointsJson,
        mobileJson,
        usersJson,
        networkJson,
        saasJson,
      ] = await Promise.all(responses.map((res) => res.json()));

      const email = emailJson.email;
      const endpoints = endpointsJson.endpoints;
      const mobile = mobileJson.mobile;
      const users = usersJson.users;
      const network = networkJson.network;
      const saas = saasJson.saasCloud;

      const sections = [
        normalizeSection({
          id: "email",
          label: "Email",
          score:
            email?.attack_level === "green"
              ? 100
              : email?.attack_level === "yellow"
              ? 76
              : 42,
          issues: (email?.blocked_emails ?? [])
            .filter((item) => item.severity !== "safe")
            .map((item) => ({
              id: `email-${item.id}`,
              title: item.subject,
              description: item.reason,
              severity: item.severity,
              route: "/section/email",
            })),
        }),
        normalizeSection({
          id: "endpoints",
          label: "Endpoints",
          score:
            (endpoints?.devices ?? []).every((d) => d.status === "ok")
              ? 98
              : (endpoints?.devices ?? []).some((d) => d.status === "faulty")
              ? 68
              : 82,
          issues: (endpoints?.protectedCategories ?? [])
            .filter((cat) => cat.open > 0)
            .map((cat, idx) => ({
              id: `endpoints-${idx}`,
              title: `${cat.name} exposure detected`,
              description: `${cat.open} open endpoint finding${cat.open > 1 ? "s" : ""}.`,
              severity: cat.open >= 2 ? "critical" : "medium",
              route: "/section/endpoints",
            })),
        }),
        normalizeSection({
          id: "mobile",
          label: "Mobile",
          score: mobile?.health_score ?? ((mobile?.devices ?? []).every((d) => d.status === "ok") ? 97 : (mobile?.devices ?? []).some((d) => d.status === "faulty") ? 70 : 84),
          issues: (mobile?.protectedCategories ?? [])
            .filter((cat) => cat.open > 0)
            .map((cat, idx) => ({
              id: `mobile-${idx}`,
              title: `${cat.name} issue`,
              description: `${cat.open} mobile finding${cat.open > 1 ? "s" : ""} require review.`,
              severity: cat.open >= 2 ? "critical" : "medium",
              route: "/section/mobile",
            })),
        }),
        normalizeSection({
          id: "users",
          label: "Users",
          score:
            (users?.issues ?? []).length === 0
              ? 100
              : (users?.issues ?? []).some((i) => i.severity === "critical")
              ? 63
              : 80,
          issues: (users?.issues ?? []).map((issue) => ({
            ...issue,
            route: "/section/users",
          })),
        }),
        normalizeSection({
          id: "network",
          label: "Network",
          score: network?.health_score ?? (network?.attack_level === "green" ? 100 : network?.attack_level === "yellow" ? 76 : 42),
          issues: (network?.incidents ?? [])
            .filter((item) => item.severity !== "safe")
            .map((item) => ({
              id: `network-${item.id}`,
              title: item.title,
              description: item.description,
              severity: item.severity,
              route: "/section/network",
            })),
        }),
        normalizeSection({
          id: "saasCloud",
          label: "SaaS & Cloud",
          score: saas?.healthScore ?? (saas?.status === "ok" ? 100 : saas?.status === "warning" ? 76 : 42),
          issues: Object.values(saas?.datasets ?? {})
            .flatMap((dataset) => dataset?.issues ?? [])
            .map((item) => ({
              id: item.id,
              title: item.subject,
              description: `${item.service} • ${item.category}`,
              severity: item.severity === "high" ? "warning" : item.severity,
              route: "/section/saasCloud",
            })),
        }),
      ];

      const overallScore = Math.round(
        sections.reduce((sum, s) => sum + (s.score ?? 0), 0) /
          Math.max(sections.length, 1)
      );

      setData({
        sections,
        overallScore,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Failed to load security data");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load();

    if (!pollMs) return undefined;

    const id = setInterval(load, pollMs);
    return () => {
      clearInterval(id);
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [load, pollMs]);

  return {
    data,
    loading,
    error,
    refresh: load,
  };
}
