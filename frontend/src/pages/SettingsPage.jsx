import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import AllowlistTab from "./settings/AllowlistTab";
import AlertsSettingsTab from "./settings/AlertsSettingsTab";
import GroupsTab from "./settings/GroupsTab";
import IntegrationsTab from "./settings/IntegrationsTab";
import UbaSettingsTab from "./settings/UbaSettingsTab";
import "./SettingsPage.css";

const TABS = ["Appearance", "Groups", "Allowlist & Exclusions", "Integrations", "Alerts", "Profiles"];

const ADVANCED_TABS = [
  "Privacy & Compliance Settings",
  "Analysis",
  "IT Hygiene",
  "UBA",
  "Threat Hunting",
  "Deception",
  "Remediation",
  "Security"
];

function AppearanceTab() {
  const { theme, setLight, setDark } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
          Choose how the interface looks across all pages.
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[
            { id: "dark",  label: "Dark",  desc: "Easy on the eyes at night",   bg: "#0b0e1a", fg: "#e2e8f0", accent: "#0ea5e9" },
            { id: "light", label: "Light", desc: "Clean and bright for daytime", bg: "#f0f4f8", fg: "#0f172a", accent: "#0284c7" },
          ].map(({ id, label, desc, bg, fg, accent }) => (
            <button
              key={id}
              onClick={() => id === "light" ? setLight() : setDark()}
              style={{
                display: "flex", flexDirection: "column", gap: 10,
                padding: "16px 20px", borderRadius: 14, cursor: "pointer",
                border: `2px solid ${theme === id ? accent : "rgba(255,255,255,0.08)"}`,
                background: theme === id ? `${accent}18` : "rgba(255,255,255,0.03)",
                textAlign: "left", transition: "all 0.18s", minWidth: 180,
              }}
            >
              {/* Mini preview */}
              <div style={{ width: "100%", height: 60, borderRadius: 8, background: bg, border: "1px solid rgba(128,128,128,0.15)", overflow: "hidden", position: "relative" }}>
                <div style={{ height: 10, background: bg === "#0b0e1a" ? "#111827" : "#fff", borderBottom: `1px solid rgba(128,128,128,0.1)` }} />
                <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ height: 6, width: "60%", borderRadius: 3, background: fg, opacity: 0.7 }} />
                  <div style={{ height: 5, width: "40%", borderRadius: 3, background: fg, opacity: 0.3 }} />
                  <div style={{ height: 5, width: "50%", borderRadius: 3, background: accent, opacity: 0.6 }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                  {label}
                  {theme === id && <span style={{ fontSize: 10, background: accent, color: "#fff", padding: "1px 6px", borderRadius: 99, fontWeight: 700 }}>Active</span>}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState("Appearance");

  const isAdvanced = ADVANCED_TABS.includes(active);

  const renderTab = () => {
    if (active === "Appearance") {
      return <AppearanceTab />;
    }

    if (active === "Groups") {
      return <GroupsTab />;
    }

    if (active === "Allowlist & Exclusions") {
      return <AllowlistTab />;
    }

    if (active === "Alerts") {
      return <AlertsSettingsTab />;
    }

    if (active === "Integrations") {
      return <IntegrationsTab />;
    }

    if (active === "UBA") {
      return <UbaSettingsTab />;
    }

    return (
      <div className="settings-placeholder">
        <p>
          This tab is still waiting for its dedicated frontend pass.
        </p>
      </div>
    );
  };

  return (
    <div className="settings-page">
      {/* ── Sidebar ── */}
      <aside className="settings-sidebar">
        <div className="settings-sidebar__section">
          {TABS.map((t) => (
            <button
              key={t}
              className={`settings-nav-item ${active === t ? "settings-nav-item--active" : ""}`}
              onClick={() => setActive(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="settings-sidebar__divider">
          <span className="settings-sidebar__divider-label">Advanced</span>
        </div>

        <div className="settings-sidebar__section">
          {ADVANCED_TABS.map((t) => (
            <button
              key={t}
              className={`settings-nav-item ${active === t ? "settings-nav-item--active" : ""}`}
              onClick={() => setActive(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="settings-content">
        <div className="settings-content__header">
          {isAdvanced && (
            <span className="settings-content__advanced-badge">Advanced</span>
          )}
          <h1 className="settings-content__title">{active}</h1>
        </div>
        <div className="settings-content__body">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}
