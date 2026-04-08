import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SecurityRing from "../components/SecurityRing";
import SectionCard from "../components/SectionCard";
import { SectionIcon } from "../components/Icons";
import { useSecurityData } from "../hooks/useSecurityData";
import "./Dashboard.css";

const REGIME_CYCLE = [
  "realistic",
  "none",
  "all_yellow",
  "all_red",
];

export default function Dashboard() {
  const { data, loading, error, refresh } = useSecurityData(30000);
  const navigate = useNavigate();
  const [regimeIdx, setRegimeIdx] = useState(0);

  const cycleTest = async () => {
    const next = (regimeIdx + 1) % REGIME_CYCLE.length;
    const mode = REGIME_CYCLE[next];

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/regime/${mode}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setRegimeIdx(next);
      await refresh();
    } catch (err) {
      console.error("Failed to switch regime", err);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading__ring" />
        <p>Loading security data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <span>⚠</span>
        <p>Failed to load security data: {error}</p>
        <button onClick={refresh}>Retry</button>
      </div>
    );
  }

  const displaySections = data?.sections ?? [];
  const displayScore = data?.overallScore ?? 0;

  const criticalCount = displaySections.filter((s) => s.status === "critical").length;
  const warningCount = displaySections.filter((s) => s.status === "warning").length;
  const okCount = displaySections.filter(
      (s) => s.status === "ok" || s.status === "safe"
    ).length;

  const overallStatus =
    criticalCount > 0 ? "critical" : warningCount > 0 ? "warning" : "ok";

  const updated = data?.lastUpdated
      ? new Date(data.lastUpdated).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--";

  return (
    <div className="dashboard">
      <div
        className={`screen-overlay screen-overlay--${overallStatus}`}
        aria-hidden="true"
      />

      <header className="dashboard__header">
        <div className="dashboard__header-left">
          <h1 className="dashboard__title">Security Overview</h1>
          <span className="dashboard__updated">Updated {updated}</span>
        </div>

        <div className="dashboard__stats">
          {criticalCount > 0 && (
            <div className="dash-stat dash-stat--critical">
              <span className="dash-stat__num">{criticalCount}</span>
              <span className="dash-stat__lbl">Critical</span>
            </div>
          )}

          {warningCount > 0 && (
            <div className="dash-stat dash-stat--warning">
              <span className="dash-stat__num">{warningCount}</span>
              <span className="dash-stat__lbl">Warning</span>
            </div>
          )}

          <div className="dash-stat dash-stat--ok">
            <span className="dash-stat__num">{okCount}</span>
            <span className="dash-stat__lbl">Secure</span>
          </div>

          <button
            className="dashboard__refresh-btn"
            onClick={refresh}
            title="Refresh"
          >
            ↺
          </button>
        </div>
      </header>

      <div className="dashboard__body">
        <div className="dashboard__ring-col">
          <SecurityRing sections={displaySections} overallScore={displayScore} />
          <p className="dashboard__ring-hint">
            Hover a segment for details · Click to drill in
          </p>
        </div>

        <div className="dashboard__cards-col">
          <h2 className="dashboard__cards-title">Security Modules</h2>
          <div className="dashboard__cards-grid">
            {displaySections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>
        </div>
      </div>

      <section className="dashboard__issues">
        <h2 className="dashboard__issues-title">Active Issues</h2>
        <div className="dashboard__issues-list">
          {displaySections.flatMap((s) => s.issues).length === 0 ? (
            <div className="dashboard__no-issues">
              No active issues — all systems secure
            </div>
          ) : (
            displaySections
              .flatMap((s) =>
                s.issues.map((issue) => ({
                  ...issue,
                  sectionLabel: s.label,
                  sectionId: s.id,
                }))
              )
              .sort((a, b) => {
                const order = { critical: 0, high: 1, medium: 2, low: 3 };
                return (order[a.severity] ?? 9) - (order[b.severity] ?? 9);
              })
              .map((issue) => (
                <div
                  key={issue.id}
                  className={`issue-row issue-row--${issue.severity}`}
                  onClick={() => navigate(issue.route)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(issue.route)}
                >
                  <span className="issue-row__sev">{issue.severity}</span>
                  <span className="issue-row__section">
                    <SectionIcon id={issue.sectionId} size={13} color="#64748b" />
                    {issue.sectionLabel}
                  </span>
                  <span className="issue-row__title">{issue.title}</span>
                  <span className="issue-row__desc">{issue.description}</span>
                  <span className="issue-row__arrow">→</span>
                </div>
              ))
          )}
        </div>
      </section>

      <button
        className={`dashboard__test-btn dashboard__test-btn--${REGIME_CYCLE[regimeIdx]}`}
        onClick={cycleTest}
        title={`Regime: ${REGIME_CYCLE[regimeIdx]} → click to cycle`}
      />
    </div>
  );
}