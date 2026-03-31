import { useNavigate, useLocation } from "react-router-dom";
import cynetLogo from "../assets/cynet-logo.png";
import "./Navbar.css";

const NAV_LINKS = [
  { path: "/",                   label: "Overview"    },
  { path: "/section/endpoints",  label: "Endpoints"   },
  { path: "/section/network",    label: "Network"     },
  { path: "/section/users",      label: "Users"       },
  { path: "/section/email",      label: "Email"       },
  { path: "/section/saas",       label: "SaaS & Cloud" },
  { path: "/section/mobile",     label: "Mobile"      },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar__brand" onClick={() => navigate("/")}>
        <img src={cynetLogo} alt="Cynet" className="navbar__logo" />
        <span className="navbar__name">CYNET</span>
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
    </nav>
  );
}
