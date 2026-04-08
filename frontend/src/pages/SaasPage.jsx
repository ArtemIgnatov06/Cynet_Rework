import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IcoChevronLeft } from "./GenericSectionPage";
import { useSaasCloudData } from "../hooks/useSaasCloudData";
import "./SectionPage.css";
import "./SaasPage.css";

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const STATUS_CFG = {
  ok: {
    color: "#22c55e",
    dim: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.22)",
    headline: "Cloud posture looks healthy",
    sub: "No major SaaS misconfigurations need action right now.",
  },
  warning: {
    color: "#f59e0b",
    dim: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.22)",
    headline: "A few cloud settings need review",
    sub: "Nothing catastrophic, but there are risks worth fixing soon.",
  },
  critical: {
    color: "#ef4444",
    dim: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.22)",
    headline: "Important SaaS risks are open",
    sub: "Some cloud services are exposed or misconfigured and should be fixed first.",
  },
};

const SEVERITY_LABELS = {
  all: "All severities",
  critical: "Critical only",
  high: "High only",
  medium: "Medium only",
  low: "Low only",
};

const SEVERITY_META = {
  critical: { label: "Critical", dot: "#ef4444" },
  high: { label: "High", dot: "#f97316" },
  medium: { label: "Medium", dot: "#fbbf24" },
  low: { label: "Low", dot: "#60a5fa" },
};

export default function SaasPage() {
  const navigate = useNavigate();
  const { data, loading, error, refresh } = useSaasCloudData("manageable", 6);
  const [activeTab, setActiveTab] = useState("risks");
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [savedFilter, setSavedFilter] = useState("All Findings");
  const saas = data?.saasCloud ?? null;
  const active = activeTab || saas?.activeTab || "risks";
  const currentDataset = saas?.datasets?.[active] ?? saas?.datasets?.risks ?? {
    topRiskyServices: [],
    issuesOverTime: [],
    severityBreakdown: {
      critical: { count: 0, percentage: 0 },
      high: { count: 0, percentage: 0 },
      medium: { count: 0, percentage: 0 },
      low: { count: 0, percentage: 0 },
    },
    issues: [],
  };
  const status = STATUS_CFG[saas?.status] ?? STATUS_CFG.warning;
  const lastScan = saas?.scan?.lastScan
    ? new Date(saas.scan.lastScan).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not scanned yet";

  const filteredIssues = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (currentDataset.issues ?? []).filter((issue) => {
      const matchesQuery =
        !q ||
        [
          issue.service,
          issue.category,
          issue.subject,
          issue.currentValue,
          issue.secureValue,
          issue.compliance,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchesSeverity = severity === "all" || issue.severity === severity;
      return matchesQuery && matchesSeverity;
    });
  }, [currentDataset.issues, query, severity]);

  const priorityIssues = useMemo(
    () =>
      [...filteredIssues]
        .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9))
        .slice(0, 3),
    [filteredIssues]
  );

  if (loading) return <div className="sp-center">Loading SaaS & Cloud data…</div>;
  if (error) return <div className="sp-center sp-center--err">Failed to load SaaS & Cloud data: {error}</div>;
  if (!saas) return <div className="sp-center">SaaS & Cloud data not found.</div>;

  return (
    <div className="sp saas-page">
      <button className="sp-back" onClick={() => navigate("/")}>
        <IcoChevronLeft /> Overview
      </button>

      <section
        className="sp-status"
        style={{ "--st-color": status.color, "--st-dim": status.dim, "--st-border": status.border }}
      >
        <div className="sp-status__meta">
          <div className="sp-status__name">SaaS &amp; Cloud</div>
          <div className="sp-status__count">{saas.summary.monitoredServices} connected services</div>
        </div>

        <div className="sp-status__center">
          <div className="sp-status__emoji">{saas.status === "ok" ? "✓" : "!"}</div>
          <div className="sp-status__headline">{status.headline}</div>
          <div className="sp-status__sub">{status.sub}</div>
        </div>

        <div className="sp-status__score-wrap">
          <svg width="90" height="90" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="45"
              cy="45"
              r="36"
              fill="none"
              stroke={status.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - saas.healthScore / 100)}`}
              transform="rotate(-90 45 45)"
              opacity="0.85"
            />
          </svg>
          <div className="sp-status__score-val" style={{ color: status.color }}>{saas.healthScore}%</div>
        </div>

        <div className="saas-status-actions">
          <div className="saas-status-actions__pill">
            <span className="saas-status-actions__dot" style={{ background: status.color }} />
            {saas.scan.errorCount} open findings
          </div>
          <div className="saas-status-actions__sub">Last scan: {lastScan}</div>
          <button className="saas-status-actions__btn" onClick={refresh}>Rescan</button>
        </div>
      </section>

      <div className="sp-section">
        <div className="sp-section__title">
          Review Area
          <span className="sp-section__badge">{saas.tabs.length} sections</span>
        </div>
        <div className="saas-tabs">
        {saas.tabs.map((tab) => (
          <button
            key={tab.id}
            className={`saas-tabs__item ${active === tab.id ? "saas-tabs__item--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count > 0 && <span className="saas-tabs__count">{tab.count}</span>}
          </button>
        ))}
        </div>
      </div>

      <div className="sp-section">
        <div className="sp-section__title sp-section__title--warn">
          <span className="sp-section__dot sp-section__dot--pulse" />
          {priorityIssues.length === 0
            ? "Nothing needs attention right now"
            : priorityIssues.length === 1
              ? "1 thing to review first"
              : `${priorityIssues.length} things to review first`}
        </div>

        {priorityIssues.length === 0 ? (
          <div className="sp-allclear">
            <span className="sp-allclear__check">✓</span>
            <div>
              <div className="sp-allclear__headline">This section looks good</div>
              <div className="sp-allclear__sub">No findings match the current filters.</div>
            </div>
          </div>
        ) : (
          <div className="sp-issues">
            {priorityIssues.map((issue) => (
              <div key={issue.id} className={`sp-issue saas-issue saas-issue--${issue.severity}`}>
                <div className="sp-issue__badge" style={{ background: `rgba(255,255,255,0.06)`, color: SEVERITY_META[issue.severity].dot }}>
                  {SEVERITY_META[issue.severity].label}
                </div>
                <h3 className="sp-issue__title">{issue.subject}</h3>
                <p className="sp-issue__desc">
                  {issue.service} • {issue.category}
                </p>
                <div className="saas-issue__facts">
                  <div className="saas-issue__fact">
                    <span className="saas-issue__fact-label">Current</span>
                    <strong>{issue.currentValue}</strong>
                  </div>
                  <div className="saas-issue__fact">
                    <span className="saas-issue__fact-label">Secure</span>
                    <strong>{issue.secureValue}</strong>
                  </div>
                  <div className="saas-issue__fact">
                    <span className="saas-issue__fact-label">Compliance</span>
                    <strong>{issue.compliance}</strong>
                  </div>
                  <div className="saas-issue__fact">
                    <span className="saas-issue__fact-label">Status</span>
                    <strong>{issue.status}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sp-section">
        <div className="sp-section__title">
          Coverage Summary
          <span className="sp-section__badge">{active.replaceAll("-", " ")}</span>
        </div>
        <div className="saas-summary-list">
          <div className="saas-summary-list__row">
            <span>Monitored users</span>
            <strong>{saas.summary.monitoredUsers}</strong>
          </div>
          <div className="saas-summary-list__row">
            <span>Connected services</span>
            <strong>{saas.summary.monitoredServices}</strong>
          </div>
          <div className="saas-summary-list__row">
            <span>Risky services in this section</span>
            <strong>{currentDataset.topRiskyServices.length}</strong>
          </div>
          <div className="saas-summary-list__row">
            <span>Open findings in this section</span>
            <strong>{currentDataset.issues.length}</strong>
          </div>
        </div>
      </div>

      <div className="sp-section">
        <div className="sp-section__title">
          Search Findings
          <span className="sp-section__badge">{filteredIssues.length} shown</span>
        </div>
        <div className="saas-toolbar">
        <label className="saas-toolbar__search">
          <span className="saas-toolbar__icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search service, category or subject..."
          />
        </label>

        <select
          className="saas-toolbar__select"
          value={severity}
          onChange={(event) => setSeverity(event.target.value)}
        >
          {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          className="saas-toolbar__select"
          value={savedFilter}
          onChange={(event) => setSavedFilter(event.target.value)}
        >
          {saas.savedFilters.map((filter) => (
            <option key={filter} value={filter}>{filter}</option>
          ))}
        </select>
      </div>
      </div>

      <section className="saas-table-card">
        <div className="saas-table-card__head">
          <h2>Open findings</h2>
          <span>{filteredIssues.length} rows</span>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="saas-table__empty">No findings match the current search and filter.</div>
        ) : (
          <div className="saas-findings">
            {filteredIssues.map((issue) => (
              <article key={issue.id} className="saas-finding">
                <div className="saas-finding__top">
                  <span className={`saas-table__severity saas-table__severity--${issue.severity}`}>
                    {SEVERITY_META[issue.severity]?.label ?? issue.severity}
                  </span>
                  <span className="saas-table__status">{issue.status}</span>
                </div>

                <h3 className="saas-finding__title">{issue.subject}</h3>
                <p className="saas-finding__sub">
                  {issue.service} • {issue.category}
                </p>

                <div className="saas-finding__grid">
                  <div className="saas-finding__cell">
                    <span className="saas-finding__label">Current value</span>
                    <strong>{issue.currentValue}</strong>
                  </div>
                  <div className="saas-finding__cell">
                    <span className="saas-finding__label">Secure value</span>
                    <strong>{issue.secureValue}</strong>
                  </div>
                  <div className="saas-finding__cell">
                    <span className="saas-finding__label">Compliance</span>
                    <strong>{issue.compliance}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
