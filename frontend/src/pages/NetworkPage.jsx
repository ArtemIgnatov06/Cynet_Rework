import { useNavigate } from "react-router-dom";
import { useNetworkData } from "../hooks/useNetworkData";
import { IcoChevronLeft } from "./GenericSectionPage";
import "./NetworkPage.css";
import "./SectionPage.css";
import NetworkTopologyGraph from "../components/NetworkTopologyGraph";

/* ── Severity config ────────────────────────────────────────────────────────── */
const SEV_CFG = {
  critical:   { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  label: "Critical"  },
  warning:    { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Warning"   },
  safe:       { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  label: "Safe"      },
};

const LEVEL_CFG = {
  red:    { color: "#ef4444", dim: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.22)",  headline: "Under Attack",      sub: "Critical threats detected on your network" },
  yellow: { color: "#f59e0b", dim: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.22)", headline: "Needs Attention",   sub: "Some network anomalies require review"     },
  green:  { color: "#22c55e", dim: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.22)",  headline: "All Clear",         sub: "Network traffic is within normal baseline" },
};

/* ── Incident card ──────────────────────────────────────────────────────────── */
function IncidentCard({ incident }) {
  const sev = SEV_CFG[incident.severity] ?? SEV_CFG.warning;
  return (
    <div className="net-incident" style={{ "--ic": sev.color }}>
      <div className="net-incident__badge" style={{ background: sev.bg, color: sev.color }}>
        {sev.label}
      </div>
      <div className="net-incident__title">{incident.title}</div>
      <p className="net-incident__desc">{incident.description}</p>
      <div className="net-incident__meta">
        <span className="net-incident__host">{incident.affected_host}</span>
        <span className="net-incident__subnet">{incident.affected_subnet}</span>
        <span className={`net-incident__status net-incident__status--${incident.status}`}>
          {incident.status}
        </span>
        <span className="net-incident__time">{incident.detected_at}</span>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────────── */
export default function NetworkPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useNetworkData("critical", 3);

  if (loading) return <div className="sp-center">Loading…</div>;
  if (error)   return <div className="sp-center sp-center--err">Failed to load network data: {error}</div>;

  const net  = data?.network;
  const lvl  = LEVEL_CFG[net?.attack_level] ?? LEVEL_CFG.green;
  const stats = net?.stats ?? {};

  return (
    <div className="sp network-page">
      <button className="sp-back" onClick={() => navigate("/")}>
        <IcoChevronLeft /> Overview
      </button>

      {/* ── Status card ── */}
      <div className="sp-status" style={{ "--st-color": lvl.color, "--st-dim": lvl.dim, "--st-border": lvl.border }}>
        <div className="sp-status__meta">
          <div className="sp-status__name">Network</div>
          <div className="sp-status__count">{Object.values(net?.topology?.endpoints ?? []).reduce((s, g) => s + g.children.length, 0)} hosts monitored</div>
        </div>
        <div className="sp-status__center">
          <div className="sp-status__emoji">{net?.attack_level === "green" ? "✓" : "!"}</div>
          <div className="sp-status__headline">{lvl.headline}</div>
          <div className="sp-status__sub">{lvl.sub}</div>
        </div>
        <div className="sp-status__score-wrap">
          <svg width="90" height="90" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
            <circle cx="45" cy="45" r="36" fill="none" stroke={lvl.color} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - net.health_score / 100)}`}
              transform="rotate(-90 45 45)" opacity="0.85"
            />
          </svg>
          <div className="sp-status__score-val" style={{ color: lvl.color }}>{net.health_score}%</div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="net-stats">
        {stats.critical > 0 && <div className="net-stat net-stat--critical"><span>{stats.critical}</span> Critical</div>}
        {stats.warning  > 0 && <div className="net-stat net-stat--warning"><span>{stats.warning}</span> Warning</div>}
        {stats.safe     > 0 && <div className="net-stat net-stat--safe"><span>{stats.safe}</span> Safe</div>}
      </div>

      {/* ── Topology map ── */}
      <section className="section-page__block network-map-block">
        <h2 className="section-page__block-title">Network Map</h2>
        <NetworkTopologyGraph topology={net?.topology} />
        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <button className="network-map-block__view-btn" onClick={() => navigate("/system")}>
            View system
          </button>
        </div>
      </section>

      {/* ── Incidents ── */}
      <section className="section-page__block">
        <h2 className="section-page__block-title">
          Active Incidents
          {net?.incidents?.length > 0 && (
            <span className="section-page__issue-count">{net.incidents.length}</span>
          )}
        </h2>

        {!net?.incidents?.length ? (
          <div className="section-page__no-issues">✓ No active incidents</div>
        ) : (
          <div className="net-incidents">
            {net.incidents.map((inc) => <IncidentCard key={inc.id} incident={inc} />)}
          </div>
        )}
      </section>
    </div>
  );
}
