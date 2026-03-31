import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const NAV_LINKS = [
  { path: "/",             label: "Overview"    },
  { path: "/section/endpoints", label: "Endpoints"   },
  { path: "/section/network",   label: "Network"     },
  { path: "/section/users",     label: "Users"       },
  { path: "/section/email",     label: "Email"       },
  { path: "/section/saas",      label: "SaaS & Cloud" },
  { path: "/section/mobile",    label: "Mobile"      },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar__brand" onClick={() => navigate("/")}>
        <span className="navbar__shield">⬡</span>
        <span className="navbar__name">CYNET</span>
        <span className="navbar__tag">Protected</span>
      </div>

      <ul className="navbar__links">
        {NAV_LINKS.map(({ path, label }) => (
          <li key={path}>
            <button
              className={`navbar__link ${pathname === path ? "navbar__link--active" : ""}`}
              onClick={() => navigate(path)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      <div className="navbar__right">
        <div className="navbar__live">
          <span className="navbar__live-dot" />
          Live
        </div>
      </div>
    </nav>
  );
}
