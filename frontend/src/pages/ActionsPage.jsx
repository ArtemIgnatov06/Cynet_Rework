import { useState, useEffect } from "react";
import { fetchActionsData } from "../api/securityApi";
import "./ForensicPage.css";
import "./ActionsPage.css";

const TABS = ["Files", "Hosts", "Users", "Network", "Playbooks", "Auto Remediation"];

function StatusBadge({ status }) {
  const cls =
    status === "Success"   ? "ap-status--ok"  :
    status === "Deleted"   ? "ap-status--ok"  :
    status === "Timeout"   ? "ap-status--warn":
    status === "Misc Error"? "ap-status--err" :
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
          <th>File Name</th>
          <th>Host Name</th>
          <th>Host IP</th>
          <th>Start Time</th>
          <th>Action Taken</th>
          <th>Extra Details</th>
          <th>Status</th>
          <th>Status Info</th>
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
          <th>Host Name</th>
          <th>Scan Group</th>
          <th>Time</th>
          <th>Action Taken</th>
          <th>Extra Details</th>
          <th>Status</th>
          <th>Status Info</th>
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
      <thead>
        <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
      </thead>
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
          <th>Name</th>
          <th>Description</th>
          <th>Remediation</th>
          <th>Priority</th>
          <th>Date In</th>
          <th>Is Enabled</th>
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
  return (
    <div className="ap-empty">
      Currently loaded: 0
    </div>
  );
}

export default function ActionsPage() {
  const [tab, setTab] = useState("Files");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActionsData().then((d) => { setData(d); setLoading(false); });
  }, []);

  const tabKey = tab === "Auto Remediation" ? "autoRemediation" : tab.toLowerCase();
  const rowCount = data?.[tabKey]?.length ?? 0;

  return (
    <div className="actions-page">
      <div className="page-header">
        <h1 className="page-title">Actions</h1>
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
              <span className="fp-count">Currently loaded: {rowCount}</span>
            </div>
            <div className="fp-table-wrap">
              {tab === "Files"            && <FilesTable           rows={data.files}           />}
              {tab === "Hosts"            && <HostsTable           rows={data.hosts}           />}
              {tab === "Users"            && <GenericTable         rows={data.users}           columns={[{key:"userName",label:"User Name"},{key:"hostName",label:"Host Name"},{key:"time",label:"Time"},{key:"actionTaken",label:"Action Taken"},{key:"status",label:"Status"},{key:"statusInfo",label:"Status Info"}]} />}
              {tab === "Network"          && <GenericTable         rows={data.network}         columns={[{key:"networkName",label:"Network Name"},{key:"hostName",label:"Host Name"},{key:"time",label:"Time"},{key:"actionTaken",label:"Action Taken"},{key:"status",label:"Status"},{key:"statusInfo",label:"Status Info"}]} />}
              {tab === "Playbooks"        && <GenericTable         rows={data.playbooks}       columns={[{key:"name",label:"Name"},{key:"status",label:"Status"},{key:"lastUpdate",label:"Last Update"},{key:"actionParameters",label:"Action Parameters"}]} />}
              {tab === "Auto Remediation" && <AutoRemediationTable rows={data.autoRemediation} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
