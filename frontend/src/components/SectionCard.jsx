import { useNavigate } from "react-router-dom";
import { SectionIcon } from "./Icons";
import "./SectionCard.css";

const STATUS_LABELS = {
  ok:       { label: "Secure",   dot: "#22c55e" },
  warning:  { label: "Warning",  dot: "#f59e0b" },
  critical: { label: "Critical", dot: "#ef4444" },
};

export default function SectionCard({ section }) {
  const navigate = useNavigate();
  const cfg = STATUS_LABELS[section.status];

  return (
    <div
      className={`section-card section-card--${section.status}`}
      onClick={() => navigate(`/section/${section.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/section/${section.id}`)}
      aria-label={`${section.label}: ${cfg.label}`}
    >
      <div className="section-card__top">
        <span className="section-card__icon">
          <SectionIcon id={section.id} size={18} color="#94a3b8" />
        </span>
        <span className="section-card__label">{section.label}</span>
        <span className="section-card__dot" style={{ background: cfg.dot }} />
      </div>

      <div className="section-card__score-row">
        <span className="section-card__score" style={{ color: cfg.dot }}>
          {section.score}%
        </span>
        <div className="section-card__bar-bg">
          <div
            className="section-card__bar-fill"
            style={{ width: `${section.score}%`, background: cfg.dot }}
          />
        </div>
      </div>

      <div className="section-card__meta">
        <span className="section-card__status-label" style={{ color: cfg.dot }}>
          {cfg.label}
        </span>
        {section.issues?.length > 0 && (
          <span className="section-card__issues">
            {section.issues.length} issue{section.issues.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
