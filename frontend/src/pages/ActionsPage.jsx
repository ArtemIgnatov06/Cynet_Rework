import { useState, useEffect, useMemo } from "react";
import { fetchActionsData } from "../api/securityApi";
import FilterBar, { applyFilters } from "../components/FilterBar";
import "./ForensicPage.css";
import "./ActionsPage.css";

// ─── Tab structure ────────────────────────────────────────────────────────────
const SUB_TABS = {
  Files:              ["Script Actions", "API Call Actions", "Analysis Actions", "Decoy Files Status", "Send To Soc Actions"],
  Hosts:              ["Script Actions", "API Call Actions", "Antivirus Actions"],
  Users:              ["Script Actions", "API Call Actions"],
  Network:            ["Script Actions", "API Call Actions"],
  Playbooks:          [],
  "Auto Remediation": [],
};

const MAIN_TABS = Object.keys(SUB_TABS);

// ─── Filter schemas per tab+subtab ────────────────────────────────────────────
// type: "text" | "select" | "date" | "range"
const FILTER_SCHEMA = {
  "Files:Script Actions": [
    { key: "fileName",    label: "File Name",    type: "text"   },
    { key: "hostName",    label: "Host Name",    type: "text"   },
    { key: "hostIP",      label: "Host IP",      type: "text"   },
    { key: "startTime",   label: "Start Time",   type: "date"   },
    { key: "actionTaken", label: "Action Taken", type: "select", opts: ["Delete", "Quarantine", "Kill Process", "Block"] },
    { key: "status",      label: "Status",       type: "select", opts: ["Deleted", "Success", "Timeout", "Misc Error", "Execution Failed"] },
    { key: "statusInfo",  label: "Status Info",  type: "text"   },
  ],
  "Files:API Call Actions": [
    { key: "fileName",          label: "File Name",          type: "text"   },
    { key: "time",              label: "Time",               type: "date"   },
    { key: "actionName",        label: "Action Name",        type: "text"   },
    { key: "status",            label: "Status",             type: "select", opts: ["Success", "Failed", "Pending"] },
    { key: "statusDescription", label: "Status Description", type: "text"   },
    { key: "action",            label: "Action",             type: "text"   },
  ],
  "Files:Analysis Actions": [
    { key: "filePath",      label: "File Path",      type: "text"   },
    { key: "hostName",      label: "Host Name",      type: "text"   },
    { key: "hashes",        label: "Hashes",         type: "text"   },
    { key: "startTime",     label: "Start Time",     type: "date"   },
    { key: "endTime",       label: "End Time",       type: "date"   },
    { key: "staticResult",  label: "Static Result",  type: "select", opts: ["Clean", "Malicious", "Suspicious", "Unknown"] },
    { key: "dynamicResult", label: "Dynamic Result", type: "select", opts: ["Clean", "Malicious", "Suspicious", "Unknown"] },
  ],
  "Files:Decoy Files Status": [
    { key: "rootDirectory", label: "Root Directory", type: "text"   },
    { key: "fullPath",      label: "Full Path",      type: "text"   },
    { key: "type",          label: "Type",           type: "select", opts: ["Power Point File", "Excel File", "Word File", "Url Text File"] },
    { key: "hostName",      label: "Host Name",      type: "text"   },
    { key: "status",        label: "Status",         type: "select", opts: ["Exists", "Missing", "Triggered"] },
    { key: "lastUpdate",    label: "Last Update",    type: "date"   },
  ],
  "Files:Send To Soc Actions": [
    { key: "filePath",  label: "File Path",  type: "text"   },
    { key: "hostName",  label: "Host Name",  type: "text"   },
    { key: "hashes",    label: "Hashes",     type: "text"   },
    { key: "startTime", label: "Start Time", type: "date"   },
    { key: "endTime",   label: "End Time",   type: "date"   },
    { key: "status",    label: "Status",     type: "select", opts: ["Success", "Failed", "Pending"] },
  ],
  "Hosts:Script Actions": [
    { key: "hostName",      label: "Host Name",      type: "text"   },
    { key: "scanGroup",     label: "Scan Group",     type: "text"   },
    { key: "time",          label: "Time",           type: "date"   },
    { key: "actionTaken",   label: "Action Taken",   type: "select", opts: ["Custom Remediation Endpoint", "Start Full AV Scan", "Kill Process", "Block"] },
    { key: "extraDetails",  label: "Extra Details",  type: "text"   },
    { key: "status",        label: "Status",         type: "select", opts: ["Success", "Execution Failed", "Timeout", "Misc Error"] },
    { key: "statusInfo",    label: "Status Info",    type: "text"   },
    { key: "nextRetryTime", label: "Next Retry Time",type: "date"   },
  ],
  "Hosts:API Call Actions": [
    { key: "hostName",          label: "Host Name",          type: "text"   },
    { key: "group",             label: "Group",              type: "text"   },
    { key: "time",              label: "Time",               type: "date"   },
    { key: "actionName",        label: "Action Name",        type: "text"   },
    { key: "status",            label: "Status",             type: "select", opts: ["Success", "Failed", "Pending"] },
    { key: "statusDescription", label: "Status Description", type: "text"   },
    { key: "action",            label: "Action",             type: "text"   },
  ],
  "Hosts:Antivirus Actions": [
    { key: "endpoint",    label: "Endpoint",     type: "text"   },
    { key: "scanProfile", label: "Scan Profile", type: "text"   },
    { key: "scanType",    label: "Scan Type",    type: "select", opts: ["Scheduled Scan", "On-demand from endpoint", "Quick Scan", "Full Scan"] },
    { key: "group",       label: "Group",        type: "text"   },
    { key: "status",      label: "Status",       type: "select", opts: ["Completed", "Canceled", "In Progress", "Failed"] },
    { key: "startTime",   label: "Start Time",   type: "date"   },
    { key: "endTime",     label: "End Time",     type: "date"   },
    { key: "details",     label: "Details",      type: "text"   },
  ],
  "Users:Script Actions": [
    { key: "userName",      label: "User Name",      type: "text"   },
    { key: "hostName",      label: "Host Name",      type: "text"   },
    { key: "time",          label: "Time",           type: "date"   },
    { key: "actionTaken",   label: "Action Taken",   type: "select", opts: ["Lock Account", "Reset Password", "Disable User"] },
    { key: "extraDetails",  label: "Extra Details",  type: "text"   },
    { key: "status",        label: "Status",         type: "select", opts: ["Success", "Execution Failed", "Timeout"] },
    { key: "statusInfo",    label: "Status Info",    type: "text"   },
    { key: "nextRetryTime", label: "Next Retry Time",type: "date"   },
  ],
  "Users:API Call Actions": [
    { key: "userName",          label: "User Name",          type: "text"   },
    { key: "time",              label: "Time",               type: "date"   },
    { key: "actionName",        label: "Action Name",        type: "text"   },
    { key: "status",            label: "Status",             type: "select", opts: ["Success", "Failed", "Pending"] },
    { key: "statusDescription", label: "Status Description", type: "text"   },
    { key: "action",            label: "Action",             type: "text"   },
  ],
  "Network:Script Actions": [
    { key: "networkName",   label: "Network Name",   type: "text"   },
    { key: "hostName",      label: "Host Name",      type: "text"   },
    { key: "time",          label: "Time",           type: "date"   },
    { key: "actionTaken",   label: "Action Taken",   type: "select", opts: ["Block IP", "Isolate Host", "Reset Connection"] },
    { key: "extraDetails",  label: "Extra Details",  type: "text"   },
    { key: "status",        label: "Status",         type: "select", opts: ["Success", "Execution Failed", "Timeout"] },
    { key: "statusInfo",    label: "Status Info",    type: "text"   },
    { key: "nextRetryTime", label: "Next Retry Time",type: "date"   },
  ],
  "Network:API Call Actions": [
    { key: "networkName",       label: "Network Name",       type: "text"   },
    { key: "time",              label: "Time",               type: "date"   },
    { key: "actionName",        label: "Action Name",        type: "text"   },
    { key: "status",            label: "Status",             type: "select", opts: ["Success", "Failed", "Pending"] },
    { key: "statusDescription", label: "Status Description", type: "text"   },
    { key: "action",            label: "Action",             type: "text"   },
  ],
  "Playbooks:": [
    { key: "name",             label: "Name",             type: "text"   },
    { key: "status",           label: "Status",           type: "select", opts: ["Active", "Inactive", "Draft"] },
    { key: "lastUpdate",       label: "Last Update",      type: "date"   },
    { key: "actionParameters", label: "Action Parameters",type: "text"   },
  ],
  "Auto Remediation:": [
    { key: "name",        label: "Name",        type: "text"   },
    { key: "description", label: "Description", type: "text"   },
    { key: "remediation", label: "Remediation", type: "select", opts: ["File Remediation -> Kill Process", "Network Isolation", "User Disable"] },
    { key: "priority",    label: "Priority",    type: "range"  },
    { key: "dateIn",      label: "Date In",     type: "date"   },
    { key: "isEnabled",   label: "Is Enabled",  type: "select", opts: ["Yes", "No"] },
  ],
};

function getSchema(tab, subTab) {
  return FILTER_SCHEMA[`${tab}:${subTab ?? ""}`] ?? [];
}

// ─── Status badge ─────────────────────────────────────────────────────────────
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

// ─── Table components ─────────────────────────────────────────────────────────
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

function ApiCallActionsTable({ rows }) {
  if (!rows.length) return <EmptyState />;
  return (
    <table className="ap-table">
      <thead>
        <tr>
          <th>File Name</th><th>Time</th><th>Action Name</th>
          <th>Status</th><th>Status Description</th><th>Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="ap-table__filename" title={r.fileName}>{r.fileName}</td>
            <td>{new Date(r.time).toLocaleString()}</td>
            <td>{r.actionName}</td>
            <td><StatusBadge status={r.status} /></td>
            <td className="ap-table__info">{r.statusDescription || "—"}</td>
            <td>{r.action || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AnalysisActionsTable({ rows }) {
  if (!rows.length) return <EmptyState />;
  return (
    <table className="ap-table">
      <thead>
        <tr>
          <th>File Path</th><th>Host Name</th><th>Hashes</th>
          <th>Start Time</th><th>End Time</th><th>Static Result</th><th>Dynamic Result</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="ap-table__filename" title={r.filePath}>{r.filePath}</td>
            <td className="ap-table__link">{r.hostName}</td>
            <td className="ap-table__mono">{r.hashes}</td>
            <td>{new Date(r.startTime).toLocaleString()}</td>
            <td>{r.endTime ? new Date(r.endTime).toLocaleString() : "—"}</td>
            <td><ResultBadge result={r.staticResult} /></td>
            <td><ResultBadge result={r.dynamicResult} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DecoyFilesTable({ rows }) {
  if (!rows.length) return <EmptyState />;
  return (
    <table className="ap-table">
      <thead>
        <tr>
          <th>Root Directory</th><th>Full Path</th><th>Type</th>
          <th>Host Name</th><th>Status</th><th>Last Update</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="ap-table__mono">{r.rootDirectory}</td>
            <td className="ap-table__filename" title={r.fullPath}>{r.fullPath}</td>
            <td>{r.type}</td>
            <td className="ap-table__link">{r.hostName}</td>
            <td><DecoyStatusBadge status={r.status} /></td>
            <td>{new Date(r.lastUpdate).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SendToSocTable({ rows }) {
  if (!rows.length) return <EmptyState />;
  return (
    <table className="ap-table">
      <thead>
        <tr>
          <th>File Path</th><th>Host Name</th><th>Hashes</th>
          <th>Start Time</th><th>End Time</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="ap-table__filename" title={r.filePath}>{r.filePath}</td>
            <td className="ap-table__link">{r.hostName}</td>
            <td className="ap-table__mono">{r.hashes}</td>
            <td>{new Date(r.startTime).toLocaleString()}</td>
            <td>{r.endTime ? new Date(r.endTime).toLocaleString() : "—"}</td>
            <td><StatusBadge status={r.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ResultBadge({ result }) {
  const cls =
    result === "Clean"      ? "ap-status--ok"      :
    result === "Malicious"  ? "ap-status--err"     :
    result === "Suspicious" ? "ap-status--warn"    :
    "ap-status--neutral";
  return <span className={`ap-status ${cls}`}>{result ?? "—"}</span>;
}

function DecoyStatusBadge({ status }) {
  const cls =
    status === "Exists"    ? "ap-status--ok"      :
    status === "Triggered" ? "ap-status--err"     :
    status === "Missing"   ? "ap-status--warn"    :
    "ap-status--neutral";
  return <span className={`ap-status ${cls}`}>{status}</span>;
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

function HostsApiCallTable({ rows }) {
  if (!rows.length) return <EmptyState />;
  return (
    <table className="ap-table">
      <thead>
        <tr>
          <th>Host Name</th><th>Group</th><th>Time</th>
          <th>Action Name</th><th>Status</th><th>Status Description</th><th>Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="ap-table__link">{r.hostName}</td>
            <td>{r.group}</td>
            <td>{new Date(r.time).toLocaleString()}</td>
            <td>{r.actionName}</td>
            <td><StatusBadge status={r.status} /></td>
            <td className="ap-table__info">{r.statusDescription || "—"}</td>
            <td>{r.action || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function HostsAntivirusTable({ rows }) {
  if (!rows.length) return <EmptyState />;
  return (
    <table className="ap-table">
      <thead>
        <tr>
          <th>Endpoint</th><th>Scan Profile</th><th>Scan Type</th>
          <th>Group</th><th>Status</th><th>Start Time</th><th>End Time</th><th>Details</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="ap-table__link">{r.endpoint}</td>
            <td>{r.scanProfile}</td>
            <td>{r.scanType}</td>
            <td>{r.group}</td>
            <td><AntivirusStatusBadge status={r.status} /></td>
            <td>{new Date(r.startTime).toLocaleString()}</td>
            <td>{r.endTime ? new Date(r.endTime).toLocaleString() : "—"}</td>
            <td className="ap-table__info">{r.details || "No details"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AntivirusStatusBadge({ status }) {
  const cls =
    status === "Completed"   ? "ap-status--ok"      :
    status === "In Progress" ? "ap-status--warn"    :
    status === "Canceled"    ? "ap-status--neutral" :
    status === "Failed"      ? "ap-status--err"     :
    "ap-status--neutral";
  return <span className={`ap-status ${cls}`}>{status}</span>;
}

function UsersScriptTable({ rows }) {
  if (!rows.length) return <EmptyState />;
  return (
    <table className="ap-table">
      <thead>
        <tr>
          <th>User Name</th><th>Host Name</th><th>Time</th>
          <th>Action Taken</th><th>Extra Details</th><th>Status</th><th>Status Info</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="ap-table__link">{r.userName}</td>
            <td>{r.hostName}</td>
            <td>{new Date(r.time).toLocaleString()}</td>
            <td>{r.actionTaken}</td>
            <td>{r.extraDetails || "—"}</td>
            <td><StatusBadge status={r.status} /></td>
            <td className="ap-table__info">{r.statusInfo || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function UsersApiCallTable({ rows }) {
  if (!rows.length) return <EmptyState />;
  return (
    <table className="ap-table">
      <thead>
        <tr>
          <th>User Name</th><th>Time</th><th>Action Name</th>
          <th>Status</th><th>Status Description</th><th>Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="ap-table__link">{r.userName}</td>
            <td>{new Date(r.time).toLocaleString()}</td>
            <td>{r.actionName}</td>
            <td><StatusBadge status={r.status} /></td>
            <td className="ap-table__info">{r.statusDescription || "—"}</td>
            <td>{r.action || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function NetworkScriptTable({ rows }) {
  if (!rows.length) return <EmptyState />;
  return (
    <table className="ap-table">
      <thead>
        <tr>
          <th>Network Name</th><th>Host Name</th><th>Time</th>
          <th>Action Taken</th><th>Extra Details</th><th>Status</th><th>Status Info</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>{r.networkName}</td>
            <td className="ap-table__link">{r.hostName}</td>
            <td>{new Date(r.time).toLocaleString()}</td>
            <td>{r.actionTaken}</td>
            <td>{r.extraDetails || "—"}</td>
            <td><StatusBadge status={r.status} /></td>
            <td className="ap-table__info">{r.statusInfo || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function NetworkApiCallTable({ rows }) {
  if (!rows.length) return <EmptyState />;
  return (
    <table className="ap-table">
      <thead>
        <tr>
          <th>Network Name</th><th>Time</th><th>Action Name</th>
          <th>Status</th><th>Status Description</th><th>Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>{r.networkName}</td>
            <td>{new Date(r.time).toLocaleString()}</td>
            <td>{r.actionName}</td>
            <td><StatusBadge status={r.status} /></td>
            <td className="ap-table__info">{r.statusDescription || "—"}</td>
            <td>{r.action || "—"}</td>
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

function TableContent({ tab, subTab, rows }) {
  if (tab === "Files") {
    if (!subTab || subTab === "Script Actions")    return <FilesTable            rows={rows} />;
    if (subTab === "API Call Actions")             return <ApiCallActionsTable   rows={rows} />;
    if (subTab === "Analysis Actions")             return <AnalysisActionsTable  rows={rows} />;
    if (subTab === "Decoy Files Status")           return <DecoyFilesTable       rows={rows} />;
    if (subTab === "Send To Soc Actions")          return <SendToSocTable        rows={rows} />;
  }
  if (tab === "Hosts") {
    if (!subTab || subTab === "Script Actions")  return <HostsTable          rows={rows} />;
    if (subTab === "API Call Actions")           return <HostsApiCallTable   rows={rows} />;
    if (subTab === "Antivirus Actions")          return <HostsAntivirusTable rows={rows} />;
  }
  if (tab === "Users") {
    if (!subTab || subTab === "Script Actions") return <UsersScriptTable  rows={rows} />;
    if (subTab === "API Call Actions")          return <UsersApiCallTable rows={rows} />;
  }
  if (tab === "Network") {
    if (!subTab || subTab === "Script Actions") return <NetworkScriptTable  rows={rows} />;
    if (subTab === "API Call Actions")          return <NetworkApiCallTable rows={rows} />;
  }
  if (tab === "Playbooks")
    return <GenericTable rows={rows} columns={[
      { key: "name", label: "Name" }, { key: "status", label: "Status" },
      { key: "lastUpdate", label: "Last Update" }, { key: "actionParameters", label: "Action Parameters" },
    ]} />;
  if (tab === "Auto Remediation")
    return <AutoRemediationTable rows={rows} />;
  return null;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ActionsPage() {
  const [tab,    setTab]    = useState("Files");
  const [subTab, setSubTab] = useState("Script Actions");
  const [data,   setData]   = useState(null);
  const [loading,setLoading]= useState(true);
  const [filters,setFilters]= useState({});

  useEffect(() => {
    fetchActionsData().then((d) => { setData(d); setLoading(false); });
  }, []);

  const handleMainTab = (t) => {
    setTab(t);
    setSubTab(SUB_TABS[t][0] ?? null);
    setFilters({});
  };

  const handleSubTab = (s) => {
    setSubTab(s);
    setFilters({});
  };

  const schema = getSchema(tab, subTab);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => setFilters({});

  // Filtered rows
  const currentRows = useMemo(() => {
    if (!data) return [];
    let raw = [];
    if (tab === "Files") {
      if (!subTab || subTab === "Script Actions") raw = data.files;
      else if (subTab === "API Call Actions")     raw = data.apiCallActions;
      else if (subTab === "Analysis Actions")     raw = data.analysisActions;
      else if (subTab === "Decoy Files Status")   raw = data.decoyFiles;
      else if (subTab === "Send To Soc Actions")  raw = data.sendToSoc;
    } else if (tab === "Hosts") {
      if (!subTab || subTab === "Script Actions") raw = data.hosts;
      else if (subTab === "API Call Actions")     raw = data.hostsApiCall;
      else if (subTab === "Antivirus Actions")    raw = data.hostsAntivirus;
    } else if (tab === "Users") {
      if (!subTab || subTab === "Script Actions") raw = data.users;
      else if (subTab === "API Call Actions")     raw = data.usersApiCall;
    } else if (tab === "Network") {
      if (!subTab || subTab === "Script Actions") raw = data.network;
      else if (subTab === "API Call Actions")     raw = data.networkApiCall;
    }
    else if (tab === "Playbooks")          raw = data.playbooks;
    else if (tab === "Auto Remediation")   raw = data.autoRemediation;
    return applyFilters(raw ?? [], filters, schema);
  }, [data, tab, subTab, filters, schema]);

  const subTabs  = SUB_TABS[tab];
  const rowCount = currentRows.length;

  return (
    <div className="actions-page">
      <div className="page-header">
        <h1 className="page-title">Actions</h1>
      </div>

      {/* ── Main tabs ── */}
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

      {/* ── Secondary sub-tabs ── */}
      {subTabs.length > 0 && (
        <div className="ap-subtabs">
          {subTabs.map((s) => (
            <button
              key={s}
              className={`ap-subtab ${subTab === s ? "ap-subtab--active" : ""}`}
              onClick={() => handleSubTab(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Special headers ── */}
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

      {/* ── Filter bar ── */}
      {!loading && (
        <FilterBar
          schema={schema}
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClear}
        />
      )}

      {/* ── Table ── */}
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
              <TableContent tab={tab} subTab={subTab} rows={currentRows} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
