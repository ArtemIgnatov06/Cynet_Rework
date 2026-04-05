import { useState, useEffect, useRef } from "react";
import { useNotes, NOTE_COLORS, PIN_OPTIONS } from "../context/NotesContext";
import "./NoteWidget.css";

const MIN_W = 120, MIN_H = 80;
const HEADER_H = 24;

const IconX = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconPin = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a1 1 0 0 1 1 1v1.586l5.707 5.707A1 1 0 0 1 19 12h-1v5a1 1 0 0 1-.553.894L12 20.618l-5.447-2.724A1 1 0 0 1 6 17v-5H5a1 1 0 0 1-.707-1.707L10 4.586V3a1 1 0 0 1 1-1h1z"/>
  </svg>
);
const IconGrip = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor" opacity="0.4">
    <circle cx="7.5" cy="7.5" r="1.2"/><circle cx="4.5" cy="7.5" r="1.2"/><circle cx="7.5" cy="4.5" r="1.2"/>
  </svg>
);

function useDrag(onEnd) {
  const [active, setActive]   = useState(false);
  const originRef             = useRef(null);

  const start = (e, current) => {
    originRef.current = { mx: e.clientX, my: e.clientY, ...current };
    setActive(true);
  };

  useEffect(() => {
    if (!active) return;
    const onMove = (e) => onEnd(e, originRef.current, false);
    const onUp   = (e) => { onEnd(e, originRef.current, true); setActive(false); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [active, onEnd]);

  return start;
}

export default function NoteWidget({ note }) {
  const { updateNote, deleteNote } = useNotes();
  const cfg = NOTE_COLORS[note.color] ?? NOTE_COLORS.yellow;

  const [pos,      setPos]      = useState(note.position);
  const [size,     setSize]     = useState(note.size ?? { w: 165, h: 120 });
  const [text,     setText]     = useState(note.text);
  const [showMenu, setShowMenu] = useState(false);
  const [active,   setActive]   = useState(false); // hover OR textarea focused

  const menuRef = useRef(null);
  const posRef  = useRef(pos);  posRef.current  = pos;
  const sizeRef = useRef(size); sizeRef.current = size;

  // ── Drag ──
  const startDrag = useDrag((e, origin, done) => {
    const next = {
      x: Math.max(0, origin.x + e.clientX - origin.mx),
      y: Math.max(64, origin.y + e.clientY - origin.my),
    };
    setPos(next);
    if (done) updateNote(note.id, { position: next });
  });

  const handleHeaderMouseDown = (e) => {
    if (e.target.closest("button")) return;
    e.preventDefault();
    startDrag(e, { x: pos.x, y: pos.y });
  };

  // ── Resize ──
  const startResize = useDrag((e, origin, done) => {
    const next = {
      w: Math.max(MIN_W, origin.w + e.clientX - origin.mx),
      h: Math.max(MIN_H, origin.h + e.clientY - origin.my),
    };
    setSize(next);
    if (done) updateNote(note.id, { size: next });
  });

  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    startResize(e, { w: size.w, h: size.h });
  };

  // ── Pin menu outside click ──
  useEffect(() => {
    if (!showMenu) return;
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showMenu]);

  const pinLabel = PIN_OPTIONS.find((o) => o.value === note.pinTo)?.label ?? "Everywhere";

  return (
    <div
      className={`note ${active ? "note--active" : ""}`}
      style={{
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: active ? size.h : size.h - HEADER_H,
        transition: active ? "none" : "height 0.15s ease",
        "--note-bg": cfg.bg, "--note-header": cfg.header, "--note-text": cfg.text,
      }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      {/* ── Header ── */}
      <div className="note__header" onMouseDown={handleHeaderMouseDown}>
        <div className="note__colors">
          {Object.keys(NOTE_COLORS).map((c) => (
            <button
              key={c}
              className={`note__color-dot ${note.color === c ? "note__color-dot--active" : ""}`}
              style={{ background: NOTE_COLORS[c].header }}
              onClick={() => updateNote(note.id, { color: c })}
            />
          ))}
        </div>
        <button className="note__delete" onClick={() => deleteNote(note.id)}>
          <IconX />
        </button>
      </div>

      {/* ── Body ── */}
      <textarea
        className="note__body"
        placeholder="Type a note…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => { setActive(false); updateNote(note.id, { text }); }}
        onFocus={() => setActive(true)}
        spellCheck={false}
      />

      {/* ── Footer ── */}
      <div className="note__footer" ref={menuRef}>
        <button className="note__pin-btn" onClick={() => setShowMenu((v) => !v)}>
          <IconPin /> {pinLabel}
        </button>
        {showMenu && (
          <div className="note-menu">
            {PIN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`note-menu__item ${note.pinTo === opt.value ? "note-menu__item--active" : ""}`}
                onClick={() => { updateNote(note.id, { pinTo: opt.value }); setShowMenu(false); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Resize handle ── */}
      <div className="note__resize" onMouseDown={handleResizeMouseDown}>
        <IconGrip />
      </div>
    </div>
  );
}
