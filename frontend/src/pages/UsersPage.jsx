import { useEffect, useState } from "react";
import GenericSectionPage, {
  IcoChevronDown,
  IcoSliders,
} from "./GenericSectionPage";
import "./SectionPage.css";
import "./NetworkPage.css";

const API_URL = (import.meta.env.VITE_AGENT_URL || "http://localhost:8000").replace(/\/$/, "");

function AlertsPerUserChart({ data }) {
  const max = Math.max(...data.map((u) => u.alerts), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "18px", minHeight: "180px", paddingTop: "16px" }}>
      {data.map((user) => (
        <div key={user.name} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "100%",
            maxWidth: "72px",
            height: `${Math.max((user.alerts / max) * 140, user.alerts > 0 ? 8 : 3)}px`,
            background: user.alerts === 0 ? "rgba(100,116,139,0.25)" : user.alerts >= 6 ? "#ef4444" : "#f59e0b",
            borderRadius: "8px 8px 0 0",
            transition: "height 0.3s ease",
          }} />
          <div style={{ fontWeight: 700, fontSize: "15px" }}>{user.alerts}</div>
          <div style={{ fontSize: "11px", textAlign: "center", lineHeight: 1.3, opacity: 0.7 }}>
            {user.name}
          </div>
        </div>
      ))}
    </div>
  );
}

function UBARow({ row }) {
  return (
    <div className="sp-dev-row">
      <span className="sp-dev-row__name">{row.name}</span>
      <span>{row.description}</span>
      <span>{row.interval}</span>
      <span>{row.disabled ? "True" : "False"}</span>
      <span>{row.action}</span>
      <span style={{ color: "#ef4444", fontWeight: 600 }}>{row.severity}</span>
    </div>
  );
}

export default function UsersPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUBA, setShowUBA] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_URL}/api/users?mode=critical&count=5`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        setData(result.users);
      } catch (err) {
        setError(err.message || "Failed to load users data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="sp-center">Loading users…</div>;
  if (error) return <div className="sp-center sp-center--err">Failed to load users data: {error}</div>;
  if (!data) return <div className="sp-center">No users data found.</div>;

  const hasIssues = data.issues?.length > 0;
  const hasCritical = data.issues?.some((i) => i.severity === "critical");
  const score = !hasIssues ? 100 : hasCritical ? 63 : 80;
  const status = score >= 90 ? "ok" : score >= 70 ? "warning" : "critical";

  const section = {
    id: "users",
    label: "Users",
    score,
    status,
    activeUsers: data.alerts_per_user?.length ?? 0,
    issues: (data.issues ?? []).map((i) => ({
      ...i,
      route: "/section/users",
      detectedAt: new Date().toISOString(),
    })),
    subModules: (data.protection_areas ?? []).map((p) => ({
      name: p.name,
      ok: p.open === 0,
    })),
  };

  return (
    <GenericSectionPage section={section}>
      {/* Alerts Per User */}
      <div className="sp-details-wrap">
        <div className="sp-section" style={{ marginTop: 0 }}>
          <div className="sp-section__title">Alerts Per User</div>
          <AlertsPerUserChart data={data.alerts_per_user ?? []} />
        </div>
      </div>

      {/* UBA toggle */}
      {data.uba?.length > 0 && (
        <div className="sp-details-wrap">
          <button
            className={`sp-details-toggle ${showUBA ? "sp-details-toggle--open" : ""}`}
            onClick={() => setShowUBA((v) => !v)}
          >
            <IcoSliders />
            User Behaviour Analytics (UBA)
            <IcoChevronDown open={showUBA} />
          </button>

          {showUBA && (
            <div className="sp-dev-table" style={{ marginTop: 12 }}>
              <div className="sp-dev-table__head">
                <span>Name</span>
                <span>Description</span>
                <span>Interval</span>
                <span>Disabled</span>
                <span>Action</span>
                <span>Severity</span>
              </div>
              <div className="sp-dev-table__body">
                {data.uba.map((row) => (
                  <UBARow key={row.name} row={row} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </GenericSectionPage>
  );
}
