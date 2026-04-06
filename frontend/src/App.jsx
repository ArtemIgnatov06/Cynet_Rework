import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import SectionPage from "./pages/SectionPage";
import NetworkPage from "./pages/NetworkPage";
import ActionsPage from "./pages/ActionsPage";
import ForensicPage from "./pages/ForensicPage";
import StatisticsPage from "./pages/StatisticsPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/section/:id" element={<SectionPage />} />
          <Route path="/networks" element={<NetworkPage />} />
          <Route path="/actions" element={<ActionsPage />} />
          <Route path="/system" element={<ForensicPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}