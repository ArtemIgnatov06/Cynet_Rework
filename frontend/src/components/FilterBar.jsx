import "./FilterBar.css";

export function applyFilters(rows, filters, schema) {
  if (!rows?.length) return rows ?? [];
  return rows.filter((row) =>
    schema.every((field) => {
      if (field.type === "date") return true;

      if (field.type === "range") {
        const from = parseFloat(filters[field.key + "_from"]);
        const to   = parseFloat(filters[field.key + "_to"]);
        const val  = parseFloat(row[field.key] ?? 0);
        if (!isNaN(from) && val < from) return false;
        if (!isNaN(to)   && val > to)   return false;
        return true;
      }

      const val = filters[field.key];
      if (!val || val === "") return true;
      const rowVal = String(row[field.key] ?? "").toLowerCase();
      if (field.type === "select") return rowVal === val.toLowerCase();
      return rowVal.includes(val.toLowerCase());
    })
  );
}

function RangeField({ fieldKey, filters, onChange, placeholder = ["From", "To"] }) {
  return (
    <div className="filter-field__date-wrap">
      <input
        type="number"
        className="filter-field__input filter-field__input--date"
        placeholder={placeholder[0]}
        value={filters[fieldKey + "_from"] ?? ""}
        onChange={(e) => onChange(fieldKey + "_from", e.target.value)}
      />
      <span className="filter-field__date-sep">–</span>
      <input
        type="number"
        className="filter-field__input filter-field__input--date"
        placeholder={placeholder[1]}
        value={filters[fieldKey + "_to"] ?? ""}
        onChange={(e) => onChange(fieldKey + "_to", e.target.value)}
      />
    </div>
  );
}

export default function FilterBar({ schema, filters, onChange, onClear }) {
  if (!schema?.length) return null;
  const activeCount = Object.values(filters).filter((v) => v && v !== "").length;

  return (
    <div className="filter-bar">
      <div className="filter-bar__header">
        <div className="filter-bar__label">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="filter-bar__count">{activeCount}</span>
          )}
        </div>
        {activeCount > 0 && (
          <button className="filter-bar__clear" onClick={onClear}>Clear all</button>
        )}
      </div>

      <div className="filter-bar__fields">
        {schema.map((field) => (
          <div key={field.key} className={`filter-field ${field.type === "range" || field.type === "date" ? "filter-field--wide" : ""}`}>
            <label className="filter-field__label">{field.label}</label>

            {field.type === "select" ? (
              <div className="filter-field__select-wrap">
                <select
                  className="filter-field__select"
                  value={filters[field.key] ?? ""}
                  onChange={(e) => onChange(field.key, e.target.value)}
                >
                  <option value="">All</option>
                  {field.opts.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <svg className="filter-field__chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

            ) : field.type === "range" ? (
              <RangeField fieldKey={field.key} filters={filters} onChange={onChange} />

            ) : field.type === "date" ? (
              <div className="filter-field__date-wrap">
                <input
                  type="text"
                  className="filter-field__input filter-field__input--date"
                  placeholder="From"
                  value={filters[field.key + "_from"] ?? ""}
                  onChange={(e) => onChange(field.key + "_from", e.target.value)}
                />
                <span className="filter-field__date-sep">–</span>
                <input
                  type="text"
                  className="filter-field__input filter-field__input--date"
                  placeholder="To"
                  value={filters[field.key + "_to"] ?? ""}
                  onChange={(e) => onChange(field.key + "_to", e.target.value)}
                />
              </div>

            ) : (
              <div className="filter-field__input-wrap">
                <svg className="filter-field__icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  className="filter-field__input"
                  placeholder="Search…"
                  value={filters[field.key] ?? ""}
                  onChange={(e) => onChange(field.key, e.target.value)}
                />
                {filters[field.key] && (
                  <button className="filter-field__clear-x" onClick={() => onChange(field.key, "")}>×</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
