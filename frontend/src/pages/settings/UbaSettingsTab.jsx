import { useEffect, useState } from "react";
import { fetchUbaSettingsData, saveUbaSettingsData } from "../../api/securityApi";
import "./UbaSettingsTab.css";

const INITIAL_STATE = {
  enabled: false,
  learningMode: false,
  alertOnImpossibleTravel: false,
  alertOnPrivilegeEscalation: false,
  alertOnBruteForce: false,
  riskThreshold: "medium",
  inactivityWindowDays: 14,
  priorityUsers: "",
  recipientEmails: "",
};

function ToggleRow({ title, hint, checked, onChange, label }) {
  return (
    <div className="uba-row">
      <div className="uba-row__copy">
        <h3>{title}</h3>
        <p>{hint}</p>
      </div>
      <label className="uba-toggle">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <span>{label}</span>
      </label>
    </div>
  );
}

function InputRow({ title, hint, children }) {
  return (
    <div className="uba-row">
      <div className="uba-row__copy">
        <h3>{title}</h3>
        <p>{hint}</p>
      </div>
      <div className="uba-row__control">{children}</div>
    </div>
  );
}

export default function UbaSettingsTab() {
  const [form, setForm] = useState(INITIAL_STATE);
  const [initialForm, setInitialForm] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    fetchUbaSettingsData().then((data) => {
      setForm(data);
      setInitialForm(data);
      setLoading(false);
    });
  }, []);

  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveMessage("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      priorityUsers: form.priorityUsers.trim(),
      recipientEmails: form.recipientEmails.trim(),
      inactivityWindowDays: Number(form.inactivityWindowDays) || 0,
    };

    const saved = await saveUbaSettingsData(payload);
    setForm(saved);
    setInitialForm(saved);
    setSaving(false);
    setSaveMessage("UBA settings saved locally. The save payload is ready for backend mapping.");
  };

  const handleReset = () => {
    setForm(initialForm);
    setSaveMessage("");
  };

  if (loading) {
    return <div className="uba-empty">Loading UBA settings...</div>;
  }

  return (
    <form className="uba" onSubmit={handleSave}>
      <div className="uba-actions">
        <p className="uba-actions__text">
          Keep UBA understandable: clear toggles, simple thresholds, and no unnecessary jargon.
        </p>
        <div className="uba-actions__buttons">
          <button type="button" className="uba-btn uba-btn--secondary" onClick={handleReset}>
            Reset
          </button>
          <button type="submit" className="uba-btn uba-btn--primary" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {saveMessage && <div className="uba-notice">{saveMessage}</div>}

      <section className="uba-card">
        <h2 className="uba-card__title">Monitoring</h2>

        <ToggleRow
          title="Enable UBA"
          hint="Turn user behavior monitoring on or off for the tenant."
          checked={form.enabled}
          onChange={(value) => setField("enabled", value)}
          label="UBA enabled"
        />

        <ToggleRow
          title="Learning mode"
          hint="Use a softer rollout while the system learns typical user behavior."
          checked={form.learningMode}
          onChange={(value) => setField("learningMode", value)}
          label="Learning mode enabled"
        />

        <ToggleRow
          title="Impossible travel"
          hint="Alert when the same user appears to sign in from distant locations too quickly."
          checked={form.alertOnImpossibleTravel}
          onChange={(value) => setField("alertOnImpossibleTravel", value)}
          label="Alert on impossible travel"
        />

        <ToggleRow
          title="Privilege escalation"
          hint="Alert when a user unexpectedly gains or requests elevated access."
          checked={form.alertOnPrivilegeEscalation}
          onChange={(value) => setField("alertOnPrivilegeEscalation", value)}
          label="Alert on privilege escalation"
        />

        <ToggleRow
          title="Brute force activity"
          hint="Alert when repeated failed sign-ins suggest password guessing."
          checked={form.alertOnBruteForce}
          onChange={(value) => setField("alertOnBruteForce", value)}
          label="Alert on brute force activity"
        />
      </section>

      <section className="uba-card">
        <h2 className="uba-card__title">Thresholds and ownership</h2>

        <InputRow
          title="Risk threshold"
          hint="Choose when UBA should raise user-risk alerts for the team."
        >
          <select value={form.riskThreshold} onChange={(event) => setField("riskThreshold", event.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </InputRow>

        <InputRow
          title="Inactivity window"
          hint="How many days without activity should count as inactive behavior."
        >
          <input
            type="number"
            min="1"
            value={form.inactivityWindowDays}
            onChange={(event) => setField("inactivityWindowDays", event.target.value)}
          />
        </InputRow>

        <InputRow
          title="Priority users"
          hint="Comma-separated users or mailboxes that should always get closer attention."
        >
          <input
            value={form.priorityUsers}
            onChange={(event) => setField("priorityUsers", event.target.value)}
            placeholder="admin@domain.com, finance@domain.com"
          />
        </InputRow>

        <InputRow
          title="Notification recipients"
          hint="Who should receive UBA notifications when suspicious behavior is detected."
        >
          <input
            value={form.recipientEmails}
            onChange={(event) => setField("recipientEmails", event.target.value)}
            placeholder="soc@domain.com"
          />
        </InputRow>
      </section>
    </form>
  );
}
