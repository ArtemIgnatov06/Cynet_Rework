import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IcoChevronLeft } from "./GenericSectionPage";
import "./SectionPage.css";
import "./NetworkPage.css";

function UBARow({ row }) {
  return (
    <div className="sp-dev-row">
      <span className="sp-dev-row__name">{row.name}</span>
      <span>{row.description}</span>
      <span>{row.interval}</span>
      <span>{row.disabled ? "True" : "False"}</span>
      <span>{row.action}</span>
      <span style={{ color: "#ef4444", fontWeight: 600 }}>
        {row.severity}
      </span>
    </div>
  );
}

function IssueCard({ issue }) {
  const color = issue.severity === "critical" ? "#ef4444" : "#f59e0b";

  return (
    <div className="net-incident" style={{ "--ic": color }}>
      <div
        className="net-incident__badge"
        style={{
          background:
            issue.severity === "critical"
              ? "rgba(239,68,68,0.12)"
              : "rgba(245,158,11,0.12)",
          color,
        }}
      >
        {issue.severity}
      </div>
      <div className="net-incident__title">{issue.title}</div>
      <p className="net-incident__desc">{issue.description}</p>
    </div>
  );
}

function AlertsPerUserChart({ data }) {
  const max = Math.max(...data.map((u) => u.alerts), 1);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "18px",
        minHeight: "220px",
        paddingTop: "20px",
      }}
    >
      {data.map((user) => (
        <div
          key={user.name}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "80px",
              height: `${(user.alerts / max) * 160}px`,
              background: "#facc15",
              borderRadius: "10px 10px 0 0",
            }}
          />
          <div style={{ fontWeight: 700 }}>{user.alerts}</div>
          <div
            style={{
              fontSize: "12px",
              textAlign: "center",
              lineHeight: 1.2,
              opacity: 0.8,
            }}
          >
            {user.name}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UsersPage() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUBA, setShowUBA] = useState(true);

  useEffect(() => {
    const loadUsersData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://127.0.0.1:8000/api/users?mode=critical&count=5"
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        setData(result.users);
      } catch (err) {
        setError(err.message || "Failed to load users data");
      } finally {
        setLoading(false);
      }
    };

    loadUsersData();
  }, []);

  if (loading) return <div className="sp-center">Loading users…</div>;
  if (error)
    return (
      <div className="sp-center sp-center--err">
        Failed to load users data: {error}
      </div>
    );

  if (!data) {
    return <div className="sp-center">No users data found.</div>;
  }

  return (
    <div className="sp network-page">
      <button className="sp-back" onClick={() => navigate("/")}>
        <IcoChevronLeft /> Overview
      </button>

      {/* Graph */}
      <section className="section-page__block">
        <h2 className="section-page__block-title">Alerts Per User</h2>
        <AlertsPerUserChart data={data.alerts_per_user} />
      </section>

      {/* Active issues */}
      <section className="section-page__block">
        <h2 className="section-page__block-title">
          Active Issues
          {data.issues?.length > 0 && (
            <span className="section-page__issue-count">
              {data.issues.length}
            </span>
          )}
        </h2>

        <div className="net-incidents">
          {data.issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </section>

      {/* Protection Areas */}
      <section className="section-page__block">
        <h2 className="section-page__block-title">Protection Areas</h2>
        <div className="sp-cats">
          {data.protection_areas.map((cat) => (
            <div key={cat.name} className="sp-cat">
              <span className="sp-cat__name">{cat.name}</span>
              {cat.open > 0 && (
                <span className="sp-cat__open">{cat.open} open</span>
              )}
              {cat.closed > 0 && (
                <span className="sp-cat__closed">{cat.closed} closed</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* UBA */}
      <section className="section-page__block">
        <button
          className={`sp-details-toggle ${
            showUBA ? "sp-details-toggle--open" : ""
          }`}
          onClick={() => setShowUBA((v) => !v)}
        >
          UBA
        </button>

        {showUBA && (
          <div className="sp-dev-table" style={{ marginTop: 16 }}>
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
      </section>
    </div>
  );
}