import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNotes, NOTE_COLORS } from "../context/NotesContext";
import "./NotesPanel.css";

const IconNote = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="13" x2="15" y2="13"/>
    <line x1="9" y1="17" x2="13" y2="17"/>
  </svg>
);

export default function NotesPanel() {
  const { notes, enabled, setEnabled, addNote, deleteNote, clearAll } = useNotes();
  const { pathname } = useLocation();
  const [open,         setOpen]         = useState(false);
  const [pickedColor,  setPickedColor]  = useState("yellow");
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleAdd = () => {
    addNote(pickedColor, pathname);
    setOpen(false);
  };

  return (
    <div className="np-wrap" ref={panelRef}>
      <button
        className={`np-btn ${open ? "np-btn--open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        title="Sticky notes"
      >
        <IconNote />
        {notes.length > 0 && (
          <span className="np-badge">{notes.length}</span>
        )}
      </button>

      {open && (
        <div className="np-panel">
          {/* Header */}
          <div className="np-header">
            <span className="np-title">Notes</span>
            <label className="np-toggle" title={enabled ? "Hide all notes" : "Show all notes"}>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <span className="np-toggle__track">
                <span className="np-toggle__thumb" />
              </span>
            </label>
          </div>

          {/* New note */}
          <div className="np-new">
            <div className="np-colors">
              {Object.entries(NOTE_COLORS).map(([key, cfg]) => (
                <button
                  key={key}
                  className={`np-color ${pickedColor === key ? "np-color--active" : ""}`}
                  style={{ background: cfg.header }}
                  onClick={() => setPickedColor(key)}
                  title={key}
                />
              ))}
            </div>
            <button className="np-add-btn" onClick={handleAdd}>
              + New note
            </button>
          </div>

          {/* Note list */}
          {notes.length === 0 ? (
            <p className="np-empty">No notes yet</p>
          ) : (
            <div className="np-list">
              {notes.map((n) => {
                const cfg = NOTE_COLORS[n.color] ?? NOTE_COLORS.yellow;
                const preview = n.text.trim().slice(0, 40) || "Empty note";
                return (
                  <div key={n.id} className="np-item">
                    <span className="np-item__dot" style={{ background: cfg.header }} />
                    <span className="np-item__text">{preview}</span>
                    <button
                      className="np-item__del"
                      onClick={() => deleteNote(n.id)}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          {notes.length > 0 && (
            <button className="np-clear" onClick={clearAll}>
              Delete all notes
            </button>
          )}
        </div>
      )}
    </div>
  );
}
