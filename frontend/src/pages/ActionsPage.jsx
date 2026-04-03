import { useState, useEffect, useMemo } from "react";
import { fetchActionsData } from "../api/securityApi";
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
// type: "text" | "select" | "date"
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
    { key: "fileName",   label: "File Name",   type: "text" },
    { key: "hostName",   label: "Host Name",   type: "text" },
    { key: "actionName", label: "Action Name", type: "text" },
    { key: "status",     label: "Status",      type: "select", opts: ["Success", "Failed", "Pending"] },
  ],
  "Files:Analysis Actions": [
    { key: "fileName", label: "File Name", type: "text" },
    { key: "hostName", label: "Host Name", type: "text" },
    { key: "status",   label: "Status",    type: "select", opts: ["Completed", "In Progress", "Failed"] },
  ],
  "Files:Decoy Files Status": [
    { key: "fileName", label: "File Name", type: "text" },
    { key: "status",   label: "Status",    type: "select", opts: ["Active", "Triggered", "Inactive"] },
  ],
  "Files:Send To Soc Actions": [
    { key: "fileName",   label: "File Name",   type: "text" },
    { key: "actionName", label: "Action Name", type: "text" },
    { key: "status",     label: "Status",      type: "select", opts: ["Sent", "Pending", "Failed"] },
  ],
  "Hosts:Script Actions": [
    { key: "hostName",   label: "Host Name",   type: "text"   },
    { key: "scanGroup",  label: "Scan Group",  type: "text"   },
    { key: "time",       label: "Time",        type: "date"   },
    { key: "actionTaken",label: "Action Taken",type: "text"   },
    { key: "status",     label: "Status",      type: "select", opts: ["Success", "Execution Failed", "Timeout", "Misc Error"] },
    { key: "statusInfo", label: "Status Info", type: "text"   },
  ],
  "Hosts:API Call Actions": [
    { key: "hostName",   label: "Host Name",   type: "text" },
    { key: "actionName", label: "Action Name", type: "text" },
    { key: "status",     label: "Status",      type: "select", opts: ["Success", "Failed", "Pending"] },
  ],
  "Hosts:Antivirus Actions": [
    { key: "hostName", label: "Host Name", type: "text" },
    { key: "scanGroup",label: "Scan Group",type: "text" },
    { key: "status",   label: "Status",    type: "select", opts: ["Success", "Failed", "In Progress"] },
  ],
  "Users:Script Actions": [
    { key: "userName",   label: "User Name",   type: "text"   },
    { key: "hostName",   label: "Host Name",   type: "text"   },
    { key: "time",       label: "Time",        type: "date"   },
    { key: "actionTaken",label: "Action Taken",type: "select", opts: ["Lock Account", "Reset Password", "Disable User"] },
    { key: "status",     label: "Status",      type: "select", opts: ["Success", "Execution Failed", "Timeout"] },
    { key: "statusInfo", label: "Status Info", type: "text"   },
  ],
  "Users:API Call Actions": [
    { key: "userName",   label: "User Name",   type: "text" },
    { key: "actionName", label: "Action Name", type: "text" },
    { key: "status",     label: "Status",      type: "select", opts: ["Success", "Failed", "Pending"] },
  ],
  "Network:Script Actions": [
    { key: "networkName",label: "Network Name",type: "text"   },
    { key: "hostName",   label: "Host Name",   type: "text"   },
    { key: "time",       label: "Time",        type: "date"   },
    { key: "actionTaken",label: "Action Taken",type: "select", opts: ["Block IP", "Isolate Host", "Reset Connection"] },
    { key: "status",     label: "Status",      type: "select", opts: ["Success", "Execution Failed", "Timeout"] },
    { key: "statusInfo", label: "Status Info", type: "text"   },
  ],
  "Network:API Call Actions": [
    { key: "networkName",      label: "Network Name",      type: "text"   },
    { key: "time",             label: "Time",              type: "date"   },
    { key: "actionName",       label: "Action Name",       type: "text"   },
    { key: "status",           label: "Status",            type: "select", opts: ["Success", "Failed", "Pending"] },
    { key: "statusDescription",label: "Status Description",type: "text"   },
  ],
  "Playbooks:": [
    { key: "name",   label: "Name",   type: "text"   },
    { key: "status", label: "Status", type: "select", opts: ["Active", "Inactive", "Draft"] },
    { key: "lastUpdate", label: "Last Update", type: "date" },
    { key: "actionParameters", label: "Action Parameters", type: "text" },
  ],
  "Auto Remediation:": [
    { key: "name",        label: "Name",        type: "text"   },
    { key: "description", label: "Description", type: "text"   },
    { key: "remediation", label: "Remediation", type: "select", opts: ["File Remediation -> Kill Process", "Network Isolation", "User Disable"] },
    { key: "isEnabled",   label: "Is Enabled",  type: "select", opts: ["Yes", "No"] },
  ],
};

function getSchema(tab, subTab) {
  return FILTER_SCHEMA[`${tab}:${subTab ?? ""}`] ?? [];
}

// ─── Filter bar ───────────────────────────────────────────────────────────────
function FilterBar({ schema, filters, onChange, onClear }) {
  const activeCount = Object.values(filters).filter((v) => v && v !== "").length;

  if (!schema.length) return null;

  return (
    <div className="filter-bar">
      <div className="filter-bar__header">
        <div className="filter-bar__label">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="filter-bar__count">{activeCount}</span>
          )}
        </div>
        {activeCount > 0 && (
          <button className="filter-bar__clear" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>

      <div className="filter-bar__fields">
        {schema.map((field) => (
          <div key={field.key} className="filter-field">
            <label className="filter-field__label">{field.label}</label>
            {field.type === "select" ? (
              <div className="filter-field__select-wrap">
                <select
                  className="filter-field__select"
                  value={filters[field.key] ?? ""}
                  onChange={(e) => onChange(field.key, e.target.value)}
                >
                  <option value="">All</option>
                  {field.opts.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <svg className="filter-field__chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            ) : field.type === "date" ? (
              <div className="filter-field__date-wrap">
                <input
                  type="text"
                  className="filter-field__input filter-field__input--date"
                  placeholder="From"
                  value={filters[field.key + "_from"] ?? ""}
                  onChange={(e) => onChange(field.key + "_from", e.target.value)}
                />
                <span className="filter-field__date-sep">–</span>
                <input
                  type="text"
                  className="filter-field__input filter-field__input--date"
                  placeholder="To"
                  value={filters[field.key + "_to"] ?? ""}
                  onChange={(e) => onChange(field.key + "_to", e.target.value)}
                />
              </div>
            ) : (
              <div className="filter-field__input-wrap">
                <svg className="filter-field__icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  className="filter-field__input"
                  placeholder="Search…"
                  value={filters[field.key] ?? ""}
                  onChange={(e) => onChange(field.key, e.target.value)}
                />
                {filters[field.key] && (
                  <button className="filter-field__clear-x" onClick={() => onChange(field.key, "")}>×</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Apply filters to rows ────────────────────────────────────────────────────
function applyFilters(rows, filters, schema) {
  if (!rows.length) return rows;
  return rows.filter((row) =>
    schema.every((field) => {
      if (field.type === "date") return true; // date filtering skipped (no parser)
      const val = filters[field.key];
      if (!val || val === "") return true;
      const rowVal = String(row[field.key] ?? "").toLowerCase();
      if (field.type === "select") return rowVal === val.toLowerCase();
      return rowVal.includes(val.toLowerCase());
    })
  );
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
  const filteredData = useMemo(() => {
    if (!data) return null;
    const isScript = subTab === "Script Actions" || !subTab;
    const clone = { ...data };
    if (tab === "Files")   clone.files   = applyFilters(isScript ? data.files   : [], filters, schema);
    if (tab === "Hosts")   clone.hosts   = applyFilters(isScript ? data.hosts   : [], filters, schema);
    if (tab === "Users")   clone.users   = applyFilters(isScript ? data.users   : [], filters, schema);
    if (tab === "Network") clone.network = applyFilters(isScript ? data.network : [], filters, schema);
    return clone;
  }, [data, tab, subTab, filters, schema]);

  const subTabs  = SUB_TABS[tab];
  const tabKey   = tab === "Auto Remediation" ? "autoRemediation" : tab.toLowerCase();
  const rowCount = filteredData?.[tabKey]?.length ?? 0;

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
              <TableContent tab={tab} subTab={subTab} data={filteredData} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
