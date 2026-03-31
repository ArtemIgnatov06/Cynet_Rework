/**
 * Security API layer
 * ─────────────────
 * Replace the mock functions below with real fetch() / axios calls
 * when connecting to the backend.
 *
 * Each function returns a Promise so the consumer code never changes.
 */

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const MOCK_SECURITY_DATA = {
  lastUpdated: new Date().toISOString(),
  overallScore: 72, // 0-100 — computed from section scores by the hook

  sections: [
    {
      id: "endpoints",
      label: "End Points",
      icon: "💻",
      score: 85,        // 0-100
      status: "warning", // "ok" | "warning" | "critical"
      activeEndpoints: 13,
      issues: [
        {
          id: "ep-1",
          severity: "high",
          title: "Risky Application (PUA) Detected",
          description: "1 potentially unwanted application found on 2 endpoints",
          affectedAssets: ["DESKTOP-A1B2C", "LAPTOP-X9Y8Z"],
          detectedAt: "2025-03-26T14:23:00Z",
          route: "/endpoints/alerts/ep-1",
        },
      ],
      subModules: [
        { name: "Vulnerability Management", enabled: true, ok: true },
        { name: "Endpoint Protection", enabled: true, ok: true },
        { name: "Endpoint Detection & Response", enabled: true, ok: true },
        { name: "Security Posture Management", enabled: true, ok: false },
      ],
    },
    {
      id: "users",
      label: "Users",
      icon: "👤",
      score: 90,
      status: "ok",
      activeUsers: 47,
      issues: [],
      subModules: [
        { name: "Identity Protection", enabled: true, ok: true },
        { name: "User Behavior Analytics", enabled: true, ok: true },
      ],
    },
    {
      id: "network",
      label: "Network",
      icon: "🌐",
      score: 40,
      status: "critical",
      issues: [
        {
          id: "net-1",
          severity: "critical",
          title: "Suspicious Lateral Movement",
          description: "Unusual east-west traffic detected between 3 hosts",
          affectedAssets: ["10.0.1.5", "10.0.1.12", "10.0.1.44"],
          detectedAt: "2025-03-28T09:11:00Z",
          route: "/network/alerts/net-1",
        },
        {
          id: "net-2",
          severity: "high",
          title: "DNS Tunneling Attempt",
          description: "Anomalous DNS query patterns to external resolver",
          affectedAssets: ["10.0.2.8"],
          detectedAt: "2025-03-29T06:55:00Z",
          route: "/network/alerts/net-2",
        },
      ],
      subModules: [
        { name: "Network Detection & Response", enabled: true, ok: false },
        { name: "DNS Filtering", enabled: true, ok: false },
      ],
    },
    {
      id: "email",
      label: "Email",
      icon: "✉️",
      score: 95,
      status: "ok",
      issues: [],
      subModules: [{ name: "Email Filtering", enabled: true, ok: true }],
    },
    {
      id: "saas",
      label: "SaaS & Cloud",
      icon: "☁️",
      score: 60,
      status: "warning",
      issues: [
        {
          id: "saas-1",
          severity: "high",
          title: "Misconfigured S3 Bucket",
          description: "Public read access enabled on a sensitive storage bucket",
          affectedAssets: ["prod-backup-bucket"],
          detectedAt: "2025-03-27T18:44:00Z",
          route: "/saas/alerts/saas-1",
        },
      ],
      subModules: [
        { name: "SaaS & Cloud Security Posture", enabled: true, ok: false },
      ],
    },
    {
      id: "mobile",
      label: "Mobile",
      icon: "📱",
      score: 100,
      status: "ok",
      issues: [],
      subModules: [{ name: "Mobile Protection", enabled: true, ok: true }],
    },
  ],
};

// ─── API FUNCTIONS ───────────────────────────────────────────────────────────

/**
 * Fetch the full security overview.
 * @returns {Promise<typeof MOCK_SECURITY_DATA>}
 */
export async function fetchSecurityOverview() {
  // TODO: replace with real call
  // const res = await fetch('/api/v1/security/overview');
  // if (!res.ok) throw new Error('Failed to fetch security overview');
  // return res.json();

  await delay(600); // simulate network
  return structuredClone(MOCK_SECURITY_DATA);
}

/**
 * Fetch details for a single section.
 * @param {string} sectionId
 * @returns {Promise<(typeof MOCK_SECURITY_DATA.sections)[0]>}
 */
export async function fetchSectionDetails(sectionId) {
  // TODO: replace with real call
  // const res = await fetch(`/api/v1/security/sections/${sectionId}`);
  // return res.json();

  await delay(300);
  const section = MOCK_SECURITY_DATA.sections.find((s) => s.id === sectionId);
  if (!section) throw new Error(`Section "${sectionId}" not found`);
  return structuredClone(section);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
