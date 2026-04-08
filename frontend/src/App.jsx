import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { NotesProvider, useNotes } from "./context/NotesContext";
import NoteWidget from "./components/NoteWidget";
import Dashboard from "./pages/Dashboard";
import EndpointsPage      from "./pages/EndpointsPage";
import UsersPage          from "./pages/UsersPage";
import EmailPage          from "./pages/EmailPage";
import SaasPage           from "./pages/SaasPage";
import MobilePage         from "./pages/MobilePage";
import GenericSectionPage from "./pages/GenericSectionPage";
import NetworkPage        from "./pages/NetworkPage";
import ActionsPage        from "./pages/ActionsPage";
import ForensicPage       from "./pages/ForensicPage";
import StatisticsPage     from "./pages/StatisticsPage";
import SettingsPage       from "./pages/SettingsPage";
import ChatPage           from "./pages/ChatPage";
import ChatWidget         from "./components/ChatWidget";
import { useSecurityData } from "./hooks/useSecurityData";
import "./pages/SectionPage.css";

const SECTION_PAGES = {
  endpoints: EndpointsPage,
  users:     UsersPage,
  email:     EmailPage,
  saas:      SaasPage,
  mobile:    MobilePage,
};

function SectionRouter() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { data, loading, error } = useSecurityData();

  if (loading) return <div className="sp-center">Loading…</div>;
  if (error)   return <div className="sp-center sp-center--err">Error: {error}</div>;

  const section = data?.sections.find((s) => s.id === id);
  if (!section) return (
    <div className="sp-center">
      Section not found.{" "}
      <button onClick={() => navigate("/")}>← Back</button>
    </div>
  );

  const Page = SECTION_PAGES[id];
  if (Page) return <Page />;
  return <GenericSectionPage section={section} />;
}

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
            <Route path="/"             element={<Dashboard />}      />
            <Route path="/section/:id"  element={<SectionRouter />}  />
            <Route path="/networks"     element={<NetworkPage />}     />
            <Route path="/actions"      element={<ActionsPage />}     />
            <Route path="/system"       element={<ForensicPage />}    />
            <Route path="/statistics"   element={<StatisticsPage />}  />
            <Route path="/settings"     element={<SettingsPage />}    />
            <Route path="/help-bot"     element={<ChatPage />}        />
            <Route path="*"             element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <ChatWidget />
        <NotesOverlay />
      </NotesProvider>
    </BrowserRouter>
  );
}
