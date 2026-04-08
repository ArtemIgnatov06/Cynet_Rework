/**
 * GenericSectionPage — shared layout for all section detail pages.
 * Import this in each section-specific page and pass the section data.
 */
import { useNavigate } from "react-router-dom";
import { SectionIcon } from "../components/Icons";
import "./SectionPage.css";

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export const STATUS_HUMAN = {
  ok:       { emoji: "✓", headline: "All Protected",      sub: "Everything is working correctly",         color: "#22c55e", dim: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.22)"  },
  warning:  { emoji: "!", headline: "Needs Attention",    sub: "Some issues require your action",         color: "#f59e0b", dim: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.22)" },
  critical: { emoji: "!", headline: "Urgent — Act Now",   sub: "Critical issues detected on your system", color: "#ef4444", dim: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.22)"  },
};

export const SEV_CFG = {
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  text: "#fca5a5" },
  high:     { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", text: "#fde68a" },
  medium:   { color: "#6366f1", bg: "rgba(99,102,241,0.12)", text: "#c7d2fe" },
  low:      { color: "#0ea5e9", bg: "rgba(14,165,233,0.12)", text: "#bae6fd" },
};

/* ── Shared icons ──────────────────────────────────────────────────────── */
export const IcoChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
);
export const IcoChevronDown = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.22s" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
export const IcoArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);
export const IcoOk = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
);
export const IcoWarn = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);
export const IcoSliders = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="8" cy="6" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><circle cx="10" cy="18" r="2" fill="currentColor"/></svg>
);

/* ── Mini bar chart ────────────────────────────────────────────────────── */
export function BarChart({ data, color }) {
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

/* ── Status hero card ──────────────────────────────────────────────────── */
export function StatusCard({ section, primaryCount, primaryLabel }) {
  const st = STATUS_HUMAN[section.status] ?? STATUS_HUMAN.ok;
  return (
    <div className="sp-status" style={{ "--st-color": st.color, "--st-dim": st.dim, "--st-border": st.border }}>
      <div className="sp-status__icon">
        <SectionIcon id={section.id} size={30} color={st.color} />
      </div>
      <div className="sp-status__meta">
        <div className="sp-status__name">{section.label}</div>
        {primaryCount != null && (
          <div className="sp-status__count">{primaryCount} {primaryLabel}</div>
        )}
      </div>
      <div className="sp-status__center">
        <div className="sp-status__emoji">{st.emoji}</div>
        <div className="sp-status__headline">{st.headline}</div>
        <div className="sp-status__sub">{st.sub}</div>
      </div>
      <div className="sp-status__score-wrap">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
          <circle cx="45" cy="45" r="36" fill="none" stroke={st.color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 36}`}
            strokeDashoffset={`${2 * Math.PI * 36 * (1 - section.score / 100)}`}
            transform="rotate(-90 45 45)" opacity="0.85"
          />
        </svg>
        <div className="sp-status__score-val" style={{ color: st.color }}>{section.score}%</div>
      </div>
    </div>
  );
}

/* ── Issues list ───────────────────────────────────────────────────────── */
export function IssuesList({ issues }) {
  const navigate = useNavigate();
  const sorted = [...issues].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  );

  if (sorted.length === 0) {
    return (
      <div className="sp-allclear">
        <span className="sp-allclear__check"><IcoOk /></span>
        <div>
          <div className="sp-allclear__headline">You're fully protected!</div>
          <div className="sp-allclear__sub">No issues found in this area</div>
        </div>
      </div>
    );
  }

  return (
    <div className="sp-section">
      <div className="sp-section__title sp-section__title--warn">
        <span className="sp-section__dot sp-section__dot--pulse" />
        {sorted.length === 1 ? "1 Issue Requires Your Attention" : `${sorted.length} Issues Require Your Attention`}
      </div>
      <div className="sp-issues">
        {sorted.map((issue) => {
          const sc = SEV_CFG[issue.severity] ?? SEV_CFG.low;
          return (
            <div key={issue.id} className="sp-issue" style={{ "--ic": sc.color }}
              onClick={() => navigate(issue.route)} role="button" tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(issue.route)}
            >
              <div className="sp-issue__badge" style={{ background: sc.bg, color: sc.text }}>{issue.severity}</div>
              <h3 className="sp-issue__title">{issue.title}</h3>
              <p className="sp-issue__desc">{issue.description}</p>
              <div className="sp-issue__footer">
                <div className="sp-issue__assets">
                  {issue.affectedAssets?.map((a) => <span key={a} className="sp-issue__asset">{a}</span>)}
                </div>
                <button className="sp-issue__btn">View Details <IcoArrow /></button>
              </div>
              <div className="sp-issue__time">
                Detected {new Date(issue.detectedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Protection areas ──────────────────────────────────────────────────── */
export function ProtectionAreas({ subModules }) {
  if (!subModules?.length) return null;
  const ok = subModules.filter((m) => m.ok).length;
  return (
    <div className="sp-section">
      <div className="sp-section__title">
        Protection Areas
        <span className="sp-section__badge">{ok}/{subModules.length} active</span>
      </div>
      <div className="sp-areas">
        {subModules.map((mod) => (
          <div key={mod.name} className={`sp-area ${mod.ok ? "sp-area--ok" : "sp-area--fail"}`}>
            <span className="sp-area__icon">{mod.ok ? <IcoOk /> : <IcoWarn />}</span>
            <span className="sp-area__name">{mod.name}</span>
            <span className="sp-area__status">{mod.ok ? "Active" : "Issue"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Generic full-page layout ──────────────────────────────────────────── */
export default function GenericSectionPage({ section, children }) {
  const navigate = useNavigate();
  const primaryCount = section.activeEndpoints ?? section.activeUsers ?? section.activeAssets;
  const primaryLabel =
    section.activeEndpoints != null ? "computers monitored" :
    section.activeUsers     != null ? "users monitored"     : "assets monitored";

  return (
    <div className="sp">
      <button className="sp-back" onClick={() => navigate("/")}>
        <IcoChevronLeft /> Overview
      </button>

      <StatusCard section={section} primaryCount={primaryCount} primaryLabel={primaryLabel} />

      <IssuesList issues={section.issues ?? []} />

      <ProtectionAreas subModules={section.subModules} />

      {/* Section-specific content injected here */}
      {children}
    </div>
  );
}
