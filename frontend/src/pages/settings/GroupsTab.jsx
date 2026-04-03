import { useEffect, useMemo, useRef, useState } from "react";
import { fetchGroupsData } from "../../api/securityApi";
import "./GroupsTab.css";

function OsIcon({ os }) {
  if (os === "windows") {
    return (
      <span className="gt-os-icon gt-os-icon--windows" title="Windows">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
        </svg>
      </span>
    );
  }

  if (os === "mac") {
    return (
      <span className="gt-os-icon gt-os-icon--mac" title="macOS">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.19 1.3-2.17 3.87.03 3.06 2.65 4.08 2.68 4.09l-.06.16zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      </span>
    );
  }

  return (
    <span className="gt-os-icon gt-os-icon--linux" title="Linux">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.504 0c-.155 0-.315.008-.480.021C7.576.328 3.924 3.29 2.599 7.45l-.04.118c-.055.155-.096.314-.129.476-.015.082-.027.165-.039.247-.011.082-.021.165-.029.247l-.021.33c-.007.11-.012.22-.012.33C2.33 12.08 4.67 15.57 8.19 17.5c.316.173.644.326.98.458L9.27 18h5.46l.1-.042c.336-.132.664-.285.98-.458 3.52-1.93 5.86-5.42 5.86-9.502 0-.11-.005-.22-.012-.33l-.021-.33c-.008-.082-.018-.165-.029-.247-.012-.082-.024-.165-.039-.247-.033-.162-.074-.321-.129-.476l-.04-.118C19.578 3.29 15.93.328 11.985.021 11.82.008 11.66 0 11.504 0h1z" />
      </svg>
    </span>
  );
}

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IconMore = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconChevron = ({ dir }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: dir === "left" ? "none" : "rotate(180deg)" }}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconSort = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PAGE_SIZE = 14;
const OS_LABELS = {
  windows: "Windows",
  mac: "macOS",
  linux: "Linux",
};
const EMPTY_GROUP_FORM = {
  name: "",
  os: "windows",
  endpoints: 0,
  eppBestPractice: true,
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createGroupForm(group) {
  if (!group) {
    return EMPTY_GROUP_FORM;
  }

  return {
    name: group.name,
    os: group.os,
    endpoints: group.endpoints,
    eppBestPractice: group.eppBestPractice,
  };
}

function normalizeGroupForm(form) {
  return {
    name: form.name.trim(),
    os: form.os,
    endpoints: Math.max(0, Number(form.endpoints) || 0),
    eppBestPractice: Boolean(form.eppBestPractice),
  };
}

export default function GroupsTab() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [dialogMode, setDialogMode] = useState(null);
  const [form, setForm] = useState(EMPTY_GROUP_FORM);
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchGroupsData().then((data) => {
      setGroups(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenFor(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    let rows = groups;

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((group) => group.name.toLowerCase().includes(q));
    }

    return [...rows].sort((a, b) => {
      return sortAsc ? a.endpoints - b.endpoints : b.endpoints - a.endpoints;
    });
  }, [groups, search, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedGroup = groups.find((group) => group.id === selected) ?? null;

  const totalEndpoints = useMemo(() => {
    return groups.reduce((sum, group) => sum + group.endpoints, 0);
  }, [groups]);

  const bestPracticeCount = useMemo(() => {
    return groups.filter((group) => group.eppBestPractice).length;
  }, [groups]);

  const handleDelete = () => {
    if (!selected) return;

    setGroups((prev) => prev.filter((group) => group.id !== selected));
    setSelected(null);
    setMenuOpenFor(null);
  };

  const openCreateDialog = () => {
    setDialogMode("create");
    setForm(EMPTY_GROUP_FORM);
  };

  const openEditDialog = (group) => {
    setDialogMode("edit");
    setForm(createGroupForm(group));
  };

  const closeDialog = () => {
    setDialogMode(null);
    setForm(EMPTY_GROUP_FORM);
  };

  const toggleMenu = (groupId) => {
    setMenuOpenFor((current) => (current === groupId ? null : groupId));
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = normalizeGroupForm(form);
    if (!payload.name) {
      return;
    }

    // This payload shape is ready to be sent to a future create/update API endpoint.
    if (dialogMode === "create") {
      const nextGroup = {
        id: `g-${Date.now()}`,
        ...payload,
        lastModified: new Date().toISOString(),
      };

      setGroups((prev) => [nextGroup, ...prev]);
      setSelected(nextGroup.id);
      setPage(1);
    }

    if (dialogMode === "edit" && selectedGroup) {
      const updatedId = selectedGroup.id;

      setGroups((prev) =>
        prev.map((group) =>
          group.id === updatedId
            ? {
                ...group,
                ...payload,
                lastModified: new Date().toISOString(),
              }
            : group
        )
      );

      setSelected(updatedId);
    }

    closeDialog();
  };

  const handleDuplicate = (group) => {
    const duplicatedGroup = {
      ...group,
      id: `g-${Date.now()}`,
      name: `${group.name} Copy`,
      lastModified: new Date().toISOString(),
    };

    setGroups((prev) => [duplicatedGroup, ...prev]);
    setSelected(duplicatedGroup.id);
    setPage(1);
    setMenuOpenFor(null);
  };

  const handleToggleBestPractice = (group) => {
    setGroups((prev) =>
      prev.map((row) =>
        row.id === group.id
          ? {
              ...row,
              eppBestPractice: !row.eppBestPractice,
              lastModified: new Date().toISOString(),
            }
          : row
      )
    );

    setSelected(group.id);
    setMenuOpenFor(null);
  };

  const handleDeleteRow = (group) => {
    setGroups((prev) => prev.filter((row) => row.id !== group.id));

    if (selected === group.id) {
      setSelected(null);
    }

    setMenuOpenFor(null);
  };

  return (
    <div className="gt">
      <div className="gt-summary">
        <div className="gt-summary__item">
          <span className="gt-summary__label">Groups</span>
          <strong className="gt-summary__value">{groups.length}</strong>
        </div>
        <div className="gt-summary__item">
          <span className="gt-summary__label">Endpoints</span>
          <strong className="gt-summary__value">{totalEndpoints}</strong>
        </div>
        <div className="gt-summary__item">
          <span className="gt-summary__label">Best Practice</span>
          <strong className="gt-summary__value">{bestPracticeCount}/{groups.length || 0}</strong>
        </div>
      </div>

      <div className="gt-toolbar">
        <div className="gt-search-wrap">
          <span className="gt-search-icon"><IconSearch /></span>
          <input
            className="gt-search"
            placeholder="Search groups"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="gt-toolbar-actions">
          <button className="gt-btn gt-btn--primary" onClick={openCreateDialog}>
            <IconPlus /> New Group
          </button>
          <button
            className={`gt-btn gt-btn--secondary ${!selected ? "gt-btn--disabled" : ""}`}
            disabled={!selected}
            onClick={() => selectedGroup && openEditDialog(selectedGroup)}
          >
            <IconEdit /> Edit
          </button>
          <button
            className={`gt-btn gt-btn--danger ${!selected ? "gt-btn--disabled" : ""}`}
            disabled={!selected}
            onClick={handleDelete}
          >
            <IconTrash /> Delete
          </button>
        </div>
      </div>

      <div className="gt-table-wrap">
        {loading ? (
          <div className="gt-loading">Loading groups...</div>
        ) : (
          <table className="gt-table">
            <thead>
              <tr>
                <th className="gt-th--name">Name</th>
                <th>Operating System</th>
                <th
                  className="gt-th--sortable"
                  onClick={() => setSortAsc((v) => !v)}
                >
                  # Endpoints <span className={`gt-sort-icon ${sortAsc ? "gt-sort-icon--asc" : ""}`}><IconSort /></span>
                </th>
                <th>EPP Best Practice</th>
                <th>Last Modified</th>
                <th className="gt-th--actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={6} className="gt-empty">No groups found</td></tr>
              ) : pageRows.map((group) => (
                <tr
                  key={group.id}
                  className={`gt-row ${selected === group.id ? "gt-row--selected" : ""}`}
                  onClick={() => setSelected(group.id === selected ? null : group.id)}
                >
                  <td className="gt-td--name">{group.name}</td>
                  <td>
                    <div className="gt-os-cell">
                      <OsIcon os={group.os} />
                      <span>{OS_LABELS[group.os]}</span>
                    </div>
                  </td>
                  <td className="gt-td--endpoints">{group.endpoints}</td>
                  <td>
                    <span className={`gt-badge ${group.eppBestPractice ? "gt-badge--yes" : "gt-badge--no"}`}>
                      {group.eppBestPractice ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="gt-td--date">{formatDate(group.lastModified)}</td>
                  <td className="gt-td--actions">
                    <div className="gt-row-actions">
                      <button
                        className="gt-row-btn"
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(group.id);
                          openEditDialog(group);
                        }}
                      >
                        <IconEdit />
                      </button>
                      <button
                        className="gt-row-btn gt-row-btn--danger"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRow(group);
                        }}
                      >
                        <IconTrash />
                      </button>
                      <div className="gt-row-menu" ref={menuOpenFor === group.id ? menuRef : null}>
                        <button
                          className={`gt-row-btn ${menuOpenFor === group.id ? "gt-row-btn--active" : ""}`}
                          title="More"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(group.id);
                            toggleMenu(group.id);
                          }}
                        >
                          <IconMore />
                        </button>

                        {menuOpenFor === group.id && (
                          <div className="gt-dropdown" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="gt-dropdown__item"
                              onClick={() => {
                                setSelected(group.id);
                                openEditDialog(group);
                                setMenuOpenFor(null);
                              }}
                            >
                              Edit group
                            </button>
                            <button
                              className="gt-dropdown__item"
                              onClick={() => handleDuplicate(group)}
                            >
                              Duplicate
                            </button>
                            <button
                              className="gt-dropdown__item"
                              onClick={() => handleToggleBestPractice(group)}
                            >
                              {group.eppBestPractice ? "Disable" : "Enable"} best practice
                            </button>
                            <button
                              className="gt-dropdown__item gt-dropdown__item--danger"
                              onClick={() => handleDeleteRow(group)}
                            >
                              Delete group
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <div className="gt-pagination">
          <span className="gt-pagination__info">
            {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <button
            className="gt-pagination__btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <IconChevron dir="left" />
          </button>
          <button
            className="gt-pagination__btn"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <IconChevron dir="right" />
          </button>
        </div>
      )}

      {dialogMode && (
        <div className="gt-modal-backdrop" onClick={closeDialog}>
          <div className="gt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gt-modal__header">
              <div>
                <h2 className="gt-modal__title">
                  {dialogMode === "create" ? "New Group" : "Edit Group"}
                </h2>
                <p className="gt-modal__subtitle">
                  {dialogMode === "create"
                    ? "Create a local dummy group that can later be sent to the backend."
                    : "Update the selected group using the same shape we can later map to an API request."}
                </p>
              </div>
              <button className="gt-modal__close" onClick={closeDialog}>×</button>
            </div>

            <form className="gt-form" onSubmit={handleSubmit}>
              <label className="gt-form__field">
                <span>Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="Enter group name"
                  required
                />
              </label>

              <div className="gt-form__row">
                <label className="gt-form__field">
                  <span>Operating System</span>
                  <select
                    value={form.os}
                    onChange={(e) => handleFormChange("os", e.target.value)}
                  >
                    {Object.entries(OS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>

                <label className="gt-form__field">
                  <span>Endpoints</span>
                  <input
                    type="number"
                    min="0"
                    value={form.endpoints}
                    onChange={(e) => handleFormChange("endpoints", e.target.value)}
                  />
                </label>
              </div>

              <label className="gt-form__checkbox">
                <input
                  type="checkbox"
                  checked={form.eppBestPractice}
                  onChange={(e) => handleFormChange("eppBestPractice", e.target.checked)}
                />
                <span>Enable EPP best practice for this group</span>
              </label>

              <div className="gt-modal__actions">
                <button type="button" className="gt-btn gt-btn--secondary" onClick={closeDialog}>
                  Cancel
                </button>
                <button type="submit" className="gt-btn gt-btn--primary">
                  {dialogMode === "create" ? "Create Group" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
