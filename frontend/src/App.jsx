import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { NotesProvider, useNotes } from "./context/NotesContext";
import NoteWidget from "./components/NoteWidget";
import Dashboard from "./pages/Dashboard";
import SectionPage from "./pages/SectionPage";
import ActionsPage from "./pages/ActionsPage";
import ForensicPage from "./pages/ForensicPage";
import StatisticsPage from "./pages/StatisticsPage";
import SettingsPage from "./pages/SettingsPage";
import ChatPage from "./pages/ChatPage";
import ChatWidget from "./components/ChatWidget";

function NotesOverlay() {
  const { notes, enabled } = useNotes();
  const { pathname } = useLocation();
  if (!enabled) return null;
  return notes
    .filter((n) => n.pinTo === "everywhere" || n.pinTo === pathname)
    .map((n) => <NoteWidget key={n.id} note={n} />);
}

export default function App() {
  return (
    <BrowserRouter>
      <NotesProvider>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"              element={<Dashboard />}    />
          <Route path="/section/:id"  element={<SectionPage />}  />
          <Route path="/actions"      element={<ActionsPage />}  />
          <Route path="/system"       element={<ForensicPage />} />
          <Route path="/statistics"   element={<StatisticsPage />} />
          <Route path="/settings"     element={<SettingsPage />}  />
          <Route path="/help-bot"     element={<ChatPage />}      />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ChatWidget />
      <NotesOverlay />
      </NotesProvider>
    </BrowserRouter>
  );
}
