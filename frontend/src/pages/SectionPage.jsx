import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SectionIcon } from "../components/Icons";
import { useSecurityData } from "../hooks/useSecurityData";
import "./SectionPage.css";

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

/* Human-friendly labels */
const STATUS_HUMAN = {
  ok:       { emoji: "✓", headline: "All Protected",     sub: "Everything is working correctly",       color: "#22c55e", dim: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.22)"  },
  warning:  { emoji: "!", headline: "Needs Attention",   sub: "Some issues require your action",       color: "#f59e0b", dim: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.22)" },
  critical: { emoji: "!", headline: "Urgent — Act Now",  sub: "Critical issues detected on your system", color: "#ef4444", dim: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.22)"  },
};

const SEV_HUMAN = {
  critical: { label: "Urgent",    color: "#ef4444", bg: "rgba(239,68,68,0.12)",  text: "#fca5a5", desc: "Needs immediate attention" },
  high:     { label: "Important", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", text: "#fde68a", desc: "Needs attention soon"       },
  medium:   { label: "Review",    color: "#6366f1", bg: "rgba(99,102,241,0.12)", text: "#c7d2fe", desc: "Should be reviewed"        },
  low:      { label: "Info",      color: "#0ea5e9", bg: "rgba(14,165,233,0.12)", text: "#bae6fd", desc: "For your information"     },
};

/* ── Icon helpers ──────────────────────────────────────────────────────── */
const IcoChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
);
const IcoChevronDown = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.22s" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IcoArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);
const IcoOk = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const IcoWarn = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);
const IcoSliders = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="8" cy="6" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><circle cx="10" cy="18" r="2" fill="currentColor"/></svg>
);

/* ── OS icons ──────────────────────────────────────────────────────────── */
const OsWindows = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.549H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.851"/>
  </svg>
);
const OsMac = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
  </svg>
);
const OsLinux = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1C8.5 1 7 4 7 6c0 1.5.5 3 1 4-.8 1.3-2 3-2 5 0 2.5 1.5 4 3 4.5-.3.5-.5 1-.5 1.5 0 1.4 1.1 2 2.5 2s2.5-.6 2.5-2c0-.5-.2-1-.5-1.5 1.5-.5 3-2 3-4.5 0-2-1.2-3.7-2-5 .5-1 1-2.5 1-4 0-2-1.5-5-5-5zm0 2c2 0 3 2 3 3 0 1-.3 2-.8 3-.4-.8-1.3-1.5-2.2-1.5s-1.8.7-2.2 1.5C9.3 8 9 7 9 6c0-1 1-3 3-3z"/>
  </svg>
);

const OS_ICONS = { windows: OsWindows, mac: OsMac, linux: OsLinux };
const OS_COLORS = { windows: "#60a5fa", mac: "#a3a3a3", linux: "#facc15" };

/* ── Devices section ───────────────────────────────────────────────────── */
function DevicesSection({ devices, onGoToIntegrations }) {
  const [query, setQuery]   = useState("");
  const [tab,   setTab]     = useState("endpoints"); // "endpoints" | "non-deployed"

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q
      ? devices.filter((d) => d.name.toLowerCase().includes(q) || d.ip.includes(q))
      : devices;
  }, [devices, query]);

  const active   = devices.filter((d) => d.status === "ok").length;
  const faulty   = devices.filter((d) => d.status === "faulty").length;
  const inactive = devices.filter((d) => d.status === "inactive").length;

  return (
    <div className="sp-section sp-devices">
      {/* Header */}
      <div className="sp-devices__head">
        <div className="sp-section__title" style={{ margin: 0 }}>Managed Devices</div>
        <div className="sp-devices__stats">
          <span className="sp-dev-pill sp-dev-pill--ok">{active} Active</span>
          {faulty > 0 && <span className="sp-dev-pill sp-dev-pill--fail">{faulty} Faulty</span>}
          <span className="sp-dev-pill sp-dev-pill--off">{inactive} Inactive</span>
        </div>
      </div>

      {/* Tabs */}
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
          {/* Search */}
          <div className="sp-devices__search-wrap">
            <svg className="sp-devices__search-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="sp-devices__search"
              placeholder="Search by name or IP…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="sp-devices__search-clear" onClick={() => setQuery("")}>✕</button>
            )}
          </div>

          {/* Table */}
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
                  const OsIcon  = OS_ICONS[dev.os]  ?? OsLinux;
                  const osColor = OS_COLORS[dev.os] ?? "#64748b";
                  const isOk    = dev.status === "ok";
                  return (
                    <div key={dev.id} className="sp-dev-row">
                      <span className="sp-dev-row__name">{dev.name}</span>
                      <span className="sp-dev-row__ip">{dev.ip}</span>
                      <span className="sp-dev-row__os" style={{ color: osColor }}><OsIcon /></span>
                      <span className="sp-dev-row__group">{dev.group}</span>
                      <span className="sp-dev-row__seen">{dev.lastSeen}</span>
                      <span className={`sp-dev-row__status ${isOk ? "sp-dev-row__status--ok" : "sp-dev-row__status--off"}`}>
                        <span className="sp-dev-row__dot" />
                        {isOk ? "OK" : "Inactive"}
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
        /* Non-deployed empty state */
        <div className="sp-nondeployed">
          <div className="sp-nondeployed__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="sp-nondeployed__title">No Directory Integration Connected</div>
          <div className="sp-nondeployed__desc">
            No connection to Microsoft Entra ID (Azure AD) or local Active Directory has been detected in your environment. Connect a directory to automatically discover unprotected devices.
          </div>
          <button className="sp-nondeployed__btn" onClick={onGoToIntegrations}>
            Go to Integrations
            <IcoArrow />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Mini SVG bar chart ────────────────────────────────────────────────── */
function BarChart({ data, color }) {
  if (!data?.length) return null;
  const BAR_W = 36, GAP = 10, H = 100;
  const total = data.length * BAR_W + (data.length - 1) * GAP;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <svg width={total} height={H + 22} viewBox={`0 0 ${total} ${H + 22}`}>
      {data.map((d, i) => {
        const bh = Math.max(3, (d.value / max) * H);
        const x = i * (BAR_W + GAP);
        return (
          <g key={i}>
            <rect x={x} y={H - bh} width={BAR_W} height={bh} rx={4} fill={color} opacity={d.value === max ? 1 : 0.35}/>
            <text x={x + BAR_W / 2} y={H + 16} textAnchor="middle" fontSize={10} fill="#475569">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Main component
════════════════════════════════════════════════════════════════════════ */
export default function SectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useSecurityData();
  const [showDetails, setShowDetails] = useState(false);

  if (loading) return <div className="sp-center">Loading…</div>;
  if (error)   return <div className="sp-center sp-center--err">Error: {error}</div>;

  const section = data?.sections.find((s) => s.id === id);
  if (!section) return (
    <div className="sp-center">
      Section not found.
      <button onClick={() => navigate("/")}>← Back</button>
    </div>
  );

  const st = STATUS_HUMAN[section.status] ?? STATUS_HUMAN.ok;
  const sortedIssues = [...(section.issues || [])].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  );
  const modulesOk    = section.subModules?.filter((m) => m.ok).length ?? 0;
  const modulesTotal = section.subModules?.length ?? 0;
  const primaryCount =
    section.activeEndpoints ?? section.activeUsers ?? section.activeAssets;
  const primaryLabel =
    section.activeEndpoints != null ? "computers monitored" :
    section.activeUsers     != null ? "users monitored"     : "assets monitored";

  return (
    <div className="sp">

      {/* ── Back ───────────────────────────────────────────────────── */}
      <button className="sp-back" onClick={() => navigate("/")}>
        <IcoChevronLeft /> Overview
      </button>

      {/* ── STATUS CARD ────────────────────────────────────────────── */}
      <div
        className="sp-status"
        style={{
          "--st-color":  st.color,
          "--st-dim":    st.dim,
          "--st-border": st.border,
        }}
      >
        {/* Icon + name */}
        <div className="sp-status__icon">
          <SectionIcon id={section.id} size={30} color={st.color} />
        </div>
        <div className="sp-status__meta">
          <div className="sp-status__name">{section.label}</div>
          {primaryCount != null && (
            <div className="sp-status__count">{primaryCount} {primaryLabel}</div>
          )}
        </div>

        {/* Big status */}
        <div className="sp-status__center">
          <div className="sp-status__emoji">{st.emoji}</div>
          <div className="sp-status__headline">{st.headline}</div>
          <div className="sp-status__sub">{st.sub}</div>
        </div>

        {/* Score ring (subtle) */}
        <div className="sp-status__score-wrap">
          <svg width="90" height="90" viewBox="0 0 90 90" className="sp-status__ring">
            <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
            <circle
              cx="45" cy="45" r="36"
              fill="none"
              stroke={st.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - section.score / 100)}`}
              transform="rotate(-90 45 45)"
              opacity="0.85"
            />
          </svg>
          <div className="sp-status__score-val" style={{ color: st.color }}>
            {section.score}%
          </div>
        </div>
      </div>

      {/* ── ISSUES ─────────────────────────────────────────────────── */}
      {sortedIssues.length > 0 ? (
        <div className="sp-section">
          <div className="sp-section__title sp-section__title--warn">
            <span className="sp-section__dot sp-section__dot--pulse" />
            {sortedIssues.length === 1 ? "1 Issue Requires Your Attention" : `${sortedIssues.length} Issues Require Your Attention`}
          </div>

          <div className="sp-issues">
            {sortedIssues.map((issue) => {
              const sc = SEV_HUMAN[issue.severity] ?? SEV_HUMAN.low;
              return (
                <div
                  key={issue.id}
                  className="sp-issue"
                  style={{ "--ic": sc.color }}
                  onClick={() => navigate(issue.route)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(issue.route)}
                >
                  <div className="sp-issue__badge" style={{ background: sc.bg, color: sc.text }}>
                    {sc.label}
                  </div>
                  <h3 className="sp-issue__title">{issue.title}</h3>
                  <p className="sp-issue__desc">{issue.description}</p>
                  <div className="sp-issue__footer">
                    <div className="sp-issue__assets">
                      {issue.affectedAssets?.map((a) => (
                        <span key={a} className="sp-issue__asset">{a}</span>
                      ))}
                    </div>
                    <button className="sp-issue__btn">
                      View Details <IcoArrow />
                    </button>
                  </div>
                  <div className="sp-issue__time">
                    Detected {new Date(issue.detectedAt).toLocaleDateString(undefined, { day:"numeric", month:"short", year:"numeric" })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* All clear */
        <div className="sp-allclear">
          <span className="sp-allclear__check"><IcoOk /></span>
          <div>
            <div className="sp-allclear__headline">You're fully protected!</div>
            <div className="sp-allclear__sub">No issues found in this area</div>
          </div>
        </div>
      )}

      {/* ── PROTECTION AREAS ───────────────────────────────────────── */}
      {section.subModules?.length > 0 && (
        <div className="sp-section">
          <div className="sp-section__title">
            Protection Areas
            <span className="sp-section__badge">
              {modulesOk}/{modulesTotal} active
            </span>
          </div>
          <div className="sp-areas">
            {section.subModules.map((mod) => (
              <div key={mod.name} className={`sp-area ${mod.ok ? "sp-area--ok" : "sp-area--fail"}`}>
                <span className="sp-area__icon">
                  {mod.ok ? <IcoOk /> : <IcoWarn />}
                </span>
                <span className="sp-area__name">{mod.name}</span>
                <span className="sp-area__status">{mod.ok ? "Active" : "Issue"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TECHNICAL DETAILS TOGGLE ────────────────────────────────── */}
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

              {/* Protected categories */}
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
                        {cat.open > 0 && (
                          <span className="sp-cat__open">{cat.open} open</span>
                        )}
                        {cat.closed > 0 && (
                          <span className="sp-cat__closed">{cat.closed} closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Charts */}
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

      {/* ── MANAGED DEVICES ─────────────────────────────────────────── */}
      {section.devices?.length > 0 && (
        <DevicesSection
          devices={section.devices}
          onGoToIntegrations={() => navigate("/settings")}
        />
      )}
    </div>
  );
}
