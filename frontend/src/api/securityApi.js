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
  apiCallActions: [
    { id: "aca-1",  fileName: "C:\\ProgramData\\Cynet\\CynetEPS.exe",             time: "2026-03-15T09:10:00Z", actionName: "File Hash Query",       status: "Success", statusDescription: "Hash found in threat intel",      action: "Report" },
    { id: "aca-2",  fileName: "C:\\Windows\\System32\\svchost.exe",               time: "2026-03-15T09:12:00Z", actionName: "File Hash Query",       status: "Success", statusDescription: "Clean file confirmed",             action: "Allow" },
    { id: "aca-3",  fileName: "C:\\Users\\admin\\Downloads\\setup.exe",           time: "2026-03-15T09:45:00Z", actionName: "Submit to Sandbox",     status: "Pending", statusDescription: "Queued for analysis",              action: "Quarantine" },
    { id: "aca-4",  fileName: "C:\\ProgramData\\malware\\payload.dll",            time: "2026-03-14T14:20:00Z", actionName: "File Hash Query",       status: "Failed",  statusDescription: "API timeout",                     action: "Block" },
    { id: "aca-5",  fileName: "/usr/local/bin/suspicious_script.sh",             time: "2026-03-14T11:05:00Z", actionName: "Submit to Sandbox",     status: "Success", statusDescription: "Analysis complete — malicious",    action: "Delete" },
    { id: "aca-6",  fileName: "C:\\Temp\\update_tool.exe",                        time: "2026-03-13T16:33:00Z", actionName: "File Hash Query",       status: "Success", statusDescription: "Unknown hash",                    action: "Analyze" },
    { id: "aca-7",  fileName: "C:\\Users\\jdoe\\AppData\\Local\\Temp\\a.bat",    time: "2026-03-13T08:50:00Z", actionName: "Submit to Sandbox",     status: "Failed",  statusDescription: "Submission rejected — too large", action: "Report" },
    { id: "aca-8",  fileName: "C:\\Program Files\\Office\\excel.exe",            time: "2026-03-12T13:22:00Z", actionName: "File Hash Query",       status: "Success", statusDescription: "Clean",                           action: "Allow" },
  ],
  analysisActions: [
    { id: "ana-1", filePath: "C:\\ProgramData\\6aeae35043c9\\dropper.exe",       hostName: "WINS102",                 hashes: "a1b2c3d4e5f6...", startTime: "2026-03-15T08:00:00Z", endTime: "2026-03-15T08:04:00Z", staticResult: "Malicious",  dynamicResult: "Malicious"  },
    { id: "ana-2", filePath: "C:\\ProgramData\\Auto2\\KMSAuto x64.exe",         hostName: "WINS102",                 hashes: "deadbeef1234...", startTime: "2026-03-15T08:05:00Z", endTime: "2026-03-15T08:09:00Z", staticResult: "Suspicious", dynamicResult: "Clean"      },
    { id: "ana-3", filePath: "C:\\Users\\admin\\Downloads\\setup.exe",          hostName: "DESKTOP-1QBCD2R",         hashes: "cafebabe5678...", startTime: "2026-03-14T12:00:00Z", endTime: null,                   staticResult: "Unknown",    dynamicResult: "Unknown"    },
    { id: "ana-4", filePath: "/Users/liza/Library/Containers/suspicious.app",  hostName: "Apple's MacBook Pro",     hashes: "f00dface9abc...", startTime: "2026-03-14T09:15:00Z", endTime: "2026-03-14T09:22:00Z", staticResult: "Clean",      dynamicResult: "Suspicious" },
    { id: "ana-5", filePath: "C:\\Windows\\Temp\\winupd.exe",                   hostName: "Worldsokol",              hashes: "0123456789ab...", startTime: "2026-03-13T17:30:00Z", endTime: "2026-03-13T17:36:00Z", staticResult: "Malicious",  dynamicResult: "Malicious"  },
    { id: "ana-6", filePath: "C:\\ProgramData\\malware\\payload.dll",           hostName: "ws-buh",                  hashes: "abcdef012345...", startTime: "2026-03-12T11:00:00Z", endTime: "2026-03-12T11:08:00Z", staticResult: "Malicious",  dynamicResult: "Malicious"  },
  ],
  decoyFiles: [
    { id: "df-1",  rootDirectory: "C:\\Users\\ibsquare",     fullPath: "C:\\Users\\ibsquare\\Desktop\\Q4 Budget Review.pptx",           type: "Power Point File", hostName: "ibsquare-realme-book",  status: "Exists",    lastUpdate: "2026-02-10" },
    { id: "df-2",  rootDirectory: "C:\\Users\\ibsquare",     fullPath: "C:\\Users\\ibsquare\\Documents\\Annual Report 2025.xlsx",        type: "Excel File",       hostName: "ibsquare-realme-book",  status: "Exists",    lastUpdate: "2026-02-10" },
    { id: "df-3",  rootDirectory: "C:\\Users\\ibsquare",     fullPath: "C:\\Users\\ibsquare\\Documents\\Employee Handbook.docx",         type: "Word File",        hostName: "ibsquare-realme-book",  status: "Exists",    lastUpdate: "2026-02-10" },
    { id: "df-4",  rootDirectory: "C:\\Users\\ibsquare",     fullPath: "C:\\Users\\ibsquare\\Desktop\\VPN Access.url",                   type: "Url Text File",    hostName: "ibsquare-realme-book",  status: "Exists",    lastUpdate: "2026-02-10" },
    { id: "df-5",  rootDirectory: "C:\\Users\\admin",        fullPath: "C:\\Users\\admin\\Desktop\\Salary Data 2025.xlsx",               type: "Excel File",       hostName: "DESKTOP-1QBCD2R",       status: "Exists",    lastUpdate: "2026-02-11" },
    { id: "df-6",  rootDirectory: "C:\\Users\\admin",        fullPath: "C:\\Users\\admin\\Documents\\Merger Proposal.pptx",              type: "Power Point File", hostName: "DESKTOP-1QBCD2R",       status: "Exists",    lastUpdate: "2026-02-11" },
    { id: "df-7",  rootDirectory: "C:\\Users\\admin",        fullPath: "C:\\Users\\admin\\Documents\\Board Meeting Notes.docx",          type: "Word File",        hostName: "DESKTOP-1QBCD2R",       status: "Triggered", lastUpdate: "2026-03-02" },
    { id: "df-8",  rootDirectory: "C:\\Users\\admin",        fullPath: "C:\\Users\\admin\\Desktop\\Sharepoint Link.url",                 type: "Url Text File",    hostName: "DESKTOP-1QBCD2R",       status: "Exists",    lastUpdate: "2026-02-11" },
    { id: "df-9",  rootDirectory: "C:\\Users\\jdoe",         fullPath: "C:\\Users\\jdoe\\Desktop\\Investor Deck Q1.pptx",                type: "Power Point File", hostName: "WINS102",               status: "Exists",    lastUpdate: "2026-02-12" },
    { id: "df-10", rootDirectory: "C:\\Users\\jdoe",         fullPath: "C:\\Users\\jdoe\\Documents\\Payroll March 2026.xlsx",            type: "Excel File",       hostName: "WINS102",               status: "Exists",    lastUpdate: "2026-02-12" },
    { id: "df-11", rootDirectory: "C:\\Users\\jdoe",         fullPath: "C:\\Users\\jdoe\\Documents\\NDA Template.docx",                  type: "Word File",        hostName: "WINS102",               status: "Missing",   lastUpdate: "2026-03-01" },
    { id: "df-12", rootDirectory: "C:\\Users\\jdoe",         fullPath: "C:\\Users\\jdoe\\Desktop\\Confluence.url",                       type: "Url Text File",    hostName: "WINS102",               status: "Exists",    lastUpdate: "2026-02-12" },
    { id: "df-13", rootDirectory: "C:\\Users\\m.petrov",     fullPath: "C:\\Users\\m.petrov\\Desktop\\Product Roadmap 2026.pptx",        type: "Power Point File", hostName: "Worldsokol",            status: "Exists",    lastUpdate: "2026-02-13" },
    { id: "df-14", rootDirectory: "C:\\Users\\m.petrov",     fullPath: "C:\\Users\\m.petrov\\Documents\\Vendor Contracts.xlsx",          type: "Excel File",       hostName: "Worldsokol",            status: "Exists",    lastUpdate: "2026-02-13" },
    { id: "df-15", rootDirectory: "C:\\Users\\m.petrov",     fullPath: "C:\\Users\\m.petrov\\Documents\\Incident Report.docx",           type: "Word File",        hostName: "Worldsokol",            status: "Exists",    lastUpdate: "2026-02-13" },
    { id: "df-16", rootDirectory: "C:\\Users\\m.petrov",     fullPath: "C:\\Users\\m.petrov\\Desktop\\Jira Board.url",                   type: "Url Text File",    hostName: "Worldsokol",            status: "Exists",    lastUpdate: "2026-02-13" },
    { id: "df-17", rootDirectory: "C:\\Users\\liza",         fullPath: "C:\\Users\\liza\\Desktop\\Marketing Strategy.pptx",              type: "Power Point File", hostName: "MacBook Air - Adeline", status: "Exists",    lastUpdate: "2026-02-14" },
    { id: "df-18", rootDirectory: "C:\\Users\\liza",         fullPath: "C:\\Users\\liza\\Documents\\Campaign Budget.xlsx",               type: "Excel File",       hostName: "MacBook Air - Adeline", status: "Exists",    lastUpdate: "2026-02-14" },
    { id: "df-19", rootDirectory: "C:\\Users\\liza",         fullPath: "C:\\Users\\liza\\Documents\\Brand Guidelines.docx",              type: "Word File",        hostName: "MacBook Air - Adeline", status: "Exists",    lastUpdate: "2026-02-14" },
    { id: "df-20", rootDirectory: "C:\\Users\\ws-buh",       fullPath: "C:\\Users\\ws-buh\\Desktop\\Financial Forecast.xlsx",            type: "Excel File",       hostName: "ws-buh",                status: "Exists",    lastUpdate: "2026-02-15" },
    { id: "df-21", rootDirectory: "C:\\Users\\ws-buh",       fullPath: "C:\\Users\\ws-buh\\Documents\\Audit Checklist.docx",             type: "Word File",        hostName: "ws-buh",                status: "Exists",    lastUpdate: "2026-02-15" },
    { id: "df-22", rootDirectory: "C:\\Users\\ws-buh",       fullPath: "C:\\Users\\ws-buh\\Desktop\\ERP Portal.url",                     type: "Url Text File",    hostName: "ws-buh",                status: "Exists",    lastUpdate: "2026-02-15" },
    { id: "df-23", rootDirectory: "C:\\Users\\s.kozlov",     fullPath: "C:\\Users\\s.kozlov\\Desktop\\Tech Spec v3.pptx",                type: "Power Point File", hostName: "DESKTOP-1QBCD2R",       status: "Exists",    lastUpdate: "2026-02-16" },
    { id: "df-24", rootDirectory: "C:\\Users\\s.kozlov",     fullPath: "C:\\Users\\s.kozlov\\Documents\\Dev Budget Q2.xlsx",             type: "Excel File",       hostName: "DESKTOP-1QBCD2R",       status: "Exists",    lastUpdate: "2026-02-16" },
    { id: "df-25", rootDirectory: "C:\\Users\\s.kozlov",     fullPath: "C:\\Users\\s.kozlov\\Documents\\Architecture Overview.docx",     type: "Word File",        hostName: "DESKTOP-1QBCD2R",       status: "Missing",   lastUpdate: "2026-03-05" },
  ],
  sendToSoc: [
    { id: "sts-1", filePath: "C:\\ProgramData\\6aeae35043c9\\dropper.exe",  hostName: "WINS102",             hashes: "a1b2c3d4e5f6...", startTime: "2026-03-15T08:00:00Z", endTime: "2026-03-15T08:02:00Z", status: "Success" },
    { id: "sts-2", filePath: "C:\\ProgramData\\malware\\payload.dll",       hostName: "ws-buh",              hashes: "abcdef012345...", startTime: "2026-03-14T14:20:00Z", endTime: "2026-03-14T14:23:00Z", status: "Success" },
    { id: "sts-3", filePath: "C:\\Windows\\Temp\\winupd.exe",               hostName: "Worldsokol",          hashes: "0123456789ab...", startTime: "2026-03-13T17:30:00Z", endTime: null,                   status: "Pending" },
    { id: "sts-4", filePath: "C:\\Users\\admin\\Downloads\\setup.exe",      hostName: "DESKTOP-1QBCD2R",     hashes: "cafebabe5678...", startTime: "2026-03-12T09:10:00Z", endTime: "2026-03-12T09:15:00Z", status: "Failed"  },
    { id: "sts-5", filePath: "/usr/local/bin/suspicious_script.sh",        hostName: "Apple's MacBook Pro", hashes: "f00dface9abc...", startTime: "2026-03-11T11:05:00Z", endTime: "2026-03-11T11:07:00Z", status: "Success" },
  ],
  hostsApiCall: [
    { id: "hac-1", hostName: "Worldsokol", group: "Adeline_Endpoint_WIN", time: "2026-03-15T10:00:00Z", actionName: "Host Isolation",    status: "Success", statusDescription: "Host isolated successfully",   action: "Isolate" },
    { id: "hac-2", hostName: "ws-buh",     group: "Adeline_Endpoint_WIN", time: "2026-03-14T14:30:00Z", actionName: "Host Unisolation",  status: "Success", statusDescription: "Host restored to network",     action: "Unisolate" },
    { id: "hac-3", hostName: "WINS102",    group: "Emir Testing WIN",     time: "2026-03-13T09:15:00Z", actionName: "Reboot",            status: "Failed",  statusDescription: "Agent not responding",         action: "Reboot" },
    { id: "hac-4", hostName: "WINS102",    group: "Emir Testing WIN",     time: "2026-03-12T11:40:00Z", actionName: "Host Isolation",    status: "Pending", statusDescription: "Awaiting agent confirmation",  action: "Isolate" },
  ],
  hostsAntivirus: [
    { id: "hav-1",  endpoint: "buh2",        scanProfile: "Adeline_Weekly_scan", scanType: "Scheduled Scan",         group: "Adeline_Endpoint_WIN", status: "Completed",   startTime: "2026-03-29T02:07:00Z", endTime: "2026-03-29T10:28:00Z", details: "" },
    { id: "hav-2",  endpoint: "buh2",        scanProfile: "Adeline_Weekly_scan", scanType: "Scheduled Scan",         group: "Adeline_Endpoint_WIN", status: "Completed",   startTime: "2026-03-26T04:25:00Z", endTime: "2026-03-26T04:33:00Z", details: "1 malicious file was found" },
    { id: "hav-3",  endpoint: "buh2",        scanProfile: "Adeline_Weekly_scan", scanType: "Scheduled Scan",         group: "Adeline_Endpoint_WIN", status: "Completed",   startTime: "2026-03-22T07:21:00Z", endTime: "2026-03-22T07:28:00Z", details: "" },
    { id: "hav-4",  endpoint: "buh2",        scanProfile: "Adeline_Weekly_scan", scanType: "Scheduled Scan",         group: "Adeline_Endpoint_WIN", status: "Completed",   startTime: "2026-03-16T04:23:00Z", endTime: "2026-03-16T04:26:00Z", details: "1 malicious file was found" },
    { id: "hav-5",  endpoint: "buh2",        scanProfile: "Adeline_Weekly_scan", scanType: "Scheduled Scan",         group: "Adeline_Endpoint_WIN", status: "Completed",   startTime: "2026-03-16T04:03:00Z", endTime: "2026-03-16T04:06:00Z", details: "" },
    { id: "hav-6",  endpoint: "buh2",        scanProfile: "Adeline_Weekly_scan", scanType: "Scheduled Scan",         group: "Adeline_Endpoint_WIN", status: "Completed",   startTime: "2026-03-10T04:17:00Z", endTime: "2026-03-10T04:21:00Z", details: "1 malicious file was found" },
    { id: "hav-7",  endpoint: "shtyrlya-pc", scanProfile: "Adeline_Weekly_scan", scanType: "Scheduled Scan",         group: "Adeline_Endpoint_WIN", status: "Completed",   startTime: "2026-03-02T13:23:00Z", endTime: "2026-03-02T15:28:00Z", details: "" },
    { id: "hav-8",  endpoint: "Worldsokol",  scanProfile: "Adeline_Weekly_scan", scanType: "Scheduled Scan",         group: "Adeline_Endpoint_WIN", status: "Canceled",    startTime: "2026-03-02T05:41:00Z", endTime: "2026-03-02T05:41:00Z", details: "Other scan in progress" },
    { id: "hav-9",  endpoint: "buh2",        scanProfile: "Adeline_Weekly_scan", scanType: "Scheduled Scan",         group: "Adeline_Endpoint_WIN", status: "Completed",   startTime: "2026-03-02T04:19:00Z", endTime: "2026-03-02T04:39:00Z", details: "2 malicious files were found" },
    { id: "hav-10", endpoint: "buh2",        scanProfile: "Adeline_Weekly_scan", scanType: "Scheduled Scan",         group: "Adeline_Endpoint_WIN", status: "Completed",   startTime: "2026-03-02T03:25:00Z", endTime: "2026-03-02T03:32:00Z", details: "" },
    { id: "hav-11", endpoint: "WINS102",     scanProfile: "local_on_demand",     scanType: "On-demand from endpoint",group: "Emir Testing WIN",     status: "Completed",   startTime: "2026-02-24T09:49:00Z", endTime: "2026-02-24T10:15:00Z", details: "5 malicious files were found" },
    { id: "hav-12", endpoint: "shtyrlya-pc", scanProfile: "Adeline_Weekly_scan", scanType: "Scheduled Scan",         group: "Adeline_Endpoint_WIN", status: "Completed",   startTime: "2026-02-23T18:43:00Z", endTime: "2026-02-23T18:46:00Z", details: "" },
    { id: "hav-13", endpoint: "buh2",        scanProfile: "Adeline_Weekly_scan", scanType: "Scheduled Scan",         group: "Adeline_Endpoint_WIN", status: "Completed",   startTime: "2026-02-23T04:10:00Z", endTime: "2026-02-23T04:16:00Z", details: "" },
  ],
  users: [],
  usersApiCall: [
    { id: "uac-1", userName: "adeline\\j.doe",    time: "2026-03-15T10:10:00Z", actionName: "Lock Account",     status: "Success", statusDescription: "Account locked successfully",  action: "Lock" },
    { id: "uac-2", userName: "adeline\\m.petrov", time: "2026-03-14T09:05:00Z", actionName: "Reset Password",   status: "Success", statusDescription: "Temp password sent via email", action: "Reset" },
    { id: "uac-3", userName: "adeline\\s.kozlov", time: "2026-03-13T16:22:00Z", actionName: "Disable Account",  status: "Failed",  statusDescription: "Insufficient permissions",     action: "Disable" },
  ],
  network: [],
  networkApiCall: [
    { id: "nac-1", networkName: "10.1.3.0/24",  time: "2026-03-15T11:00:00Z", actionName: "Block IP",          status: "Success", statusDescription: "IP blocked at firewall", action: "Block" },
    { id: "nac-2", networkName: "185.220.0.0/16",time: "2026-03-14T08:45:00Z", actionName: "Block IP",          status: "Success", statusDescription: "TOR exit node blocked",  action: "Block" },
    { id: "nac-3", networkName: "10.1.2.26",    time: "2026-03-13T13:10:00Z", actionName: "Isolate Host",      status: "Pending", statusDescription: "Awaiting confirmation",  action: "Isolate" },
  ],
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

// ─── MOCK: SETTINGS / GROUPS ─────────────────────────────────────────────────
const MOCK_GROUPS_DATA = [
  { id: "g-1",  name: "Adeline_Endpoint_WIN",           os: "windows", endpoints: 7,  eppBestPractice: true,  lastModified: "2025-07-14T10:18:04Z" },
  { id: "g-2",  name: "Adeline_Endpoint_MAC",           os: "mac",     endpoints: 7,  eppBestPractice: true,  lastModified: "2025-07-14T10:06:05Z" },
  { id: "g-3",  name: "Emir Testing WIN",               os: "windows", endpoints: 1,  eppBestPractice: true,  lastModified: "2025-10-22T08:34:22Z" },
  { id: "g-4",  name: "Manually Installed Agents - Linux", os: "linux", endpoints: 0, eppBestPractice: true,  lastModified: "2025-07-13T09:31:02Z" },
  { id: "g-5",  name: "Manually Installed Agents",      os: "windows", endpoints: 0,  eppBestPractice: true,  lastModified: "2025-07-13T09:31:02Z" },
  { id: "g-6",  name: "Out of Range Agents",            os: "windows", endpoints: 0,  eppBestPractice: true,  lastModified: "2025-07-13T09:31:02Z" },
  { id: "g-7",  name: "Windows Workstations",           os: "windows", endpoints: 0,  eppBestPractice: true,  lastModified: "2025-07-13T09:31:02Z" },
  { id: "g-8",  name: "Windows Servers",                os: "windows", endpoints: 0,  eppBestPractice: true,  lastModified: "2025-07-13T09:31:02Z" },
  { id: "g-9",  name: "Linux Workstations",             os: "linux",   endpoints: 0,  eppBestPractice: true,  lastModified: "2025-07-13T09:31:02Z" },
  { id: "g-10", name: "Linux Servers",                  os: "linux",   endpoints: 0,  eppBestPractice: true,  lastModified: "2025-07-13T09:31:02Z" },
  { id: "g-11", name: "Mac Workstations",               os: "mac",     endpoints: 0,  eppBestPractice: true,  lastModified: "2025-07-13T09:31:02Z" },
  { id: "g-12", name: "Critical Assets",                os: "windows", endpoints: 0,  eppBestPractice: true,  lastModified: "2025-07-13T09:31:02Z" },
  { id: "g-13", name: "Manually Installed Agents - MAC",os: "mac",     endpoints: 0,  eppBestPractice: true,  lastModified: "2025-07-13T09:31:02Z" },
  { id: "g-14", name: "All",                            os: "windows", endpoints: 15, eppBestPractice: false, lastModified: "2025-07-13T09:31:02Z" },
];

export async function fetchGroupsData() {
  // TODO: replace with real call
  // const res = await fetch('/api/v1/settings/groups');
  // return res.json();
  await delay(250);
  return structuredClone(MOCK_GROUPS_DATA);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
