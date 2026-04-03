import { useEffect, useMemo, useRef, useState } from "react";
import { fetchAllowlistSettingsData } from "../../api/securityApi";
import "./AllowlistTab.css";

const SECTIONS = [
  { id: "allowlist", label: "Allowlist" },
  { id: "exclusions", label: "Exclusions" },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  groups: "",
  hosts: "",
};

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

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

function formatDate(value) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createForm(entry) {
  if (!entry) {
    return EMPTY_FORM;
  }

  return {
    name: entry.name,
    description: entry.description,
    groups: entry.groups.join(", "),
    hosts: entry.hosts.join(", "),
  };
}

function normalizeForm(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    groups: form.groups.split(",").map((value) => value.trim()).filter(Boolean),
    hosts: form.hosts.split(",").map((value) => value.trim()).filter(Boolean),
  };
}

export default function AllowlistTab() {
  const [data, setData] = useState({ allowlist: [], exclusions: [] });
  const [activeSection, setActiveSection] = useState("allowlist");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(1);
  const [dialogMode, setDialogMode] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchAllowlistSettingsData().then((nextData) => {
      setData(nextData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenFor(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const rows = data[activeSection] ?? [];

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      [row.name, row.description, ...row.groups, ...row.hosts]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [rows, search]);

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedRow = rows.find((row) => row.id === selectedId) ?? null;

  useEffect(() => {
    setPage(1);
    setSelectedId(null);
    setMenuOpenFor(null);
  }, [activeSection, search]);

  const updateSectionRows = (updater) => {
    setData((prev) => ({
      ...prev,
      [activeSection]: updater(prev[activeSection]),
    }));
  };

  const openCreateDialog = () => {
    setDialogMode("create");
    setForm(EMPTY_FORM);
  };

  const openEditDialog = (row) => {
    setDialogMode("edit");
    setForm(createForm(row));
  };

  const closeDialog = () => {
    setDialogMode(null);
    setForm(EMPTY_FORM);
  };

  const handleDelete = (id) => {
    updateSectionRows((prev) => prev.filter((row) => row.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
    setMenuOpenFor(null);
  };

  const handleDuplicate = (row) => {
    const duplicated = {
      ...row,
      id: `${activeSection}-${Date.now()}`,
      name: `${row.name} Copy`,
      lastModified: new Date().toISOString(),
    };

    updateSectionRows((prev) => [duplicated, ...prev]);
    setSelectedId(duplicated.id);
    setPage(1);
    setMenuOpenFor(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = normalizeForm(form);
    if (!payload.name) {
      return;
    }

    if (dialogMode === "create") {
      const nextRow = {
        id: `${activeSection}-${Date.now()}`,
        ...payload,
        lastModified: new Date().toISOString(),
      };

      updateSectionRows((prev) => [nextRow, ...prev]);
      setSelectedId(nextRow.id);
      setPage(1);
    }

    if (dialogMode === "edit" && selectedRow) {
      updateSectionRows((prev) =>
        prev.map((row) =>
          row.id === selectedRow.id
            ? {
                ...row,
                ...payload,
                lastModified: new Date().toISOString(),
              }
            : row
        )
      );
    }

    closeDialog();
  };

  return (
    <div className="alt">
      <div className="alt-tabs">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            className={`alt-tabs__item ${activeSection === section.id ? "alt-tabs__item--active" : ""}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="alt-toolbar">
        <label className="alt-search">
          <span className="alt-search__icon"><IconSearch /></span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${activeSection}`}
          />
        </label>

        <div className="alt-toolbar__actions">
          <button className="alt-btn alt-btn--primary" onClick={openCreateDialog}>
            <IconPlus /> New
          </button>
          <button
            className="alt-btn alt-btn--secondary"
            disabled={!selectedRow}
            onClick={() => selectedRow && openEditDialog(selectedRow)}
          >
            <IconEdit /> Edit
          </button>
          <button
            className="alt-btn alt-btn--danger"
            disabled={!selectedRow}
            onClick={() => selectedRow && handleDelete(selectedRow.id)}
          >
            <IconTrash /> Delete
          </button>
        </div>
      </div>

      <div className="alt-table-wrap">
        {loading ? (
          <div className="alt-empty">Loading entries...</div>
        ) : (
          <table className="alt-table">
            <thead>
              <tr>
                <th className="alt-table__name">Name</th>
                <th>Description</th>
                <th>Last Modified</th>
                <th>Groups</th>
                <th>Hosts</th>
                <th className="alt-table__actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="alt-empty">
                    No rows
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr
                    key={row.id}
                    className={`alt-row ${selectedId === row.id ? "alt-row--selected" : ""}`}
                    onClick={() => setSelectedId(selectedId === row.id ? null : row.id)}
                  >
                    <td className="alt-row__name">{row.name}</td>
                    <td className="alt-row__description">{row.description}</td>
                    <td>{formatDate(row.lastModified)}</td>
                    <td>{row.groups.length || "-"}</td>
                    <td>{row.hosts.length || "-"}</td>
                    <td className="alt-row__actions">
                      <div className="alt-row-actions">
                        <button
                          className="alt-row-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedId(row.id);
                            openEditDialog(row);
                          }}
                        >
                          <IconEdit />
                        </button>
                        <button
                          className="alt-row-btn alt-row-btn--danger"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(row.id);
                          }}
                        >
                          <IconTrash />
                        </button>
                        <div className="alt-row-menu" ref={menuOpenFor === row.id ? menuRef : null}>
                          <button
                            className={`alt-row-btn ${menuOpenFor === row.id ? "alt-row-btn--active" : ""}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedId(row.id);
                              setMenuOpenFor((current) => (current === row.id ? null : row.id));
                            }}
                          >
                            <IconMore />
                          </button>
                          {menuOpenFor === row.id && (
                            <div className="alt-dropdown" onClick={(event) => event.stopPropagation()}>
                              <button
                                className="alt-dropdown__item"
                                onClick={() => {
                                  openEditDialog(row);
                                  setMenuOpenFor(null);
                                }}
                              >
                                Edit entry
                              </button>
                              <button
                                className="alt-dropdown__item"
                                onClick={() => handleDuplicate(row)}
                              >
                                Duplicate
                              </button>
                              <button
                                className="alt-dropdown__item alt-dropdown__item--danger"
                                onClick={() => handleDelete(row.id)}
                              >
                                Delete entry
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filteredRows.length > 0 && (
        <div className="alt-pagination">
          <span>
            {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredRows.length)} of {filteredRows.length}
          </span>
          <div className="alt-pagination__controls">
            <button className="alt-page-btn" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
              <IconChevron dir="left" />
            </button>
            <button className="alt-page-btn" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>
              <IconChevron dir="right" />
            </button>
          </div>
        </div>
      )}

      {dialogMode && (
        <div className="alt-modal-backdrop" onClick={closeDialog}>
          <div className="alt-modal" onClick={(event) => event.stopPropagation()}>
            <div className="alt-modal__header">
              <div>
                <h2>{dialogMode === "create" ? "New entry" : "Edit entry"}</h2>
                <p>
                  This local form already matches a clean backend-friendly payload:
                  name, description, groups, and hosts.
                </p>
              </div>
              <button className="alt-modal__close" onClick={closeDialog}>×</button>
            </div>

            <form className="alt-form" onSubmit={handleSubmit}>
              <label className="alt-form__field">
                <span>Name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Entry name"
                  required
                />
              </label>

              <label className="alt-form__field">
                <span>Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Short explanation for the team"
                  rows={3}
                />
              </label>

              <div className="alt-form__row">
                <label className="alt-form__field">
                  <span>Groups</span>
                  <input
                    value={form.groups}
                    onChange={(event) => setForm((prev) => ({ ...prev, groups: event.target.value }))}
                    placeholder="Comma-separated group names"
                  />
                </label>

                <label className="alt-form__field">
                  <span>Hosts</span>
                  <input
                    value={form.hosts}
                    onChange={(event) => setForm((prev) => ({ ...prev, hosts: event.target.value }))}
                    placeholder="Comma-separated hosts"
                  />
                </label>
              </div>

              <div className="alt-form__actions">
                <button type="button" className="alt-btn alt-btn--secondary" onClick={closeDialog}>
                  Cancel
                </button>
                <button type="submit" className="alt-btn alt-btn--primary">
                  {dialogMode === "create" ? "Create" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
