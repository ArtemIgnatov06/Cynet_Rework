import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IcoChevronLeft } from "./GenericSectionPage";
import "./SectionPage.css";
import "./NetworkPage.css";

const SEV_CFG = {
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Critical" },
  warning: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Warning" },
  safe: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", label: "Safe" },
};

const LEVEL_CFG = {
  red: {
    color: "#ef4444",
    dim: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.22)",
    headline: "Email Under Attack",
    sub: "Critical email threats detected",
  },
  yellow: {
    color: "#f59e0b",
    dim: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.22)",
    headline: "Needs Attention",
    sub: "Some suspicious email activity requires review",
  },
  green: {
    color: "#22c55e",
    dim: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.22)",
    headline: "All Clear",
    sub: "No dangerous email activity detected",
  },
};

function EmailCard({ email }) {
  const sev = SEV_CFG[email.severity] ?? SEV_CFG.warning;

  return (
    <div className="net-incident" style={{ "--ic": sev.color }}>
      <div
        className="net-incident__badge"
        style={{ background: sev.bg, color: sev.color }}
      >
        {sev.label}
      </div>

      <div className="net-incident__title">{email.subject}</div>
      <p className="net-incident__desc">{email.reason}</p>

      <div className="net-incident__meta">
        <span className="net-incident__host">{email.sender}</span>
        <span className={`net-incident__status net-incident__status--${email.status}`}>
          {email.status}
        </span>
        <span className="net-incident__time">{email.time}</span>
      </div>
    </div>
  );
}

export default function EmailPage() {
  const navigate = useNavigate();

  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isConnected) return;

    const loadEmailData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("http://127.0.0.1:8000/api/email?mode=critical&count=3");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message || "Failed to load email data");
      } finally {
        setLoading(false);
      }
    };

    loadEmailData();
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="sp network-page">
        <button className="sp-back" onClick={() => navigate("/")}>
          <IcoChevronLeft /> Overview
        </button>

        <section
          className="section-page__block"
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h2 className="section-page__block-title" style={{ marginBottom: 12 }}>
              Email Protection
            </h2>
            <p style={{ opacity: 0.75, marginBottom: 20 }}>
              Connect Office 365 to inspect blocked and suspicious emails
            </p>
            <button
              className="network-map-block__view-btn"
              onClick={() => setIsConnected(true)}
            >
              Connect Office 365
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (loading) return <div className="sp-center">Connecting to Office 365…</div>;
  if (error) return <div className="sp-center sp-center--err">Failed to load email data: {error}</div>;

  const email = data?.email;
  if (!email) return <div className="sp-center">No email data found.</div>;

  const lvl = LEVEL_CFG[email.attack_level] ?? LEVEL_CFG.green;
  const stats = email.stats ?? {};

  return (
    <div className="sp network-page">
      <button className="sp-back" onClick={() => navigate("/")}>
        <IcoChevronLeft /> Overview
      </button>

      <div
        className="sp-status"
        style={{
          "--st-color": lvl.color,
          "--st-dim": lvl.dim,
          "--st-border": lvl.border,
        }}
      >
        <div className="sp-status__meta">
          <div className="sp-status__name">Email</div>
          <div className="sp-status__count">
            {email.blocked_emails?.length ?? 0} recent emails reviewed
          </div>
        </div>

        <div className="sp-status__center">
          <div className="sp-status__emoji">{email.attack_level === "green" ? "✓" : "!"}</div>
          <div className="sp-status__headline">{lvl.headline}</div>
          <div className="sp-status__sub">{lvl.sub}</div>
        </div>

        <div className="sp-status__score-wrap">
          <div
            className="sp-status__score-val"
            style={{ color: lvl.color, position: "static", transform: "none" }}
          >
            {email.connection?.provider || "office365"}
          </div>
        </div>
      </div>

      <div className="net-stats">
        {stats.critical > 0 && (
          <div className="net-stat net-stat--critical">
            <span>{stats.critical}</span> Critical
          </div>
        )}
        {stats.warning > 0 && (
          <div className="net-stat net-stat--warning">
            <span>{stats.warning}</span> Warning
          </div>
        )}
        {stats.safe > 0 && (
          <div className="net-stat net-stat--safe">
            <span>{stats.safe}</span> Safe
          </div>
        )}
      </div>

      <section className="section-page__block">
        <h2 className="section-page__block-title">
          Blocked Emails
          {email.blocked_emails?.length > 0 && (
            <span className="section-page__issue-count">{email.blocked_emails.length}</span>
          )}
        </h2>

        {!email.blocked_emails?.length ? (
          <div className="section-page__no-issues">✓ No active email threats</div>
        ) : (
          <div className="net-incidents">
            {email.blocked_emails.map((item) => (
              <EmailCard key={item.id} email={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}