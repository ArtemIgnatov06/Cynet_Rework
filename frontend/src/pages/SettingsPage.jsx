import { useState } from "react";
import AllowlistTab from "./settings/AllowlistTab";
import AlertsSettingsTab from "./settings/AlertsSettingsTab";
import GroupsTab from "./settings/GroupsTab";
import UbaSettingsTab from "./settings/UbaSettingsTab";
import "./SettingsPage.css";

const TABS = ["Groups", "Allowlist & Exclusions", "Integrations", "Alerts", "Profiles"];

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

export default function SettingsPage() {
  const [active, setActive] = useState("Groups");

  const isAdvanced = ADVANCED_TABS.includes(active);

  const renderTab = () => {
    if (active === "Groups") {
      return <GroupsTab />;
    }

    if (active === "Allowlist & Exclusions") {
      return <AllowlistTab />;
    }

    if (active === "Alerts") {
      return <AlertsSettingsTab />;
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
