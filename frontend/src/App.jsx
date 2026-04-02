import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import SectionPage from "./pages/SectionPage";
import ActionsPage from "./pages/ActionsPage";
import ForensicPage from "./pages/ForensicPage";
import StatisticsPage from "./pages/StatisticsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"              element={<Dashboard />}    />
          <Route path="/section/:id"  element={<SectionPage />}  />
          <Route path="/actions"      element={<ActionsPage />}  />
          <Route path="/forensic"     element={<ForensicPage />} />
          <Route path="/statistics"   element={<StatisticsPage />} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
