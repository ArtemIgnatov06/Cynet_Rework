import { useState, useEffect, useMemo } from "react";
import { fetchForensicData } from "../api/securityApi";
import FilterBar, { applyFilters } from "../components/FilterBar";
import "./ForensicPage.css";

const TABS = ["Files", "Hosts", "Users", "Domains", "Sockets"];

// ─── Filter schemas per tab ───────────────────────────────────────────────────
const FILTER_SCHEMA = {
  Files: [
    { key: "fileName",    label: "File Name",    type: "text"  },
    { key: "risk",        label: "Risk",         type: "range" },
    { key: "companyName", label: "Company Name", type: "text"  },
    { key: "endpoints",   label: "Endpoints",    type: "range" },
    { key: "antiViruses", label: "Anti Viruses", type: "range" },
    { key: "firstSeen",   label: "First Seen",   type: "date"  },
    { key: "lastSeen",    label: "Last Seen",    type: "date"  },
  ],
  Hosts: [
    { key: "hostName", label: "Host Name", type: "text" },
    { key: "ip",       label: "IP",        type: "text" },
    { key: "os",       label: "OS",        type: "text" },
    { key: "group",    label: "Group",     type: "text" },
    { key: "status",   label: "Status",    type: "select", opts: ["online", "offline"] },
  ],
  Users: [
    { key: "userName", label: "User Name", type: "text" },
    { key: "hostName", label: "Host Name", type: "text" },
    { key: "status",   label: "Status",    type: "select", opts: ["active", "inactive"] },
  ],
  Domains: [
    { key: "domain",   label: "Domain",   type: "text" },
    { key: "category", label: "Category", type: "text" },
    { key: "firstSeen",label: "First Seen",type: "date" },
  ],
  Sockets: [
    { key: "process",    label: "Process",     type: "text" },
    { key: "localPort",  label: "Local Port",  type: "text" },
    { key: "remoteIP",   label: "Remote IP",   type: "text" },
    { key: "remotePort", label: "Remote Port", type: "text" },
    { key: "protocol",   label: "Protocol",    type: "select", opts: ["TCP", "UDP"] },
    { key: "status",     label: "Status",      type: "select", opts: ["established", "closed"] },
  ],
};

// ─── Shared components ────────────────────────────────────────────────────────
function RiskBadge({ score }) {
  const color = score >= 500 ? "#ef4444" : score >= 200 ? "#f59e0b" : "#6366f1";
  return <span className="risk-badge" style={{ borderColor: color, color }}>{score}</span>;
}

function EmptyTable({ cols }) {
  return (
    <div className="fp-empty">Currently loaded: 0</div>
  );
}

// ─── Table components ─────────────────────────────────────────────────────────
function FilesTable({ rows }) {
  if (!rows.length) return <div className="fp-empty">Currently loaded: 0</div>;
  return (
    <table className="fp-table">
      <thead>
        <tr>
          <th>File Name</th><th>Risk</th><th>Company Name</th>
          <th>Endpoints</th><th>Anti Viruses</th><th>First Seen</th><th>Last Seen</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="fp-table__filename">{r.fileName}</td>
            <td><RiskBadge score={r.risk} /></td>
            <td>{r.companyName || "—"}</td>
            <td>{r.endpoints}</td>
            <td>{r.antiViruses}</td>
            <td>{new Date(r.firstSeen).toLocaleString()}</td>
            <td>{new Date(r.lastSeen).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function HostsTable({ rows }) {
  if (!rows.length) return <div className="fp-empty">Currently loaded: 0</div>;
  return (
    <table className="fp-table">
      <thead>
        <tr>
          <th>Host Name</th><th>IP</th><th>OS</th>
          <th>Group</th><th>Last Seen</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="fp-table__link">{r.hostName}</td>
            <td className="fp-table__mono">{r.ip}</td>
            <td>{r.os}</td>
            <td>{r.group}</td>
            <td>{new Date(r.lastSeen).toLocaleString()}</td>
            <td><span className={`status-pill status-pill--${r.status}`}>{r.status}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function UsersTable({ rows }) {
  if (!rows.length) return <div className="fp-empty">Currently loaded: 0</div>;
  return (
    <table className="fp-table">
      <thead>
        <tr>
          <th>User Name</th><th>Host Name</th>
          <th>Last Logon</th><th>Risk Score</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="fp-table__link">{r.userName}</td>
            <td>{r.hostName}</td>
            <td>{new Date(r.lastLogon).toLocaleString()}</td>
            <td><RiskBadge score={r.riskScore} /></td>
            <td><span className={`status-pill status-pill--${r.status}`}>{r.status}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DomainsTable({ rows }) {
  if (!rows.length) return <div className="fp-empty">Currently loaded: 0</div>;
  return (
    <table className="fp-table">
      <thead>
        <tr>
          <th>Domain</th><th>Category</th>
          <th>First Seen</th><th>Requests</th><th>Risk</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="fp-table__link">{r.domain}</td>
            <td>{r.category}</td>
            <td>{new Date(r.firstSeen).toLocaleDateString()}</td>
            <td>{r.requests.toLocaleString()}</td>
            <td>{r.risk > 0 ? <RiskBadge score={r.risk} /> : <span className="fp-ok">—</span>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SocketsTable({ rows }) {
  if (!rows.length) return <div className="fp-empty">Currently loaded: 0</div>;
  return (
    <table className="fp-table">
      <thead>
        <tr>
          <th>Process</th><th>Local Port</th><th>Remote IP</th>
          <th>Remote Port</th><th>Protocol</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="fp-table__filename">{r.process}</td>
            <td className="fp-table__mono">{r.localPort}</td>
            <td className="fp-table__mono">{r.remoteIP}</td>
            <td className="fp-table__mono">{r.remotePort}</td>
            <td>{r.protocol}</td>
            <td><span className={`status-pill status-pill--${r.status === "established" ? "online" : "offline"}`}>{r.status}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ForensicPage() {
  const [tab,     setTab]     = useState("Files");
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchForensicData().then((d) => { setData(d); setLoading(false); });
  }, []);

  const handleTabChange = (t) => { setTab(t); setFilters({}); };
  const handleFilter    = (key, val) => setFilters((p) => ({ ...p, [key]: val }));
  const handleClear     = () => setFilters({});

  const schema = FILTER_SCHEMA[tab] ?? [];

  const filtered = useMemo(() => {
    if (!data) return data;
    const key = tab.toLowerCase();
    return { ...data, [key]: applyFilters(data[key], filters, schema) };
  }, [data, tab, filters, schema]);

  const rowCount = filtered?.[tab.toLowerCase()]?.length ?? 0;

  return (
    <div className="forensic-page">
      <div className="page-header">
        <h1 className="page-title">System</h1>
      </div>

      {/* Main tabs */}
      <div className="fp-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`fp-tab ${tab === t ? "fp-tab--active" : ""}`}
            onClick={() => handleTabChange(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      {!loading && (
        <FilterBar
          schema={schema}
          filters={filters}
          onChange={handleFilter}
          onClear={handleClear}
        />
      )}

      {/* Table */}
      <div className="fp-content">
        {loading ? (
          <div className="fp-loading">Loading…</div>
        ) : (
          <>
            <div className="fp-table-meta">
              Load: <span className="fp-badge">25</span> entities
              <span className="fp-count">Currently loaded: {rowCount}</span>
            </div>
            <div className="fp-table-wrap">
              {tab === "Files"   && <FilesTable   rows={filtered.files}   />}
              {tab === "Hosts"   && <HostsTable   rows={filtered.hosts}   />}
              {tab === "Users"   && <UsersTable   rows={filtered.users}   />}
              {tab === "Domains" && <DomainsTable rows={filtered.domains} />}
              {tab === "Sockets" && <SocketsTable rows={filtered.sockets} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
