import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./SecurityRing.css";

// ─── STATUS CONFIG ───────────────────────────────────────────────────────────
const STATUS = {
  ok:       { color: "#22c55e", glow: "rgba(34,197,94,0.45)",   label: "Secure"   },
  warning:  { color: "#f59e0b", glow: "rgba(245,158,11,0.45)",  label: "Warning"  },
  critical: { color: "#ef4444", glow: "rgba(239,68,68,0.55)",   label: "Critical" },
};

// ─── GEOMETRY HELPERS ────────────────────────────────────────────────────────
const CX = 260, CY = 260;          // SVG centre
const OUTER_R = 220;               // arc outer radius
const INNER_R = 130;               // arc inner radius (donut hole)
const GAP_DEG = 3;                 // gap between segments in degrees

function polarToXY(angle, r) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function buildArcPath(startDeg, endDeg, outerR, innerR) {
  const gapped_start = startDeg + GAP_DEG / 2;
  const gapped_end   = endDeg   - GAP_DEG / 2;
  const largeArc     = gapped_end - gapped_start > 180 ? 1 : 0;

  const o1 = polarToXY(gapped_start, outerR);
  const o2 = polarToXY(gapped_end,   outerR);
  const i1 = polarToXY(gapped_end,   innerR);
  const i2 = polarToXY(gapped_start, innerR);

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${i2.x} ${i2.y}`,
    "Z",
  ].join(" ");
}

function labelPosition(startDeg, endDeg) {
  const mid  = (startDeg + endDeg) / 2;
  const r    = (OUTER_R + INNER_R) / 2 + 20;
  return polarToXY(mid, r);
}

function iconPosition(startDeg, endDeg) {
  const mid = (startDeg + endDeg) / 2;
  const r   = (OUTER_R + INNER_R) / 2;
  return polarToXY(mid, r);
}

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
function Tooltip({ section, x, y, svgWidth }) {
  if (!section) return null;
  const cfg  = STATUS[section.status];
  const hasIssues = section.issues?.length > 0;

  // clamp so tooltip doesn't overflow SVG left/right
  const clampedX = Math.min(Math.max(x, 80), svgWidth - 80);

  return (
    <foreignObject
      x={clampedX - 130}
      y={y - 10}
      width={260}
      height={hasIssues ? 180 : 100}
      style={{ overflow: "visible", pointerEvents: "none" }}
    >
      <div className="ring-tooltip" xmlns="http://www.w3.org/1999/xhtml">
        <div className="ring-tooltip__header" style={{ borderColor: cfg.color }}>
          <span className="ring-tooltip__icon">{section.icon}</span>
          <span className="ring-tooltip__title">{section.label}</span>
          <span className="ring-tooltip__badge" style={{ background: cfg.color }}>
            {cfg.label}
          </span>
        </div>
        <div className="ring-tooltip__score">
          Health: <strong>{section.score}%</strong>
        </div>
        {hasIssues && (
          <div className="ring-tooltip__issues">
            {section.issues.slice(0, 2).map((issue) => (
              <div key={issue.id} className="ring-tooltip__issue">
                <span className={`ring-tooltip__sev ring-tooltip__sev--${issue.severity}`}>
                  {issue.severity.toUpperCase()}
                </span>
                <span>{issue.title}</span>
              </div>
            ))}
            {section.issues.length > 2 && (
              <div className="ring-tooltip__more">
                +{section.issues.length - 2} more issues
              </div>
            )}
          </div>
        )}
        <div className="ring-tooltip__hint">Click to view details →</div>
      </div>
    </foreignObject>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function SecurityRing({ sections, overallScore }) {
  const navigate  = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // distribute sections evenly around 360°
  const totalSections = sections.length;
  const degPerSection = 360 / totalSections;

  const scoreColor =
    overallScore >= 80 ? "#22c55e" :
    overallScore >= 50 ? "#f59e0b" :
    "#ef4444";

  function handleMouseEnter(e, section, startDeg, endDeg) {
    setHovered(section);
    const { x, y } = iconPosition(startDeg, endDeg);
    setTooltipPos({ x, y: y - INNER_R * 0.25 });
  }

  function handleMouseLeave() {
    setHovered(null);
  }

  function handleClick(section) {
    navigate(`/section/${section.id}`);
  }

  return (
    <div className="security-ring-wrapper">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CX * 2} ${CY * 2}`}
        className="security-ring-svg"
        aria-label="Security health overview"
      >
        <defs>
          {/* glow filter per status */}
          {Object.entries(STATUS).map(([key, cfg]) => (
            <filter key={key} id={`glow-${key}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <filter id="glow-score" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* drop shadow for center circle */}
          <filter id="centre-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="18" floodColor="#000" floodOpacity="0.7" />
          </filter>

          {/* radial for centre circle */}
          <radialGradient id="centre-grad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>

        {/* segments */}
        {sections.map((section, i) => {
          const startDeg = i * degPerSection;
          const endDeg   = startDeg + degPerSection;
          const path     = buildArcPath(startDeg, endDeg, OUTER_R, INNER_R);
          const cfg      = STATUS[section.status];
          const isHov    = hovered?.id === section.id;
          const lblPos   = labelPosition(startDeg, endDeg);
          const icnPos   = iconPosition(startDeg, endDeg);

          return (
            <g
              key={section.id}
              className={`ring-segment ${isHov ? "ring-segment--hovered" : ""}`}
              onMouseEnter={(e) => handleMouseEnter(e, section, startDeg, endDeg)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(section)}
              style={{ cursor: "pointer" }}
              role="button"
              aria-label={`${section.label}: ${cfg.label}`}
            >
              {/* glow layer */}
              {isHov && (
                <path
                  d={buildArcPath(startDeg, endDeg, OUTER_R + 10, INNER_R - 10)}
                  fill={cfg.color}
                  opacity="0.2"
                  filter={`url(#glow-${section.status})`}
                />
              )}

              {/* main arc */}
              <path
                d={path}
                fill={cfg.color}
                opacity={isHov ? 1 : 0.75}
                stroke="#0f172a"
                strokeWidth="1"
                style={{ transition: "opacity 0.2s, transform 0.2s" }}
              />

              {/* subtle inner highlight */}
              <path
                d={buildArcPath(startDeg, endDeg, OUTER_R - 4, INNER_R + 4)}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />

              {/* icon */}
              <text
                x={icnPos.x}
                y={icnPos.y + 6}
                textAnchor="middle"
                fontSize="22"
                className="ring-segment__icon"
              >
                {section.icon}
              </text>

              {/* label outside ring */}
              <text
                x={lblPos.x}
                y={lblPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="ring-segment__label"
                fill={isHov ? cfg.color : "rgba(203,213,225,0.9)"}
              >
                {section.label}
              </text>

              {/* issue count badge */}
              {section.issues?.length > 0 && (
                <g>
                  <circle
                    cx={icnPos.x + 14}
                    cy={icnPos.y - 12}
                    r={10}
                    fill={cfg.color}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                  <text
                    x={icnPos.x + 14}
                    y={icnPos.y - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#fff"
                    fontWeight="bold"
                  >
                    {section.issues.length}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* centre circle shadow layer */}
        <circle cx={CX} cy={CY} r={INNER_R - 10} fill="#000" opacity="0.6" filter="url(#centre-shadow)" />
        {/* centre circle */}
        <circle cx={CX} cy={CY} r={INNER_R - 10} fill="url(#centre-grad)" />
        <circle
          cx={CX} cy={CY} r={INNER_R - 10}
          fill="none"
          stroke={scoreColor}
          strokeWidth="2"
          opacity="0.5"
          filter="url(#glow-score)"
        />

        {/* score text */}
        <text
          x={CX} y={CY - 12}
          textAnchor="middle"
          dominantBaseline="middle"
          className="ring-score-number"
          fill={scoreColor}
          filter="url(#glow-score)"
        >
          {overallScore}%
        </text>
        <text
          x={CX} y={CY + 22}
          textAnchor="middle"
          dominantBaseline="middle"
          className="ring-score-label"
          fill="rgba(148,163,184,0.9)"
        >
          Security Health
        </text>

        {/* tooltip */}
        {hovered && (
          <Tooltip
            section={hovered}
            x={tooltipPos.x}
            y={tooltipPos.y}
            svgWidth={CX * 2}
          />
        )}
      </svg>
    </div>
  );
}
