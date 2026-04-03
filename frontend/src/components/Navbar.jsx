import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IconDownload, IconSettings, IconUser } from "./Icons";
import "./Navbar.css";

const NAV_LINKS = [
  { path: "/",           label: "Main"       },
  { path: "/actions",    label: "Actions"    },
  { path: "/system",     label: "System"     },
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
      if (dlRef.current && !dlRef.current.contains(e.target)) setDlOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="navbar">
      {/* ── Logo ── */}
      <div className="navbar__brand" onClick={() => navigate("/")}>
        <svg
          width="98"
          height="24"
          viewBox="0 0 98 24"
          xmlns="http://www.w3.org/2000/svg"
          className="navbar__logo-svg"
          aria-label="Cynet"
        >
          <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M16.8828 23.1666H17.1288C18.7211 23.1514 20.2953 22.8443 21.7655 22.2642C23.2838 21.669 24.666 20.7951 25.8282 19.6919C27.2885 18.3081 28.3526 16.5963 28.9207 14.7158C28.7847 14.9509 28.6307 15.1746 28.4646 15.3907V15.5423H28.3466C28.1626 15.7679 27.9666 15.984 27.7525 16.1869C26.4083 17.455 24.594 18.1697 22.6977 18.1773C20.9874 18.1924 19.3412 17.5593 18.127 16.42L12.9481 11.5122L17.8829 6.8376C19.1871 5.59217 20.9654 4.89458 22.8177 4.90026C24.672 4.89647 26.4463 5.59406 27.7545 6.8376C27.9866 7.0556 28.1986 7.29065 28.3946 7.53519H28.4666V7.63187C28.6187 7.83091 28.7627 8.03564 28.8907 8.24984C28.3086 6.41298 27.2604 4.73913 25.8302 3.37997C23.5498 1.20757 20.4473 -0.00752749 17.2168 5.50359e-05C13.9863 -0.00942312 10.8878 1.20568 8.6074 3.37617L0 11.5388L9.03347 20.0994C11.1238 22.0595 13.9443 23.1609 16.8848 23.1666H16.8828Z"/>
          <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M62.2359 6.61567L62.0919 6.74079C60.9917 7.84215 60.3816 9.30178 60.3856 10.8183V18.0198H63.078V10.8069C63.088 9.90839 63.4701 9.04777 64.1382 8.41084C64.8103 7.76822 65.7265 7.40426 66.6806 7.40426C67.6288 7.41374 68.5369 7.77391 69.209 8.40894C69.8891 9.04587 70.2712 9.91218 70.2712 10.8164V18.0805H72.9636V10.8069C72.9596 9.22975 72.2975 7.71893 71.1193 6.6062C68.6629 4.28405 64.6863 4.28784 62.2359 6.61567Z"/>
          <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M53.6152 21.3052C54.2473 20.5905 54.7374 19.7754 55.0655 18.8977L60.1303 5.22266H57.2778L53.8053 14.6003L49.6286 5.22266H46.6441L52.4651 18.1584L52.383 18.3442C52.159 18.856 51.851 19.3318 51.4709 19.7527C50.7268 20.5773 49.6706 21.0929 48.5284 21.1896V23.7449C50.5107 23.6463 52.357 22.7591 53.6152 21.3052Z"/>
          <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M88.6889 9.97936V9.92628C88.3849 8.80596 87.7808 7.77853 86.9366 6.94066C84.2142 4.24507 79.6995 4.15029 76.855 6.73024L76.737 6.84209C75.4048 8.11026 74.6566 9.82581 74.6586 11.6153C74.6586 15.3516 77.8552 18.3808 81.7978 18.3808C83.8121 18.3808 85.7345 17.5714 87.0787 16.1496L84.9483 14.5668C84.1142 15.38 82.966 15.835 81.7698 15.8255C80.1295 15.8236 78.6213 14.9668 77.8472 13.5962L77.4511 12.8948H88.7769C88.861 12.4702 88.903 12.0399 88.901 11.6096C88.911 11.0788 88.851 10.5499 88.7209 10.0343L88.6909 9.97746L88.6889 9.97936ZM77.4431 10.3433L77.8392 9.64193C78.6193 8.27139 80.1295 7.41457 81.7738 7.40888L81.7698 7.40319C82.5799 7.40319 83.3741 7.61361 84.0662 8.0098C84.7503 8.40598 85.3124 8.96899 85.6944 9.63814L86.0945 10.3414H77.4411L77.4431 10.3433Z"/>
          <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M38.0326 15.2704C35.8783 14.1141 35.1202 11.5209 36.3404 9.47926C36.6324 8.99209 37.0245 8.56367 37.4925 8.21867C39.4489 6.78178 42.2653 7.1192 43.7816 8.97503L46.128 7.61965C44.7757 5.81501 42.5874 4.74208 40.253 4.73829C36.2663 4.7326 33.0318 7.79026 33.0238 11.5683C33.0178 15.3462 36.2443 18.4115 40.231 18.4191H40.235C42.6494 18.4191 44.9038 17.2722 46.242 15.3652L43.8656 14.08C42.5234 15.8239 40.015 16.3377 38.0326 15.2723V15.2704Z"/>
          <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M94.6991 1.75781L92.0067 2.53123V5.22303H89.4803V7.77455H92.0067V14.178C92.0107 16.5001 93.991 18.3825 96.4394 18.3958H97.9977V15.848H96.4554C95.4873 15.8386 94.7071 15.0974 94.6991 14.1799V7.77455H97.9977V5.22113H94.6991V1.75781Z"/>
          <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M28.3942 7.53516C28.4182 7.56738 28.4422 7.59961 28.4662 7.63183V7.53516H28.3942Z"/>
          <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M28.4665 15.5423V15.3906C28.4285 15.4418 28.3885 15.4911 28.3484 15.5423H28.4665Z"/>
          <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M24.2618 7.53516H24.2198C21.9034 7.54653 20.0271 9.32274 20.0171 11.5179V11.5577C20.0291 13.7604 21.9154 15.5423 24.2418 15.5423C26.5682 15.5423 28.4665 13.749 28.4665 11.5387C28.4665 9.32843 26.5862 7.54653 24.2618 7.53516Z"/>
        </svg>
      </div>

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

      <div className="navbar__controls">
        <div className="navbar__dl-wrap" ref={dlRef}>
          <button
            className={`navbar__ctrl-btn navbar__download-btn ${dlOpen ? "navbar__download-btn--open" : ""}`}
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

        <button
          className="navbar__helpbot-btn"
          title="Open Help Bot"
          onClick={() => navigate("/help-bot")}
        >
          <span className="navbar__helpbot-icon">?</span>
          <span>Help-bot</span>
        </button>

        <button
          className={`navbar__ctrl-icon ${pathname.startsWith("/settings") ? "navbar__ctrl-icon--active" : ""}`}
          title="Settings"
          onClick={() => navigate("/settings")}
        >
          <IconSettings size={17} />
        </button>

        <button className="navbar__profile" title="Profile">
          <IconUser size={16} color="#0ea5e9" />
          <span className="navbar__profile-name">Adeline Internal</span>
        </button>
      </div>
    </nav>
  );
}