import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatPage.css";

// ─── Mock bot responses ───────────────────────────────────────────────────────
const BOT_RESPONSES = [
  {
    keywords: ["alert", "alerts", "алерт"],
    reply: "Alerts in Cynet are automatically prioritized by severity — **Critical**, **High**, **Medium**, and **Low**. You can configure notification channels under **Settings → Alerts**. Would you like help tuning the alert thresholds?",
  },
  {
    keywords: ["group", "groups", "группа", "группы"],
    reply: "Groups let you organize endpoints by OS, function, or geography. You can assign scan profiles and EPP policies per group. Head to **Settings → Groups** to create or edit a group. Need help with group policies?",
  },
  {
    keywords: ["endpoint", "endpoints", "эндпоинт"],
    reply: "Cynet monitors all enrolled endpoints in real time. You can view host status, isolation state, and agent health in the **Endpoints** section. Want to know how to isolate a compromised host?",
  },
  {
    keywords: ["isolat", "isolated", "изол"],
    reply: "To isolate a host, go to **Actions → Hosts → API Call Actions** and trigger a Host Isolation action. The endpoint will be cut off from the network while staying connected to the Cynet management plane so you can still remediate it.",
  },
  {
    keywords: ["malware", "virus", "threat", "угроза"],
    reply: "If a threat is detected, Cynet can automatically quarantine or delete the malicious file depending on your **Auto Remediation** rules. You can review all detections in **Actions → Files → Script Actions**.",
  },
  {
    keywords: ["scan", "antivirus", "av", "сканиров"],
    reply: "Antivirus scans can be scheduled per group or triggered on-demand from an endpoint. Check **Actions → Hosts → Antivirus Actions** for full scan history including scan profiles, status, and any found threats.",
  },
  {
    keywords: ["integration", "siem", "splunk", "интеграц"],
    reply: "Cynet supports integrations with SIEM platforms (Splunk, QRadar, ArcSight), SOAR tools, and ticketing systems. Navigate to **Settings → Integrations** to configure webhooks, API keys, and data forwarding.",
  },
  {
    keywords: ["report", "отчет", "отчёт"],
    reply: "You can generate security reports from the **Statistics** page. Reports cover alert trends, risk scores, protected categories, and module activity. Do you need a specific report type?",
  },
  {
    keywords: ["user", "uba", "activity", "пользоват"],
    reply: "User Behavior Analytics (UBA) tracks anomalous user actions like unusual login times, lateral movement, and privilege escalation attempts. Configure detection sensitivity in **Settings → User Activity (UBA)**.",
  },
  {
    keywords: ["playbook", "автомат", "automat", "remediat"],
    reply: "Playbooks automate response workflows — for example, isolating a host when ransomware is detected. You can create, clone, and enable them in **Actions → Playbooks**. Want to see example playbook templates?",
  },
  {
    keywords: ["hi", "hello", "hey", "привет", "здравствуй", "добрый"],
    reply: "Hello! I'm the **Cynet AI Assistant**. I can help you navigate the platform, understand alerts, configure settings, or investigate threats. What can I help you with today?",
  },
  {
    keywords: ["thank", "thanks", "спасиб"],
    reply: "You're welcome! If you have any other questions about Cynet, I'm always here. Stay secure! 🛡️",
  },
];

const QUICK_ACTIONS = [
  "How do I isolate an endpoint?",
  "Explain the alert severity levels",
  "How to set up integrations?",
  "What is UBA?",
];

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "bot",
  text: "Hi! I'm your **Cynet AI Assistant**. I can help you navigate the platform, investigate threats, configure settings, and understand your security posture.\n\nWhat would you like to know?",
  ts: new Date(),
};

function getBotReply(text) {
  const lower = text.toLowerCase();
  for (const entry of BOT_RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.reply;
    }
  }
  return "I don't have a specific answer for that yet, but I'm learning! You can also check the **Cynet documentation** or reach out to your account manager. Is there something else I can help you with?";
}

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
function renderText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part.split("\n").map((line, j, arr) => (
      <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
    ));
  });
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

// ─── Bot avatar ───────────────────────────────────────────────────────────────
function BotAvatar({ size = 32 }) {
  return (
    <div className="chat-avatar" style={{ width: size, height: size }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
          fill="rgba(14,165,233,0.25)" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="#7dd3fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="chat-msg chat-msg--bot">
      <BotAvatar />
      <div className="chat-bubble chat-bubble--bot chat-bubble--typing">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

// ─── Single message ───────────────────────────────────────────────────────────
function Message({ msg }) {
  const isBot = msg.role === "bot";
  const time = msg.ts.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`chat-msg chat-msg--${isBot ? "bot" : "user"}`}>
      {isBot && <BotAvatar />}
      <div className={`chat-bubble chat-bubble--${isBot ? "bot" : "user"}`}>
        <div className="chat-bubble__text">{renderText(msg.text)}</div>
        <span className="chat-bubble__time">{time}</span>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages]     = useState([WELCOME_MESSAGE]);
  const [input, setInput]           = useState("");
  const [typing, setTyping]         = useState(false);
  const [quickDone, setQuickDone]   = useState(false);
  const bottomRef  = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg = { id: Date.now(), role: "user", text: trimmed, ts: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setQuickDone(true);
    setTyping(true);

    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        role: "bot",
        text: getBotReply(trimmed),
        ts: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, delay);
  }, [typing]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const handleNewChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setTyping(false);
    setQuickDone(false);
  };

  return (
    <div className="chat-page">
      {/* ── Left sidebar ── */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar__top">
          <button className="chat-sidebar__back" onClick={() => navigate(-1)}>
            <IconArrowLeft /> Back
          </button>
          <button className="chat-sidebar__new" onClick={handleNewChat}>
            <IconPlus /> New chat
          </button>
        </div>

        <div className="chat-sidebar__history">
          <p className="chat-sidebar__history-label">Recent</p>
          {[
            "Alert investigation workflow",
            "Endpoint isolation steps",
            "UBA configuration help",
            "Integrations setup",
          ].map((title, i) => (
            <button key={i} className={`chat-sidebar__item ${i === 0 ? "chat-sidebar__item--active" : ""}`}>
              {title}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Chat main ── */}
      <div className="chat-main">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header__identity">
            <BotAvatar size={36} />
            <div>
              <div className="chat-header__name">Cynet AI Assistant</div>
              <div className="chat-header__status">
                <span className="chat-header__dot" />
                Online
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <Message key={msg.id} msg={msg} />
          ))}

          {/* Quick actions after welcome */}
          {!quickDone && messages.length === 1 && (
            <div className="chat-quick">
              {QUICK_ACTIONS.map((q) => (
                <button key={q} className="chat-quick__btn" onClick={() => send(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {typing && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-wrap">
          <div className="chat-input-box">
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder="Ask anything about Cynet…"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className={`chat-send-btn ${input.trim() && !typing ? "chat-send-btn--active" : ""}`}
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
            >
              <IconSend />
            </button>
          </div>
          <p className="chat-input-hint">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
