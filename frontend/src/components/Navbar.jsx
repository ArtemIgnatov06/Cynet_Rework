import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IconDownload, IconSettings, IconUser } from "./Icons";
import "./Navbar.css";

const NAV_LINKS = [
  { path: "/", label: "Main" },
  { path: "/actions", label: "Actions" },
  { path: "/system", label: "System" },
  { path: "/statistics", label: "Statistics" },
];

const DOWNLOAD_ITEMS = [
  {
    id: "dist",
    icon: "↓",
    title: "Cynet Distribution Tool",
    desc: "For installing the Cynet agent on multiple endpoints on the network",
  },
  {
    id: "pkg",
    icon: "□",
    title: "Cynet Package",
    desc: "For SCCM distribution or installing the Cynet agent on a single endpoint",
  },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [dlOpen, setDlOpen] = useState(false);
  const dlRef = useRef(null);

  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  useEffect(() => {
    const handler = (e) => {
      if (dlRef.current && !dlRef.current.contains(e.target)) {
        setDlOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="navbar">
      {/* ── Logo ── */}
      <div className="navbar__brand" onClick={() => navigate("/")}>
        <span className="navbar__name">CYNET</span>
      </div>

      {/* ── Nav links ── */}
      <ul className="navbar__links">
        {NAV_LINKS.map(({ path, label }) => (
          <li key={path}>
            <button
              className={`navbar__link ${isActive(path) ? "navbar__link--active" : ""}`}
              onClick={() => navigate(path)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      {/* ── Right controls ── */}
      <div className="navbar__controls">
        {/* Download */}
        <div className="navbar__dl-wrap" ref={dlRef}>
          <button
            className={`navbar__ctrl-btn navbar__download-btn ${
              dlOpen ? "navbar__download-btn--open" : ""
            }`}
            onClick={() => setDlOpen((v) => !v)}
          >
            <IconDownload size={16} />
            <span>Download</span>
          </button>

          {dlOpen && (
            <div className="navbar__dl-dropdown">
              <div className="navbar__dl-header">
                <span className="navbar__dl-title">Adeline Internal</span>
                <IconDownload size={14} color="#94a3b8" />
              </div>
              {DOWNLOAD_ITEMS.map((item) => (
                <div key={item.id} className="navbar__dl-item">
                  <div className="navbar__dl-item-icon">{item.icon}</div>
                  <div className="navbar__dl-item-body">
                    <span className="navbar__dl-item-name">{item.title}</span>
                    <span className="navbar__dl-item-desc">{item.desc}</span>
                  </div>
                  <button className="navbar__dl-item-btn">Download</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NEW HELP BOT BUTTON */}
        <button
          className="navbar__helpbot-btn"
          title="Open Help Bot"
          onClick={() => navigate("/help-bot")}
        >
          🤖
          <span>Help-bot</span>
        </button>

        {/* Settings */}
        <button
          className={`navbar__ctrl-icon ${
            pathname.startsWith("/settings") ? "navbar__ctrl-icon--active" : ""
          }`}
          title="Settings"
          onClick={() => navigate("/settings")}
        >
          <IconSettings size={17} />
        </button>

        {/* Profile */}
        <button className="navbar__profile" title="Profile">
          <IconUser size={16} color="#0ea5e9" />
          <span className="navbar__profile-name">Adeline Internal</span>
        </button>
      </div>
    </nav>
  );
}