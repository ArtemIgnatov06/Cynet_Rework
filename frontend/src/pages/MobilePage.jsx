import { useEffect, useMemo, useState } from "react";
import GenericSectionPage, {
  IcoOk,
  IcoWarn,
  IcoChevronDown,
  IcoSliders,
  BarChart,
} from "./GenericSectionPage";
import "./SectionPage.css";

const API_URL = (import.meta.env.VITE_AGENT_URL || "http://localhost:8000").replace(/\/$/, "");

const OsAndroid = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 9a1 1 0 0 0-1 1v7a3 3 0 0 0 3 3h1v3h2v-3h2v3h2v-3h1a3 3 0 0 0 3-3v-7a1 1 0 0 0-1-1H7zm8.53-4.84 1.3-1.86-.82-.57-1.4 2A6.96 6.96 0 0 0 12 3c-.92 0-1.8.18-2.61.51l-1.4-2-.82.57 1.3 1.86A7 7 0 0 0 5 9h14a7 7 0 0 0-3.47-4.84zM9.5 6.5A.75.75 0 1 1 9.5 5a.75.75 0 0 1 0 1.5zm5 0A.75.75 0 1 1 14.5 5a.75.75 0 0 1 0 1.5z" />
  </svg>
);

const OsIos = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.365 1.43c0 1.14-.465 2.23-1.2 3.02-.79.85-2.08 1.5-3.17 1.41-.14-1.09.38-2.25 1.12-3 .8-.83 2.18-1.43 3.25-1.43zM20.94 17.09c-.47 1.07-.7 1.55-1.3 2.52-.84 1.35-2.03 3.04-3.51 3.05-1.31.01-1.65-.84-3.43-.83-1.78.01-2.15.84-3.46.83-1.48-.01-2.61-1.53-3.45-2.88-2.35-3.77-2.6-8.2-1.15-10.42 1.03-1.58 2.65-2.5 4.18-2.5 1.56 0 2.54.85 3.82.85 1.24 0 2-.86 3.81-.86 1.36 0 2.81.74 3.84 2.02-3.36 1.84-2.82 6.65.65 8.22z" />
  </svg>
);

const OS_ICONS = { android: OsAndroid, ios: OsIos };
const OS_COLORS = { android: "#22c55e", ios: "#a3a3a3" };

function MobileDevicesSection({ devices }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q
      ? devices.filter((d) => d.name.toLowerCase().includes(q) || d.ip.includes(q))
      : devices;
  }, [devices, query]);

  const active = devices.filter((d) => d.status === "ok").length;
  const faulty = devices.filter((d) => d.status === "faulty").length;
  const inactive = devices.filter((d) => d.status === "inactive").length;

  return (
    <div className="sp-section sp-devices">
      <div className="sp-devices__head">
        <div className="sp-section__title" style={{ margin: 0 }}>
          Managed Mobile Devices
        </div>
        <div className="sp-devices__stats">
          <span className="sp-dev-pill sp-dev-pill--ok">{active} Active</span>
          {faulty > 0 && <span className="sp-dev-pill sp-dev-pill--fail">{faulty} Faulty</span>}
          <span className="sp-dev-pill sp-dev-pill--off">{inactive} Inactive</span>
        </div>
      </div>

      <div className="sp-devices__search-wrap">
        <svg
          className="sp-devices__search-ico"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          className="sp-devices__search"
          placeholder="Search by device name or IP…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {query && (
          <button className="sp-devices__search-clear" onClick={() => setQuery("")}>
            ✕
          </button>
        )}
      </div>

      <div className="sp-dev-table">
        <div className="sp-dev-table__head">
          <span>Device</span>
          <span>IP Address</span>
          <span>OS</span>
          <span>Group</span>
          <span>Last Seen</span>
          <span>Status</span>
        </div>

        <div className="sp-dev-table__body">
          {filtered.length === 0 ? (
            <div className="sp-dev-table__empty">No devices match "{query}"</div>
          ) : (
            filtered.map((dev) => {
              const OsIcon = OS_ICONS[dev.os] ?? OsAndroid;
              const osColor = OS_COLORS[dev.os] ?? "#64748b";
              const isOk = dev.status === "ok";
              const isFaulty = dev.status === "faulty";

              return (
                <div key={dev.id} className="sp-dev-row">
                  <span className="sp-dev-row__name">{dev.name}</span>
                  <span className="sp-dev-row__ip">{dev.ip}</span>
                  <span className="sp-dev-row__os" style={{ color: osColor }}>
                    <OsIcon />
                  </span>
                  <span className="sp-dev-row__group">{dev.group}</span>
                  <span className="sp-dev-row__seen">{dev.lastSeen}</span>
                  <span
                    className={`sp-dev-row__status ${
                      isOk ? "sp-dev-row__status--ok" : "sp-dev-row__status--off"
                    }`}
                  >
                    <span className="sp-dev-row__dot" />
                    {isOk ? "OK" : isFaulty ? "Faulty" : "Inactive"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="sp-dev-footer">{filtered.length} of {devices.length} mobile devices</div>
    </div>
  );
}

export default function MobilePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadMobileData = async () => {
      try {
        setError("");
        const response = await fetch(`${API_URL}/api/mobile?mode=manageable&count=6`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        setData(result.mobile);
      } catch (err) {
        setError(err.message || "Failed to load mobile data");
      } finally {
        setLoading(false);
      }
    };

    loadMobileData();
    const id = setInterval(loadMobileData, 10000);
    return () => clearInterval(id);
  }, []);

  if (loading && !data) return <div className="sp-center">Loading…</div>;
  if (error) return <div className="sp-center sp-center--err">Failed to load mobile data: {error}</div>;
  if (!data) return <div className="sp-center">Mobile section not found.</div>;

  const score = data.health_score ?? ((data.devices ?? []).every((d) => d.status === "ok") ? 97 : (data.devices ?? []).some((d) => d.status === "faulty") ? 70 : 84);
  const sectionStatus = score >= 90 ? "ok" : score >= 70 ? "warning" : "critical";

  const sectionObj = {
    id: "mobile",
    label: "Mobile",
    score,
    status: sectionStatus,
    issues: (data.protectedCategories ?? [])
      .filter((cat) => cat.open > 0)
      .map((cat, idx) => ({
        id: `mobile-${idx}`,
        title: `${cat.name} issue`,
        description: `${cat.open} mobile finding${cat.open > 1 ? "s" : ""} require review.`,
        severity: cat.open >= 2 ? "critical" : "medium",
        route: "/section/mobile",
        detectedAt: new Date().toISOString(),
      })),
    subModules: (data.protectedCategories ?? []).map((cat) => ({
      name: cat.name,
      ok: cat.open === 0,
    })),
  };

  return (
    <GenericSectionPage section={sectionObj}>
      {(data.protectedCategories?.length > 0 || data.alertsOverTime) && (
        <div className="sp-details-wrap">
          <button
            className={`sp-details-toggle ${showDetails ? "sp-details-toggle--open" : ""}`}
            onClick={() => setShowDetails((v) => !v)}
          >
            <IcoSliders />
            Technical Details
            <IcoChevronDown open={showDetails} />
          </button>

          {showDetails && (
            <div className="sp-details">
              {data.protectedCategories?.length > 0 && (
                <div className="sp-detail-block">
                  <div className="sp-detail-block__title">Threat Coverage</div>
                  <div className="sp-cats">
                    {data.protectedCategories.map((cat) => (
                      <div key={cat.name} className="sp-cat">
                        <span className={`sp-cat__icon ${cat.open > 0 ? "sp-cat__icon--warn" : ""}`}>
                          {cat.open > 0 ? <IcoWarn /> : <IcoOk />}
                        </span>
                        <span className="sp-cat__name">{cat.name}</span>
                        {cat.open > 0 && <span className="sp-cat__open">{cat.open} open</span>}
                        {cat.closed > 0 && <span className="sp-cat__closed">{cat.closed} closed</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(data.alertsOverTime || data.risksOverTime) && (
                <div className="sp-charts">
                  {data.alertsOverTime && (
                    <div className="sp-chart-card">
                      <div className="sp-chart-card__title">Alerts Over Time</div>
                      <BarChart data={data.alertsOverTime} color="#ef4444" />
                    </div>
                  )}
                  {data.risksOverTime && (
                    <div className="sp-chart-card">
                      <div className="sp-chart-card__title">Risks Over Time</div>
                      <BarChart data={data.risksOverTime} color="#f59e0b" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {data.devices?.length > 0 && <MobileDevicesSection devices={data.devices} />}
    </GenericSectionPage>
  );
}