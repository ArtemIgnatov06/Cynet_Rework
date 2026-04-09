import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GenericSectionPage, {
  IcoOk,
  IcoWarn,
  IcoArrow,
  IcoChevronDown,
  IcoSliders,
  BarChart,
} from "./GenericSectionPage";
import "./SectionPage.css";

const API_URL = (import.meta.env.VITE_AGENT_URL || "http://localhost:8000").replace(/\/$/, "");

const OsWindows = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.549H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.851" />
  </svg>
);

const OsMac = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
  </svg>
);

const OsLinux = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1C8.5 1 7 4 7 6c0 1.5.5 3 1 4-.8 1.3-2 3-2 5 0 2.5 1.5 4 3 4.5-.3.5-.5 1-.5 1.5 0 1.4 1.1 2 2.5 2s2.5-.6 2.5-2c0-.5-.2-1-.5-1.5 1.5-.5 3-2 3-4.5 0-2-1.2-3.7-2-5 .5-1 1-2.5 1-4 0-2-1.5-5-5-5z" />
  </svg>
);

const OS_ICONS = { windows: OsWindows, mac: OsMac, linux: OsLinux };
const OS_COLORS = { windows: "#60a5fa", mac: "#a3a3a3", linux: "#facc15" };

function DevicesSection({ devices, onGoToIntegrations }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("endpoints");

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
        <div className="sp-section__title" style={{ margin: 0 }}>Managed Devices</div>
        <div className="sp-devices__stats">
          <span className="sp-dev-pill sp-dev-pill--ok">{active} Active</span>
          {faulty > 0 && <span className="sp-dev-pill sp-dev-pill--fail">{faulty} Faulty</span>}
          <span className="sp-dev-pill sp-dev-pill--off">{inactive} Inactive</span>
        </div>
      </div>

      <div className="sp-dev-tabs">
        <button
          className={`sp-dev-tab ${tab === "endpoints" ? "sp-dev-tab--active" : ""}`}
          onClick={() => setTab("endpoints")}
        >
          Endpoints
        </button>
        <button
          className={`sp-dev-tab ${tab === "non-deployed" ? "sp-dev-tab--active" : ""}`}
          onClick={() => setTab("non-deployed")}
        >
          Non-Deployed Endpoints
        </button>
      </div>

      {tab === "endpoints" ? (
        <>
          <div className="sp-devices__search-wrap">
            <input
              className="sp-devices__search"
              placeholder="Search by name or IP…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="sp-dev-table">
            <div className="sp-dev-table__head">
              <span>Endpoint</span>
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
                  const OsIcon = OS_ICONS[dev.os] ?? OsLinux;
                  const osColor = OS_COLORS[dev.os] ?? "#64748b";
                  const isOk = dev.status === "ok";

                  return (
                    <div key={dev.id} className="sp-dev-row">
                      <span className="sp-dev-row__name">{dev.name}</span>
                      <span className="sp-dev-row__ip">{dev.ip}</span>
                      <span className="sp-dev-row__os" style={{ color: osColor }}>
                        <OsIcon />
                      </span>
                      <span className="sp-dev-row__group">{dev.group}</span>
                      <span className="sp-dev-row__seen">{dev.lastSeen}</span>
                      <span className={`sp-dev-row__status ${isOk ? "sp-dev-row__status--ok" : "sp-dev-row__status--off"}`}>
                        <span className="sp-dev-row__dot" />
                        {isOk ? "OK" : dev.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="sp-dev-footer">{filtered.length} of {devices.length} devices</div>
        </>
      ) : (
        <div className="sp-nondeployed">
          <div className="sp-nondeployed__title">No Directory Integration Connected</div>
          <div className="sp-nondeployed__desc">
            No connection to Microsoft Entra ID or local Active Directory has been detected.
          </div>
          <button className="sp-nondeployed__btn" onClick={onGoToIntegrations}>
            Go to Integrations <IcoArrow />
          </button>
        </div>
      )}
    </div>
  );
}

export default function EndpointsPage() {
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadEndpoints = async () => {
      try {
        if (!section) setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/endpoints?mode=manageable&count=6`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        setSection(result.endpoints);
      } catch (err) {
        setError(err.message || "Failed to load endpoints");
      } finally {
        setLoading(false);
      }
    };

    loadEndpoints();
    const id = setInterval(loadEndpoints, 2000);
    return () => clearInterval(id);
  }, [section]);

  if (loading && !section) return <div className="sp-center">Loading…</div>;
  if (error) return <div className="sp-center sp-center--err">Failed to load endpoints: {error}</div>;
  if (!section) return <div className="sp-center">Endpoints not found.</div>;

  const allOk = section.devices?.every((d) => d.status === "ok");
  const hasFaulty = section.devices?.some((d) => d.status === "faulty");
  const score = allOk ? 98 : hasFaulty ? 68 : 82;
  const sectionStatus = score >= 90 ? "ok" : score >= 70 ? "warning" : "critical";

  const sectionObj = {
    id: "endpoints",
    label: "Endpoints",
    score,
    status: sectionStatus,
    activeEndpoints: section.devices?.length ?? 0,
    issues: (section.protectedCategories ?? [])
      .filter((cat) => cat.open > 0)
      .map((cat, idx) => ({
        id: `endpoints-${idx}`,
        title: `${cat.name} exposure detected`,
        description: `${cat.open} open endpoint finding${cat.open > 1 ? "s" : ""}.`,
        severity: cat.open >= 2 ? "critical" : "medium",
        route: "/section/endpoints",
        detectedAt: new Date().toISOString(),
      })),
    subModules: (section.protectedCategories ?? []).map((cat) => ({
      name: cat.name,
      ok: cat.open === 0,
    })),
  };

  return (
    <GenericSectionPage section={sectionObj}>
      {(section.protectedCategories?.length > 0 || section.alertsOverTime) && (
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
              {section.protectedCategories?.length > 0 && (
                <div className="sp-detail-block">
                  <div className="sp-detail-block__title">Threat Coverage</div>
                  <div className="sp-cats">
                    {section.protectedCategories.map((cat) => (
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

              {(section.alertsOverTime || section.risksOverTime) && (
                <div className="sp-charts">
                  {section.alertsOverTime && (
                    <div className="sp-chart-card">
                      <div className="sp-chart-card__title">Alerts Over Time</div>
                      <BarChart data={section.alertsOverTime} color="#ef4444" />
                    </div>
                  )}

                  {section.risksOverTime && (
                    <div className="sp-chart-card">
                      <div className="sp-chart-card__title">Risks Over Time</div>
                      <BarChart data={section.risksOverTime} color="#f59e0b" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {section.devices?.length > 0 && (
        <DevicesSection
          devices={section.devices}
          onGoToIntegrations={() => navigate("/settings")}
        />
      )}
    </GenericSectionPage>
  );
}