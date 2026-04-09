import { useEffect, useState } from "react";
import GenericSectionPage from "./GenericSectionPage";
import "./SectionPage.css";
import "./NetworkPage.css";

const API_URL = (import.meta.env.VITE_AGENT_URL || "http://localhost:8000").replace(/\/$/, "");

const SEV_CFG = {
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Critical" },
  warning:  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Warning"  },
  safe:     { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  label: "Safe"     },
};

function EmailCard({ email }) {
  const sev = SEV_CFG[email.severity] ?? SEV_CFG.warning;
  return (
    <div className="net-incident" style={{ "--ic": sev.color }}>
      <div className="net-incident__badge" style={{ background: sev.bg, color: sev.color }}>
        {sev.label}
      </div>
      <div className="net-incident__title">{email.subject}</div>
      <p className="net-incident__desc">{email.reason}</p>
      <div className="net-incident__meta">
        <span className="net-incident__host">{email.sender}</span>
        <span className={`net-incident__status net-incident__status--${email.status}`}>
          {email.status}
        </span>
      </div>
    </div>
  );
}

export default function EmailPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_URL}/api/email?mode=critical&count=3`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message || "Failed to load email data");
      } finally {
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  if (loading && !data) return <div className="sp-center">Loading…</div>;
  if (error) return <div className="sp-center sp-center--err">Failed to load email data: {error}</div>;

  const email = data?.email;
  if (!email) return <div className="sp-center">No email data found.</div>;

  const score = email.attack_level === "green" ? 100 : email.attack_level === "yellow" ? 76 : 42;
  const status = score >= 90 ? "ok" : score >= 70 ? "warning" : "critical";
  const stats = email.stats ?? {};

  const sectionObj = {
    id: "email",
    label: "Email",
    score,
    status,
    issues: (email.blocked_emails ?? [])
      .filter((item) => item.severity !== "safe")
      .map((item, idx) => ({
        id: `email-${idx}`,
        title: item.subject,
        description: `${item.sender} — ${item.reason}`,
        severity: item.severity,
        route: "/section/email",
        detectedAt: new Date().toISOString(),
      })),
  };

  const nonSafeEmails = (email.blocked_emails ?? []).filter((e) => e.severity !== "safe");

  return (
    <GenericSectionPage section={sectionObj}>
      {/* Stats row */}
      {(stats.critical > 0 || stats.warning > 0 || stats.safe > 0) && (
        <div className="net-stats" style={{ marginBottom: 0 }}>
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
      )}

      {/* Email cards */}
      {nonSafeEmails.length > 0 && (
        <div className="sp-section">
          <div className="sp-section__title">Blocked & Quarantined Emails</div>
          <div className="net-incidents">
            {nonSafeEmails.map((item, idx) => (
              <EmailCard key={idx} email={item} />
            ))}
          </div>
        </div>
      )}
    </GenericSectionPage>
  );
}
