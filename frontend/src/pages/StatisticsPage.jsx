import { useState, useEffect } from "react";
import { fetchStatsData } from "../api/securityApi";
import "./StatisticsPage.css";

function BarChart({ data, color = "#0ea5e9" }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="bar-chart">
      <div className="bar-chart__bars">
        {data.map((d) => (
          <div key={d.label} className="bar-chart__col">
            <div
              className="bar-chart__bar"
              style={{ height: `${(d.count / max) * 100}%`, background: color }}
              title={`${d.label}: ${d.count}`}
            />
            <span className="bar-chart__label">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div className="stat-card">
      <span className="stat-card__value" style={{ color }}>{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}

function ModuleCard({ mod }) {
  const statusCls =
    mod.status === "ok"       ? "mod-card--ok"   :
    mod.status === "warning"  ? "mod-card--warn" :
    mod.status === "disabled" ? "mod-card--off"  : "";

  return (
    <div className={`mod-card ${statusCls}`}>
      <div className="mod-card__body">
        <span className="mod-card__name">{mod.name}</span>
        {mod.subtitle && <span className="mod-card__sub">{mod.subtitle}</span>}
      </div>
      {mod.alerts > 0 && (
        <span className="mod-card__alert">{mod.alerts} Alert{mod.alerts > 1 ? "s" : ""}</span>
      )}
      <span className={`mod-card__shield mod-card__shield--${mod.status}`}>
        {mod.status === "ok" ? "✓" : mod.status === "warning" ? "!" : "○"}
      </span>
    </div>
  );
}

export default function StatisticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatsData().then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="stats-page"><div className="fp-loading">Loading…</div></div>;

  const { summary, alertsOverTime, risksOverTime, protectedCategories, riskCategories, modules } = data;

  return (
    <div className="stats-page">
      <div className="page-header">
        <h1 className="page-title">Statistics</h1>
      </div>

      {/* ── Summary stat cards ── */}
      <div className="stats-grid">
        <StatCard value={summary.activeEndpoints}        label="Active Endpoints"        color="#0ea5e9" />
        <StatCard value={summary.protectedUsers}         label="Protected Users"         color="#10b981" />
        <StatCard value={summary.totalAlerts}            label="Total Alerts"            color="#f59e0b" />
        <StatCard value={summary.criticalAlerts}         label="Critical Alerts"         color="#ef4444" />
        <StatCard value={summary.resolvedLast30Days}     label="Resolved (Last 30 days)" color="#34d399" />
        <StatCard value={summary.actionsExecuted}        label="Actions Executed"        color="#818cf8" />
        <StatCard value={summary.dataSourcesConnected}   label="Data Sources"            color="#64748b" />
      </div>

      {/* ── Two-column layout ── */}
      <div className="stats-cols">
        {/* Left — modules list */}
        <div className="stats-col">
          <h2 className="stats-section-title">Protection Modules</h2>
          <div className="stats-modules">
            {modules.map((m) => <ModuleCard key={m.name} mod={m} />)}
          </div>
        </div>

        {/* Right — charts + categories */}
        <div className="stats-col">
          <h2 className="stats-section-title">Alerts Over Time</h2>
          <div className="stats-chart-box">
            <BarChart data={alertsOverTime} color="#ef4444" />
          </div>

          <h2 className="stats-section-title" style={{ marginTop: 28 }}>Number of Risks Over Time</h2>
          <div className="stats-chart-box">
            <BarChart data={risksOverTime} color="#f59e0b" />
          </div>
        </div>
      </div>

      {/* ── Protected categories ── */}
      <div className="stats-row">
        <div className="stats-block">
          <h2 className="stats-section-title">Protected Categories</h2>
          <div className="stats-cat-table">
            <div className="stats-cat-row stats-cat-row--head">
              <span>Category</span>
              <span>Closed / Open</span>
            </div>
            {protectedCategories.map((c) => (
              <div key={c.name} className="stats-cat-row">
                <span className="stats-cat-name">
                  <span className="stats-cat-check">✓</span> {c.name}
                </span>
                <span className="stats-cat-vals">
                  <span className="stats-cat-closed">{c.closed}</span>
                  {c.open > 0 && (
                    <span className="stats-cat-open">{c.open} Open</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-block">
          <h2 className="stats-section-title">Risk Categories</h2>
          <div className="stats-cat-table">
            <div className="stats-cat-row stats-cat-row--head">
              <span>Category</span>
              <span>Total / Open</span>
            </div>
            {riskCategories.map((c) => (
              <div key={c.name} className="stats-cat-row">
                <span className="stats-cat-name">
                  <span className="stats-cat-dot" /> {c.name}
                </span>
                <span className="stats-cat-vals">
                  <span className="stats-cat-closed">{c.count}</span>
                  {c.open > 0 && (
                    <span className="stats-cat-open">{c.open} Open</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
