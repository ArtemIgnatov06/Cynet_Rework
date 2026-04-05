import { createContext, useContext, useState, useEffect, useCallback } from "react";

export const NOTE_COLORS = {
  yellow: { bg: "#fef9c3", header: "#fde047", text: "#713f12" },
  blue:   { bg: "#dbeafe", header: "#93c5fd", text: "#1e3a5f" },
  green:  { bg: "#dcfce7", header: "#86efac", text: "#14532d" },
  pink:   { bg: "#ffe4e6", header: "#fda4af", text: "#881337" },
  purple: { bg: "#f3e8ff", header: "#c4b5fd", text: "#4c1d95" },
};

export const PIN_OPTIONS = [
  { value: "everywhere",  label: "Everywhere"  },
  { value: "/",           label: "Main"        },
  { value: "/actions",    label: "Actions"     },
  { value: "/system",     label: "System"      },
  { value: "/statistics", label: "Statistics"  },
  { value: "/settings",   label: "Settings"    },
];

const NotesContext = createContext(null);

const STORAGE_KEY   = "cynet_notes";
const ENABLED_KEY   = "cynet_notes_enabled";

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
  catch { return []; }
}

export function NotesProvider({ children }) {
  const [notes,   setNotes]   = useState(load);
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem(ENABLED_KEY) !== "false"
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(ENABLED_KEY, String(enabled));
  }, [enabled]);

  const addNote = useCallback((color = "yellow", pinTo = "everywhere") => {
    const id = Date.now().toString();
    setNotes((prev) => [
      ...prev,
      {
        id,
        text: "",
        color,
        pinTo,
        position: { x: 120 + (prev.length % 5) * 30, y: 90 + (prev.length % 4) * 24 },
        createdAt: new Date().toISOString(),
      },
    ]);
    return id;
  }, []);

  const updateNote = useCallback((id, changes) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...changes } : n)));
  }, []);

  const deleteNote = useCallback((id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => setNotes([]), []);

  return (
    <NotesContext.Provider value={{ notes, enabled, setEnabled, addNote, updateNote, deleteNote, clearAll }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  return useContext(NotesContext);
}
