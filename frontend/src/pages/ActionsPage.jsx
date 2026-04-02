import { useState, useEffect } from "react";
import { fetchActionsData } from "../api/securityApi";
import "./ForensicPage.css";
import "./ActionsPage.css";

// Sub-tabs per main tab (mirrors real Cynet)
const SUB_TABS = {
  Files:            ["Script Actions", "API Call Actions", "Analysis Actions", "Decoy Files Status", "Send To Soc Actions"],
  Hosts:            ["Script Actions", "API Call Actions", "Antivirus Actions"],
  Users:            ["Script Actions", "API Call Actions"],
  Network:          ["Script Actions", "API Call Actions"],
  Playbooks:        [],
  "Auto Remediation": [],
};

const MAIN_TABS = Object.keys(SUB_TABS);

function StatusBadge({ status }) {
  const cls =
    status === "Success"          ? "ap-status--ok"  :
    status === "Deleted"          ? "ap-status--ok"  :
    status === "Timeout"          ? "ap-status--warn":
    status === "Misc Error"       ? "ap-status--err" :
    status === "Execution Failed" ? "ap-status--err" :
    "ap-status--neutral";
  return <span className={`ap-status ${cls}`}>{status}</span>;
}

function FilesTable({ rows }) {
  if (!rows.length) return <EmptyState />;
  return (
    <table className="ap-table">
      <thead>
        <tr>
          <th>File Name</th><th>Host Name</th><th>Host IP</th>
          <th>Start Time</th><th>Action Taken</th><th>Extra Details</th>
          <th>Status</th><th>Status Info</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="ap-table__filename" title={r.fileName}>{r.fileName}</td>
            <td className="ap-table__link">{r.hostName}</td>
            <td className="ap-table__mono">{r.hostIP}</td>
            <td>{new Date(r.startTime).toLocaleString()}</td>
            <td>{r.actionTaken}</td>
            <td>{r.extraDetails || "—"}</td>
            <td><StatusBadge status={r.status} /></td>
            <td className="ap-table__info">{r.statusInfo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function HostsTable({ rows }) {
  if (!rows.length) return <EmptyState />;
  return (
    <table className="ap-table">
      <thead>
        <tr>
          <th>Host Name</th><th>Scan Group</th><th>Time</th>
          <th>Action Taken</th><th>Extra Details</th><th>Status</th><th>Status Info</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="ap-table__link">{r.hostName}</td>
            <td>{r.scanGroup}</td>
            <td>{new Date(r.time).toLocaleString()}</td>
            <td>{r.actionTaken}</td>
            <td>{r.extraDetails || "—"}</td>
            <td><StatusBadge status={r.status} /></td>
            <td className="ap-table__link-muted">{r.statusInfo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GenericTable({ rows, columns }) {
  if (!rows.length) return <EmptyState />;
  return (
    <table className="ap-table">
      <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.id ?? i}>
            {columns.map((c) => <td key={c.key}>{r[c.key] ?? "—"}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AutoRemediationTable({ rows }) {
  if (!rows.length) return <EmptyState />;
  return (
    <table className="ap-table">
      <thead>
        <tr>
          <th>Name</th><th>Description</th><th>Remediation</th>
          <th>Priority</th><th>Date In</th><th>Is Enabled</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="ap-table__link">{r.name}</td>
            <td>{r.description || "—"}</td>
            <td>{r.remediation}</td>
            <td>{r.priority}</td>
            <td>{new Date(r.dateIn).toLocaleString()}</td>
            <td>
              <span className={`ap-toggle ${r.isEnabled ? "ap-toggle--on" : "ap-toggle--off"}`}>
                {r.isEnabled ? "Yes" : "No"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EmptyState() {
  return <div className="ap-empty">Currently loaded: 0</div>;
}

function TableContent({ tab, subTab, data }) {
  // Only "Script Actions" sub-tab has real data; others are empty
  const isScript = subTab === "Script Actions" || !subTab;

  if (tab === "Files")
    return <FilesTable rows={isScript ? data.files : []} />;
  if (tab === "Hosts")
    return <HostsTable rows={isScript ? data.hosts : []} />;
  if (tab === "Users")
    return <GenericTable rows={isScript ? data.users : []} columns={[
      { key: "userName", label: "User Name" }, { key: "hostName", label: "Host Name" },
      { key: "time", label: "Time" }, { key: "actionTaken", label: "Action Taken" },
      { key: "status", label: "Status" }, { key: "statusInfo", label: "Status Info" },
    ]} />;
  if (tab === "Network")
    return <GenericTable rows={isScript ? data.network : []} columns={[
      { key: "networkName", label: "Network Name" }, { key: "hostName", label: "Host Name" },
      { key: "time", label: "Time" }, { key: "actionTaken", label: "Action Taken" },
      { key: "status", label: "Status" }, { key: "statusInfo", label: "Status Info" },
    ]} />;
  if (tab === "Playbooks")
    return <GenericTable rows={data.playbooks} columns={[
      { key: "name", label: "Name" }, { key: "status", label: "Status" },
      { key: "lastUpdate", label: "Last Update" }, { key: "actionParameters", label: "Action Parameters" },
    ]} />;
  if (tab === "Auto Remediation")
    return <AutoRemediationTable rows={data.autoRemediation} />;
  return null;
}

export default function ActionsPage() {
  const [tab, setTab]       = useState("Files");
  const [subTab, setSubTab] = useState("Script Actions");
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActionsData().then((d) => { setData(d); setLoading(false); });
  }, []);

  const handleMainTab = (t) => {
    setTab(t);
    setSubTab(SUB_TABS[t][0] ?? null);
  };

  const subTabs = SUB_TABS[tab];

  const tabKey = tab === "Auto Remediation" ? "autoRemediation" : tab.toLowerCase();
  const isScript = subTab === "Script Actions" || !subTab;
  const rowCount = isScript ? (data?.[tabKey]?.length ?? 0) : 0;

  return (
    <div className="actions-page">
      <div className="page-header">
        <h1 className="page-title">Actions</h1>
      </div>

      {/* ── Main tabs (Files / Hosts / Users / …) ── */}
      <div className="fp-tabs">
        {MAIN_TABS.map((t) => (
          <button
            key={t}
            className={`fp-tab ${tab === t ? "fp-tab--active" : ""}`}
            onClick={() => handleMainTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Secondary tabs (Script Actions / API Call Actions / …) ── */}
      {subTabs.length > 0 && (
        <div className="ap-subtabs">
          {subTabs.map((s) => (
            <button
              key={s}
              className={`ap-subtab ${subTab === s ? "ap-subtab--active" : ""}`}
              onClick={() => setSubTab(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Special header for Playbooks / Auto Remediation ── */}
      {tab === "Auto Remediation" && (
        <div className="ap-section-header">
          <span className="ap-section-title">AUTO REMEDIATION</span>
          <div className="ap-section-actions">
            <button className="ap-btn ap-btn--danger">Delete</button>
            <button className="ap-btn ap-btn--primary">Create Rule</button>
          </div>
        </div>
      )}
      {tab === "Playbooks" && (
        <div className="ap-section-header">
          <span className="ap-section-title">PLAYBOOK ACTIONS</span>
        </div>
      )}

      {/* ── Table area ── */}
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
              <TableContent tab={tab} subTab={subTab} data={data} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
