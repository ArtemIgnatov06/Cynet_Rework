import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSecurityData } from "../hooks/useSecurityData";
import { StatusCard, IcoChevronLeft } from "./GenericSectionPage";
import "./NetworkPage.css";
import "./SectionPage.css";
import NetworkTopologyGraph from "../components/NetworkTopologyGraph";

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };


function ActionCard({ issue, onOpen }) {
  return (
    <div className={`network-action-card network-action-card--${issue.severity}`}>
      <div className="network-action-card__top">
        <span className="network-action-card__sev">{issue.severity}</span>
        <span className="network-action-card__title">{issue.title}</span>
      </div>
      <p className="network-action-card__desc">{issue.description}</p>
      <button className="network-action-card__btn" onClick={onOpen}>
        Perform
      </button>
    </div>
  );
}

export default function NetworkPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useSecurityData();

  const section =
    data?.sections.find(
      (s) =>
        s.id === "network" ||
        s.id === "networks" ||
        s.label?.toLowerCase().includes("network")
    ) || null;

  const sortedIssues = [...(section?.issues || [])].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  );

  const mapNodes = useMemo(() => {
    const assets = sortedIssues.flatMap((issue) =>
      (issue.affectedAssets || []).map((asset) => ({
        asset,
        severity: issue.severity,
        issueTitle: issue.title,
        route: issue.route,
      }))
    );

    const deduped = [];
    const seen = new Set();

    for (const node of assets) {
      const key = `${node.asset}-${node.issueTitle}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(node);
      }
    }

    return deduped.slice(0, 4);
  }, [sortedIssues]);

  if (loading) return <div className="section-page__loading">Loading…</div>;
  if (error) return <div className="section-page__error">Error: {error}</div>;

  if (!section) {
    return (
      <div className="section-page__not-found">
        <p>Network section not found.</p>
        <button onClick={() => navigate("/")}>← Back to overview</button>
      </div>
    );
  }

  return (
    <div className="sp network-page">
      <button className="sp-back" onClick={() => navigate("/")}>
        <IcoChevronLeft /> Overview
      </button>

      <StatusCard section={section} />

      <section className="section-page__block network-map-block">
          <h2 className="section-page__block-title">Map</h2>

          <NetworkTopologyGraph />

          <div className="network-map__footer" style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
            <button
              className="network-map-block__view-btn"
              onClick={() => navigate("/system")}
              type="button"
            >
              View system
            </button>
          </div>
        </section>

      <section className="section-page__block">
        <h2 className="section-page__block-title">Security Modules</h2>
        <div className="section-page__modules">
          {section.subModules?.map((mod) => (
            <div
              key={mod.name}
              className={`module-card ${mod.ok ? "module-card--ok" : "module-card--fail"}`}
            >
              <span className="module-card__status-dot" />
              <span className="module-card__name">{mod.name}</span>
              <span className="module-card__badge">{mod.ok ? "OK" : "Issue"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-page__block">
        <h2 className="section-page__block-title">
          Active Issues
          {sortedIssues.length > 0 && (
            <span className="section-page__issue-count">{sortedIssues.length}</span>
          )}
        </h2>

        {sortedIssues.length === 0 ? (
          <div className="section-page__no-issues">✓ No active issues in this section</div>
        ) : (
          <div className="section-page__issues">
            {sortedIssues.map((issue) => (
              <div
                key={issue.id}
                className={`issue-detail issue-detail--${issue.severity}`}
                onClick={() => navigate(issue.route)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate(issue.route)}
              >
                <div className="issue-detail__header">
                  <span className="issue-detail__sev">{issue.severity}</span>
                  <span className="issue-detail__title">{issue.title}</span>
                  <span className="issue-detail__arrow">→</span>
                </div>
                <p className="issue-detail__desc">{issue.description}</p>
                <div className="issue-detail__assets">
                  {issue.affectedAssets?.map((a) => (
                    <span key={a} className="issue-detail__asset">
                      {a}
                    </span>
                  ))}
                </div>
                <div className="issue-detail__time">
                  Detected: {new Date(issue.detectedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section-page__block">
        <h2 className="section-page__block-title">Actions to perform</h2>

        {sortedIssues.length === 0 ? (
          <div className="section-page__no-issues">No actions required right now.</div>
        ) : (
          <div className="network-actions">
            {sortedIssues.map((issue) => (
              <ActionCard
                key={issue.id}
                issue={issue}
                onOpen={() => navigate(issue.route)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}