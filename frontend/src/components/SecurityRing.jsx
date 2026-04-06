import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SectionIcon, SectionIconSVG } from "./Icons";
import "./SecurityRing.css";

// ─── STATUS CONFIG ───────────────────────────────────────────────────────────
const STATUS = {
  ok: { color: "#22c55e", glow: "rgba(34,197,94,0.45)", label: "Secure" },
  warning: { color: "#f59e0b", glow: "rgba(245,158,11,0.45)", label: "Warning" },
  critical: { color: "#ef4444", glow: "rgba(239,68,68,0.55)", label: "Critical" },
};

// ─── GEOMETRY HELPERS ────────────────────────────────────────────────────────
const CX = 260, CY = 260;
const OUTER_R = 220;
const INNER_R = 130;
const GAP_DEG = 3;

function polarToXY(angle, r) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function buildArcPath(startDeg, endDeg, outerR, innerR) {
  const gapped_start = startDeg + GAP_DEG / 2;
  const gapped_end = endDeg - GAP_DEG / 2;
  const largeArc = gapped_end - gapped_start > 180 ? 1 : 0;

  const o1 = polarToXY(gapped_start, outerR);
  const o2 = polarToXY(gapped_end, outerR);
  const i1 = polarToXY(gapped_end, innerR);
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
  const mid = (startDeg + endDeg) / 2;
  const r = OUTER_R + 26;
  const pos = polarToXY(mid, r);
  return { ...pos, angle: mid };
}

function iconPosition(startDeg, endDeg) {
  const mid = (startDeg + endDeg) / 2;
  const r = (OUTER_R + INNER_R) / 2;
  return polarToXY(mid, r);
}

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
function Tooltip({ section, x, y, svgWidth }) {
  if (!section) return null;
  const cfg = STATUS[section.status];
  const hasIssues = section.issues?.length > 0;

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
          <span className="ring-tooltip__icon">
            <SectionIcon id={section.id} size={16} color={cfg.color} />
          </span>
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
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const totalSections = sections.length;
  const degPerSection = 360 / totalSections;

  const scoreColor =
    sections.some((s) => s.status === "critical")
      ? "#ef4444"
      : sections.some((s) => s.status === "warning")
        ? "#f59e0b"
        : "#22c55e";

  function handleMouseEnter(e, section, startDeg, endDeg) {
    setHovered(section);
    const { x, y } = iconPosition(startDeg, endDeg);
    setTooltipPos({ x, y: y - INNER_R * 0.25 });
  }

  function handleMouseLeave() {
    setHovered(null);
  }

  function handleClick(section) {
    const isNetworkSection =
      section.id === "network" ||
      section.id === "networks" ||
      section.label?.toLowerCase().includes("network");

    if (isNetworkSection) {
      navigate("/networks");
      return;
    }

    navigate(`/section/${section.id}`);
  }

  return (
    <div className="security-ring-wrapper">
      <svg
        ref={svgRef}
        viewBox={`-30 -30 ${CX * 2 + 60} ${CY * 2 + 60}`}
        className="security-ring-svg"
        aria-label="Security health overview"
      >
        {sections.map((section, i) => {
          const startDeg = i * degPerSection;
          const endDeg = startDeg + degPerSection;
          const path = buildArcPath(startDeg, endDeg, OUTER_R, INNER_R);
          const cfg = STATUS[section.status];
          const isHov = hovered?.id === section.id;
          const lblPos = labelPosition(startDeg, endDeg);
          const icnPos = iconPosition(startDeg, endDeg);

          const isLeftSide =
            Math.cos(((lblPos.angle - 90) * Math.PI) / 180) < 0;

          const saasOffset = section.id === "saas" ? 0 : 0;

          return (
            <g
              key={section.id}
              className={`ring-segment ${isHov ? "ring-segment--hovered" : ""}`}
              onMouseEnter={(e) => handleMouseEnter(e, section, startDeg, endDeg)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(section)}
              style={{ cursor: "pointer" }}
            >
              <path
                d={path}
                fill={cfg.color}
                opacity={isHov ? 1 : 0.75}
                stroke="#0f172a"
                strokeWidth="1"
              />

              <SectionIconSVG
                id={section.id}
                cx={icnPos.x}
                cy={icnPos.y}
                size={18}
              />

              <text
                x={lblPos.x + saasOffset}
                y={lblPos.y}
                textAnchor={isLeftSide ? "end" : "start"}
                dominantBaseline="middle"
                className="ring-segment__label"
                fill={isHov ? cfg.color : "rgba(203,213,225,0.9)"}
              >
                {section.label}
              </text>
            </g>
          );
        })}

        <circle cx={CX} cy={CY} r={INNER_R - 10} fill="#0f172a" />

        <text
          x={CX}
          y={CY - 10}
          textAnchor="middle"
          className="ring-score-number"
          fill={scoreColor}
        >
          {overallScore}%
        </text>

        <text
          x={CX}
          y={CY + 22}
          textAnchor="middle"
          className="ring-score-label"
          fill="rgba(148,163,184,0.9)"
        >
          Security Health
        </text>

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