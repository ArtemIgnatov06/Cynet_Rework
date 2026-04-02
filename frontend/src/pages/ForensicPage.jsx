import { useState, useEffect } from "react";
import { fetchForensicData } from "../api/securityApi";
import "./ForensicPage.css";

const TABS = ["Files", "Hosts", "Users", "Domains", "Sockets"];

function RiskBadge({ score }) {
  const color = score >= 500 ? "#ef4444" : score >= 200 ? "#f59e0b" : "#6366f1";
  return (
    <span className="risk-badge" style={{ borderColor: color, color }}>
      {score}
    </span>
  );
}

function StatusDot({ status }) {
  return <span className={`status-dot status-dot--${status}`} />;
}

function FilesTable({ rows }) {
  return (
    <table className="fp-table">
      <thead>
        <tr>
          <th>File Name</th>
          <th>Risk</th>
          <th>Company Name</th>
          <th>Endpoints</th>
          <th>Anti Viruses</th>
          <th>First Seen</th>
          <th>Last Seen</th>
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
  return (
    <table className="fp-table">
      <thead>
        <tr>
          <th>Host Name</th>
          <th>IP</th>
          <th>OS</th>
          <th>Group</th>
          <th>Last Seen</th>
          <th>Status</th>
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
  return (
    <table className="fp-table">
      <thead>
        <tr>
          <th>User Name</th>
          <th>Host Name</th>
          <th>Last Logon</th>
          <th>Risk Score</th>
          <th>Status</th>
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
  return (
    <table className="fp-table">
      <thead>
        <tr>
          <th>Domain</th>
          <th>Category</th>
          <th>First Seen</th>
          <th>Requests</th>
          <th>Risk</th>
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
  return (
    <table className="fp-table">
      <thead>
        <tr>
          <th>Process</th>
          <th>Local Port</th>
          <th>Remote IP</th>
          <th>Remote Port</th>
          <th>Protocol</th>
          <th>Status</th>
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

export default function ForensicPage() {
  const [tab, setTab] = useState("Files");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForensicData().then((d) => { setData(d); setLoading(false); });
  }, []);

  return (
    <div className="forensic-page">
      <div className="page-header">
        <h1 className="page-title">Forensic</h1>
      </div>

      {/* Sub-tabs */}
      <div className="fp-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`fp-tab ${tab === t ? "fp-tab--active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table area */}
      <div className="fp-content">
        {loading ? (
          <div className="fp-loading">Loading…</div>
        ) : (
          <>
            <div className="fp-table-meta">
              Load: <span className="fp-badge">25</span> entities
              <span className="fp-count">
                Currently loaded: {data?.[tab.toLowerCase()]?.length ?? 0}
              </span>
            </div>
            <div className="fp-table-wrap">
              {tab === "Files"   && <FilesTable   rows={data.files}   />}
              {tab === "Hosts"   && <HostsTable   rows={data.hosts}   />}
              {tab === "Users"   && <UsersTable   rows={data.users}   />}
              {tab === "Domains" && <DomainsTable rows={data.domains} />}
              {tab === "Sockets" && <SocketsTable rows={data.sockets} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
