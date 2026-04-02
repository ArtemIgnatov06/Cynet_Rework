import { useParams, useNavigate } from "react-router-dom";
import { SectionIcon } from "../components/Icons";
import { useSecurityData } from "../hooks/useSecurityData";
import "./SectionPage.css";

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const STATUS_CFG = {
  ok:       { color: "#22c55e", label: "Secure"   },
  warning:  { color: "#f59e0b", label: "Warning"  },
  critical: { color: "#ef4444", label: "Critical" },
};

export default function SectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useSecurityData();

  if (loading) return <div className="section-page__loading">Loading…</div>;
  if (error)   return <div className="section-page__error">Error: {error}</div>;

  const section = data?.sections.find((s) => s.id === id);
  if (!section) {
    return (
      <div className="section-page__not-found">
        <p>Section "{id}" not found.</p>
        <button onClick={() => navigate("/")}>← Back to overview</button>
      </div>
    );
  }

  const cfg = STATUS_CFG[section.status];
  const sortedIssues = [...(section.issues || [])].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  );

  return (
    <div className="section-page">
      {/* ── Back ────────────────────────────────────────────────────── */}
      <button className="section-page__back" onClick={() => navigate("/")}>
        ← Overview
      </button>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div className="section-page__hero">
        <div className="section-page__hero-left">
          <span className="section-page__hero-icon">
            <SectionIcon id={section.id} size={28} color="#0ea5e9" />
          </span>
          <div>
            <h1 className="section-page__hero-title">{section.label}</h1>
            <span
              className="section-page__hero-status"
              style={{ color: cfg.color, borderColor: cfg.color + "40" }}
            >
              {cfg.label}
            </span>
          </div>
        </div>

        <div className="section-page__hero-score" style={{ color: cfg.color }}>
          {section.score}%
          <span className="section-page__hero-score-lbl">Health Score</span>
        </div>
      </div>

      {/* ── Score bar ───────────────────────────────────────────────── */}
      <div className="section-page__bar-bg">
        <div
          className="section-page__bar-fill"
          style={{ width: `${section.score}%`, background: cfg.color }}
        />
      </div>

      {/* ── Sub-modules ─────────────────────────────────────────────── */}
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

      {/* ── Issues ──────────────────────────────────────────────────── */}
      <section className="section-page__block">
        <h2 className="section-page__block-title">
          Active Issues
          {sortedIssues.length > 0 && (
            <span className="section-page__issue-count">{sortedIssues.length}</span>
          )}
        </h2>

        {sortedIssues.length === 0 ? (
          <div className="section-page__no-issues">
            ✓ No active issues in this section
          </div>
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
                    <span key={a} className="issue-detail__asset">{a}</span>
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
    </div>
  );
}
