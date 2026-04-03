import { useEffect, useState } from "react";
import { fetchAlertsSettingsData, saveAlertsSettingsData } from "../../api/securityApi";
import "./AlertsSettingsTab.css";

const INITIAL_STATE = {
  emailRecipients: "",
  smtpServer: "",
  requireSsl: false,
  localSender: "",
  localRecipients: "",
  sendAlertsToAwsS3: false,
  notifyOnCriticalOnly: false,
  dailyDigestEnabled: false,
};

function FieldRow({ title, hint, children }) {
  return (
    <div className="aset-row">
      <div className="aset-row__copy">
        <h3>{title}</h3>
        <p>{hint}</p>
      </div>
      <div className="aset-row__control">{children}</div>
    </div>
  );
}

function ToggleControl({ checked, onChange, label }) {
  return (
    <label className="aset-toggle">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="aset-toggle__switch" aria-hidden="true">
        <span className="aset-toggle__knob" />
      </span>
      <span className="aset-toggle__label">{label}</span>
    </label>
  );
}

export default function AlertsSettingsTab() {
  const [form, setForm] = useState(INITIAL_STATE);
  const [initialForm, setInitialForm] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    fetchAlertsSettingsData().then((data) => {
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
      emailRecipients: form.emailRecipients.trim(),
      smtpServer: form.smtpServer.trim(),
      localSender: form.localSender.trim(),
      localRecipients: form.localRecipients.trim(),
    };

    const saved = await saveAlertsSettingsData(payload);
    setForm(saved);
    setInitialForm(saved);
    setSaving(false);
    setSaveMessage("Settings saved locally. This flow is ready for backend wiring.");
  };

  const handleReset = () => {
    setForm(initialForm);
    setSaveMessage("");
  };

  if (loading) {
    return <div className="aset-empty">Loading alerts settings...</div>;
  }

  return (
    <form className="aset" onSubmit={handleSave}>
      <div className="aset-actions">
        <p className="aset-actions__text">
          Keep delivery settings clear so new teammates understand where alerts go and why.
        </p>
        <div className="aset-actions__buttons">
          <button type="button" className="aset-btn aset-btn--secondary" onClick={handleReset}>
            Reset
          </button>
          <button type="submit" className="aset-btn aset-btn--primary" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {saveMessage && <div className="aset-notice">{saveMessage}</div>}

      <section className="aset-card">
        <h2 className="aset-card__title">Email settings</h2>

        <FieldRow
          title="Cynet email recipients"
          hint="Comma-separated addresses that should receive standard alert notifications."
        >
          <input
            value={form.emailRecipients}
            onChange={(event) => setField("emailRecipients", event.target.value)}
            placeholder="email1@domain.com, email2@domain.com"
          />
        </FieldRow>

        <FieldRow
          title="SMTP server"
          hint="Use an IP or internal relay value if the server should send alerts directly."
        >
          <input
            value={form.smtpServer}
            onChange={(event) => setField("smtpServer", event.target.value)}
            placeholder="10.10.30.25"
          />
        </FieldRow>

        <FieldRow
          title="SMTP SSL"
          hint="Enable SSL encryption between the Cynet server and the SMTP server."
        >
          <ToggleControl
            checked={form.requireSsl}
            onChange={(value) => setField("requireSsl", value)}
            label="Require SSL"
          />
        </FieldRow>

        <FieldRow
          title="Local email alert sender"
          hint="The visible From address for locally delivered alert emails."
        >
          <input
            value={form.localSender}
            onChange={(event) => setField("localSender", event.target.value)}
            placeholder="alerts@domain.com"
          />
        </FieldRow>

        <FieldRow
          title="Local email recipients"
          hint="Optional local recipients for alerts that should go through the internal mail flow."
        >
          <input
            value={form.localRecipients}
            onChange={(event) => setField("localRecipients", event.target.value)}
            placeholder="security@domain.com, it@domain.com"
          />
        </FieldRow>
      </section>

      <section className="aset-card">
        <h2 className="aset-card__title">Compliance and delivery</h2>

        <FieldRow
          title="Send alerts to AWS S3"
          hint="Use this only if another team consumes alerts from cloud storage."
        >
          <ToggleControl
            checked={form.sendAlertsToAwsS3}
            onChange={(value) => setField("sendAlertsToAwsS3", value)}
            label="Enable S3 delivery"
          />
        </FieldRow>

        <FieldRow
          title="Critical alerts only"
          hint="Reduce notification noise and keep attention on the most urgent events."
        >
          <ToggleControl
            checked={form.notifyOnCriticalOnly}
            onChange={(value) => setField("notifyOnCriticalOnly", value)}
            label="Only send critical alerts"
          />
        </FieldRow>

        <FieldRow
          title="Daily digest"
          hint="Send a simple daily summary for teams that do not need every individual event."
        >
          <ToggleControl
            checked={form.dailyDigestEnabled}
            onChange={(value) => setField("dailyDigestEnabled", value)}
            label="Enable daily digest"
          />
        </FieldRow>
      </section>
    </form>
  );
}
