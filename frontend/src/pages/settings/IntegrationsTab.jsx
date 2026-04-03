import { useEffect, useMemo, useState } from "react";
import {
  fetchIntegrationsSettingsData,
  saveIntegrationSettings,
} from "../../api/securityApi";
import { INTEGRATION_LOGOS } from "./integrationLogos";
import { EXTRA_INTEGRATION_LOGOS } from "./integrationLogoAdditions";
import "./IntegrationsTab.css";

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

function Toggle({ checked, onChange, label }) {
  return (
    <label className="it-toggle">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="it-toggle__switch" aria-hidden="true">
        <span className="it-toggle__knob" />
      </span>
      {label && <span className="it-toggle__label">{label}</span>}
    </label>
  );
}

function StatusDot({ status }) {
  return <span className={`it-status-dot it-status-dot--${status}`} />;
}

function IntegrationLogo({ integration, large = false }) {
  const logoSrc = INTEGRATION_LOGOS[integration.id] || EXTRA_INTEGRATION_LOGOS[integration.id];

  if (logoSrc) {
    return (
      <span className={`it-card__logo it-card__logo--image ${large ? "it-card__logo--large" : ""}`}>
        <img src={logoSrc} alt={integration.name} className="it-card__logo-image" />
      </span>
    );
  }

  return (
    <span className={`it-card__logo it-card__logo--${integration.theme} ${large ? "it-card__logo--large" : ""}`}>
      {integration.shortLabel}
    </span>
  );
}

function normalizeCategory(category) {
  return {
    ...category,
    integrations: category.integrations.map((integration) => ({
      ...integration,
      services: integration.services.map((service) => ({ ...service })),
    })),
  };
}

export default function IntegrationsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeIntegration, setActiveIntegration] = useState(null);
  const [draftServices, setDraftServices] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchIntegrationsSettingsData().then((response) => {
      setData({
        ...response,
        categories: response.categories.map(normalizeCategory),
      });
      setLoading(false);
    });
  }, []);

  const filteredCategories = useMemo(() => {
    if (!data) {
      return [];
    }

    const query = search.trim().toLowerCase();
    if (!query) {
      return data.categories;
    }

    return data.categories
      .map((category) => ({
        ...category,
        integrations: category.integrations.filter((integration) =>
          [integration.name, integration.description, integration.details]
            .join(" ")
            .toLowerCase()
            .includes(query)
        ),
      }))
      .filter((category) => category.integrations.length > 0);
  }, [data, search]);

  const openIntegration = (categoryId, integrationId) => {
    if (!data) {
      return;
    }

    const category = data.categories.find((item) => item.id === categoryId);
    const integration = category?.integrations.find((item) => item.id === integrationId);
    if (!category || !integration) {
      return;
    }

    setActiveIntegration({
      categoryId,
      integrationId,
      categoryTitle: category.title,
      ...integration,
    });
    setDraftServices(integration.services.map((service) => ({ ...service })));
  };

  const closeModal = () => {
    setActiveIntegration(null);
    setDraftServices([]);
    setSaving(false);
  };

  const updateCategory = (categoryId, updater) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === categoryId ? updater(category) : category
      ),
    }));
  };

  const handleCategoryToggle = (categoryId, checked) => {
    updateCategory(categoryId, (category) => ({
      ...category,
      manageByGroup: checked,
    }));
  };

  const handleServiceToggle = (serviceId, checked) => {
    setDraftServices((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              enabled: checked,
            }
          : service
      )
    );
  };

  const handleSave = async () => {
    if (!activeIntegration) {
      return;
    }

    setSaving(true);
    const hasEnabledServices = draftServices.some((service) => service.enabled);
    const payload = {
      services: draftServices.map((service) => ({ ...service })),
      status: hasEnabledServices ? "connected" : "available",
    };

    const saved = await saveIntegrationSettings(
      activeIntegration.categoryId,
      activeIntegration.id,
      payload
    );

    updateCategory(activeIntegration.categoryId, (category) => ({
      ...category,
      integrations: category.integrations.map((integration) =>
        integration.id === activeIntegration.id
          ? {
              ...integration,
              services: saved.services,
              status: saved.status,
            }
          : integration
      ),
    }));

    setActiveIntegration((prev) =>
      prev
        ? {
            ...prev,
            services: saved.services,
            status: saved.status,
          }
        : prev
    );
    setDraftServices(saved.services.map((service) => ({ ...service })));
    setSaving(false);
  };

  if (loading) {
    return <div className="it-empty">Loading integrations...</div>;
  }

  return (
    <div className="it">
      <section className="it-intro">
        <span className="it-intro__eyebrow">{data.title}</span>
        <h2 className="it-intro__title">Manage integration with apps and SaaS</h2>
        <p className="it-intro__text">{data.description}</p>
      </section>

      <label className="it-search">
        <span className="it-search__icon"><IconSearch /></span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search"
        />
      </label>

      <p className="it-help">
        App connectivity is indicated by a green or amber dot. Open any card to review the connected services.
      </p>

      {filteredCategories.map((category) => (
        <section key={category.id} className="it-section">
          <div className="it-section__head">
            <h3>{category.title}</h3>
            <Toggle
              checked={category.manageByGroup}
              onChange={(checked) => handleCategoryToggle(category.id, checked)}
              label="Manage integrations by group"
            />
          </div>

          <div className="it-grid">
            {category.integrations.map((integration) => (
              <button
                key={integration.id}
                className="it-card"
                onClick={() => openIntegration(category.id, integration.id)}
              >
                <IntegrationLogo integration={integration} />
                <div className="it-card__footer">
                  <span className="it-card__name">{integration.name}</span>
                  <StatusDot status={integration.status} />
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}

      {filteredCategories.length === 0 && (
        <div className="it-empty">No integrations match this search.</div>
      )}

      {activeIntegration && (
        <div className="it-modal-backdrop" onClick={closeModal}>
          <div className="it-modal" onClick={(event) => event.stopPropagation()}>
            <div className="it-modal__body">
              <div className="it-modal__top">
                <IntegrationLogo integration={activeIntegration} large />
                <div className="it-modal__copy">
                  <h3>{activeIntegration.name}</h3>
                  <p>{activeIntegration.details}</p>
                </div>
              </div>

              <div className="it-modal__services">
                <h4>Select recommended services to connect to</h4>

                {draftServices.map((service) => (
                  <div key={service.id} className="it-service-row">
                    <div>
                      <span className="it-service-row__name">{service.name}</span>
                      {service.recommended && (
                        <span className="it-service-row__tag">Recommended</span>
                      )}
                    </div>
                    <Toggle
                      checked={service.enabled}
                      onChange={(checked) => handleServiceToggle(service.id, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="it-modal__actions">
              <button className="it-btn it-btn--secondary" onClick={closeModal}>
                Close
              </button>
              <button className="it-btn it-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
