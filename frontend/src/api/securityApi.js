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

// ─── MOCK: FORENSIC DATA ─────────────────────────────────────────────────────
const MOCK_FORENSIC_DATA = {
  files: [
    { id: "ff-1", fileName: "kmsauto_net.exe", risk: 840, companyName: "MSFree Inc.", endpoints: 1, antiViruses: 50, firstSeen: "2025-12-15T10:25:00Z", lastSeen: "2026-03-26T04:29:00Z" },
    { id: "ff-2", fileName: "tumint.dll",       risk: 375, companyName: "ТОО НИЛ Гамма Технологии", endpoints: 1, antiViruses: 3,  firstSeen: "2025-07-17T07:06:00Z", lastSeen: "2026-04-01T06:38:00Z" },
    { id: "ff-3", fileName: "wipe.exe",         risk: 295, companyName: "",                           endpoints: 1, antiViruses: 1,  firstSeen: "2025-07-17T10:18:00Z", lastSeen: "2026-03-31T05:28:00Z" },
    { id: "ff-4", fileName: "launchctl",        risk: 265, companyName: "",                           endpoints: 1, antiViruses: 0,  firstSeen: "2026-01-16T05:35:00Z", lastSeen: "2026-04-02T16:38:00Z" },
    { id: "ff-5", fileName: "ps",               risk: 265, companyName: "",                           endpoints: 1, antiViruses: 0,  firstSeen: "2025-11-23T18:14:00Z", lastSeen: "2026-04-02T16:38:00Z" },
    { id: "ff-6", fileName: "xcode-select",     risk: 265, companyName: "",                           endpoints: 1, antiViruses: 0,  firstSeen: "2025-11-24T06:10:00Z", lastSeen: "2026-04-02T06:23:00Z" },
    { id: "ff-7", fileName: "syslog",           risk: 265, companyName: "",                           endpoints: 1, antiViruses: 0,  firstSeen: "2025-11-22T04:49:00Z", lastSeen: "2026-04-02T06:23:00Z" },
    { id: "ff-8", fileName: "quotacheck",       risk: 265, companyName: "",                           endpoints: 1, antiViruses: 0,  firstSeen: "2025-12-19T17:07:00Z", lastSeen: "2026-04-02T05:48:00Z" },
    { id: "ff-9", fileName: "logger",           risk: 265, companyName: "",                           endpoints: 1, antiViruses: 0,  firstSeen: "2025-11-24T13:38:00Z", lastSeen: "2026-04-01T20:23:00Z" },
    { id: "ff-10", fileName: "newoids.plg",     risk: 265, companyName: "ТОО НИЛ Гамма Технологии",  endpoints: 1, antiViruses: 0,  firstSeen: "2025-09-29T08:56:00Z", lastSeen: "2026-04-01T19:08:00Z" },
  ],
  hosts: [
    { id: "fh-1", hostName: "WINS102",              ip: "10.1.3.20",  os: "Windows Server 2019", group: "Adeline_Endpoint_WIN", lastSeen: "2026-03-03T08:14:00Z", status: "online" },
    { id: "fh-2", hostName: "Worldsokol",           ip: "10.1.2.15",  os: "Windows 11",          group: "Adeline_Endpoint_WIN", lastSeen: "2026-04-02T12:11:00Z", status: "online" },
    { id: "fh-3", hostName: "ws-buh",               ip: "10.1.2.20",  os: "Windows 10",          group: "Adeline_Endpoint_WIN", lastSeen: "2026-03-15T10:33:00Z", status: "online" },
    { id: "fh-4", hostName: "Apple's MacBook Pro",  ip: "127.0.0.1",  os: "macOS 14",            group: "Adeline_Endpoint_MAC", lastSeen: "2026-03-03T08:14:00Z", status: "online" },
    { id: "fh-5", hostName: "MacBook Air - Adeline",ip: "10.1.2.26",  os: "macOS 14",            group: "Adeline_Endpoint_MAC", lastSeen: "2026-02-17T07:06:00Z", status: "offline" },
  ],
  users: [
    { id: "fu-1", userName: "admin@adeline.local",   hostName: "WINS102",              lastLogon: "2026-04-02T08:00:00Z", riskScore: 72, status: "active" },
    { id: "fu-2", userName: "liza@adeline.local",     hostName: "Apple's MacBook Pro",  lastLogon: "2026-04-01T14:22:00Z", riskScore: 18, status: "active" },
    { id: "fu-3", userName: "i.chugalskaya@adeline.local", hostName: "MacBook Air - Adeline", lastLogon: "2026-03-31T09:10:00Z", riskScore: 5,  status: "active" },
  ],
  domains: [
    { id: "fd-1", domain: "update.microsoft.com",  category: "Software Updates", firstSeen: "2025-11-01T00:00:00Z", requests: 1204, risk: 0 },
    { id: "fd-2", domain: "telemetry.apple.com",   category: "Telemetry",        firstSeen: "2025-12-04T00:00:00Z", requests: 880,  risk: 0 },
    { id: "fd-3", domain: "cdn77.org",             category: "CDN",              firstSeen: "2026-01-14T00:00:00Z", requests: 340,  risk: 42 },
    { id: "fd-4", domain: "myfreedom-dns.net",     category: "Unknown",          firstSeen: "2026-03-29T00:00:00Z", requests: 87,   risk: 210 },
  ],
  sockets: [
    { id: "fs-1", process: "chrome.exe",  localPort: 52341, remoteIP: "142.250.74.46",  remotePort: 443, protocol: "TCP", status: "established" },
    { id: "fs-2", process: "svchost.exe", localPort: 49200, remoteIP: "20.54.232.160",  remotePort: 443, protocol: "TCP", status: "established" },
    { id: "fs-3", process: "kmsauto.exe", localPort: 49870, remoteIP: "185.220.101.12", remotePort: 80,  protocol: "TCP", status: "established" },
  ],
};

// ─── MOCK: ACTIONS DATA ───────────────────────────────────────────────────────
const MOCK_ACTIONS_DATA = {
  files: [
    { id: "af-1",  fileName: "C:\\ProgramData\\6aeae35043c9...", hostName: "WINS102", hostIP: "10.1.3.20", startTime: "2026-03-03T08:14:00Z", actionTaken: "Delete", extraDetails: "",                      status: "Deleted",  statusInfo: "Done" },
    { id: "af-2",  fileName: "C:\\ProgramData\\qhpxndiguijf\\pzawovtjthaq.exe", hostName: "WINS102", hostIP: "10.1.3.20", startTime: "2026-03-03T08:14:00Z", actionTaken: "Delete", extraDetails: "", status: "Deleted", statusInfo: "Done" },
    { id: "af-3",  fileName: "C:\\ProgramData\\Auto2\\KMSAuto x64.exe", hostName: "WINS102", hostIP: "10.1.3.20", startTime: "2026-03-03T08:14:00Z", actionTaken: "Delete", extraDetails: "", status: "Deleted", statusInfo: "Done" },
    { id: "af-4",  fileName: "C:\\ProgramData\\Auto\\KMSAuto.exe", hostName: "WINS102", hostIP: "10.1.3.20", startTime: "2026-03-03T08:14:00Z", actionTaken: "Delete", extraDetails: "", status: "Deleted", statusInfo: "Done" },
    { id: "af-5",  fileName: "/Users/liza/Library/Application Support/CrossOver...", hostName: "Apple's MacBook Pro", hostIP: "127.0.0.1", startTime: "2026-03-03T08:14:00Z", actionTaken: "Delete", extraDetails: "", status: "Timeout", statusInfo: "Operation timed out" },
    { id: "af-6",  fileName: "/Users/i.chugalskaya/Library/Containers/com.appl...", hostName: "MacBook Air - Adeline", hostIP: "10.1.2.26", startTime: "2026-03-03T08:14:00Z", actionTaken: "Delete", extraDetails: "", status: "Misc Error", statusInfo: "Failed in Endpoint" },
  ],
  hosts: [
    { id: "ah-1", hostName: "Worldsokol", scanGroup: "Adeline_Endpoint_WIN", time: "2026-10-01T12:11:00Z", actionTaken: "Custom Remediation Endpoint", extraDetails: "Remote Shell",          status: "Execution Failed", statusInfo: "Operation timed out (Last up..." },
    { id: "ah-2", hostName: "Worldsokol", scanGroup: "Adeline_Endpoint_WIN", time: "2025-09-11T06:33:00Z", actionTaken: "Custom Remediation Endpoint", extraDetails: "Remote Desktop Access", status: "Success",          statusInfo: "Standard Output: C:\\Program..." },
    { id: "ah-3", hostName: "Worldsokol", scanGroup: "Adeline_Endpoint_WIN", time: "2025-09-11T06:33:00Z", actionTaken: "Custom Remediation Endpoint", extraDetails: "Remote Shell",          status: "Success",          statusInfo: "Standard Output: C:\\Program..." },
    { id: "ah-4", hostName: "Worldsokol", scanGroup: "Adeline_Endpoint_WIN", time: "2025-09-11T06:33:00Z", actionTaken: "Custom Remediation Endpoint", extraDetails: "Remote Desktop Access", status: "Execution Failed", statusInfo: "Standard Output: C:\\Program..." },
    { id: "ah-5", hostName: "ws-buh",     scanGroup: "Adeline_Endpoint_WIN", time: "2025-07-31T10:33:00Z", actionTaken: "Custom Remediation Endpoint", extraDetails: "Remote Desktop Access", status: "Execution Failed", statusInfo: "Standard Output: C:\\Program..." },
    { id: "ah-6", hostName: "ws-buh",     scanGroup: "Adeline_Endpoint_WIN", time: "2025-07-15T10:12:00Z", actionTaken: "Start Full AV Scan",          extraDetails: "",                      status: "Success",          statusInfo: "Done" },
  ],
  users: [],
  network: [],
  playbooks: [],
  autoRemediation: [
    { id: "ar-1", name: "Process Monitoring", description: "", remediation: "File Remediation -> Kill Process", priority: 1, dateIn: "2025-10-22T06:25:00Z", isEnabled: false },
  ],
};

// ─── MOCK: STATISTICS DATA ────────────────────────────────────────────────────
const MOCK_STATS_DATA = {
  summary: {
    totalAlerts: 127,
    criticalAlerts: 8,
    highAlerts: 34,
    resolvedLast30Days: 85,
    activeEndpoints: 13,
    protectedUsers: 47,
    actionsExecuted: 14,
    dataSourcesConnected: 1,
  },
  alertsOverTime: [
    { label: "Jan 10", count: 11 },
    { label: "Jan 24", count: 4  },
    { label: "Feb 7",  count: 7  },
    { label: "Feb 16", count: 3  },
    { label: "Mar 2",  count: 5  },
    { label: "Mar 16", count: 9  },
    { label: "Mar 26", count: 12 },
  ],
  risksOverTime: [
    { label: "Mar 2",  count: 106 },
    { label: "Mar 9",  count: 71  },
    { label: "Mar 16", count: 84  },
    { label: "Mar 23", count: 98  },
    { label: "Mar 30", count: 212 },
  ],
  protectedCategories: [
    { name: "Risky Application (PUA)",       closed: 0,  open: 1  },
    { name: "Malware",                       closed: 12, open: 0  },
    { name: "Agent Tampering Attempts",      closed: 0,  open: 0  },
    { name: "Ransomware",                    closed: 0,  open: 0  },
    { name: "Legitimate Binaries Exploit",   closed: 0,  open: 0  },
    { name: "Malicious Initial Access",      closed: 0,  open: 0  },
    { name: "Malicious Persistency",         closed: 0,  open: 0  },
    { name: "Privilege Escalation",          closed: 0,  open: 0  },
    { name: "Malicious Evasion Attempts",    closed: 0,  open: 0  },
    { name: "Credentials Theft Attempts",    closed: 0,  open: 0  },
  ],
  riskCategories: [
    { name: "Vulnerabilities", count: 212, open: 36 },
    { name: "Misconfigurations", count: 18, open: 4 },
    { name: "Exposed Credentials", count: 5, open: 2 },
  ],
  modules: [
    { name: "Endpoint Security",         subtitle: "13 Active Endpoints",    alerts: 1, status: "warning" },
    { name: "User, Network & Deception", subtitle: "",                        alerts: 0, status: "ok"      },
    { name: "XDR / ITDR",               subtitle: "1 Data Source / No External", alerts: 0, status: "ok" },
    { name: "Automation",               subtitle: "14 Actions Executed",     alerts: 0, status: "ok"      },
    { name: "SaaS & Cloud",             subtitle: "Not Licensed",            alerts: 0, status: "disabled" },
    { name: "Email Security",           subtitle: "Not Licensed",            alerts: 0, status: "disabled" },
  ],
};

// ─── API FUNCTIONS (Forensic) ─────────────────────────────────────────────────

export async function fetchForensicData() {
  // TODO: replace with real call
  // const res = await fetch('/api/v1/forensic');
  // return res.json();
  await delay(400);
  return structuredClone(MOCK_FORENSIC_DATA);
}

// ─── API FUNCTIONS (Actions) ──────────────────────────────────────────────────

export async function fetchActionsData() {
  // TODO: replace with real call
  // const res = await fetch('/api/v1/actions');
  // return res.json();
  await delay(400);
  return structuredClone(MOCK_ACTIONS_DATA);
}

// ─── API FUNCTIONS (Statistics) ───────────────────────────────────────────────

export async function fetchStatsData() {
  // TODO: replace with real call
  // const res = await fetch('/api/v1/statistics');
  // return res.json();
  await delay(300);
  return structuredClone(MOCK_STATS_DATA);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
