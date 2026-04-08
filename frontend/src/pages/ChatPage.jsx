import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "../context/ThemeContext";
import "./ChatPage.css";

const AGENT_URL = (import.meta.env.VITE_AGENT_URL ?? "http://localhost:8000") + "/chat";

async function fetchBotReply(query) {
  const res = await fetch(AGENT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  const data = await res.json();
  return { answer: data.answer, sources: data.sources ?? [] };
}

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

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
function renderText(text) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // открывать ссылки в новой вкладке
        a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer">{children}</a>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
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
  const { setLight, setDark, theme } = useTheme();
  const [messages, setMessages]     = useState([WELCOME_MESSAGE]);
  const [input, setInput]           = useState("");
  const [typing, setTyping]         = useState(false);
  const [quickDone, setQuickDone]   = useState(false);
  const bottomRef  = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Detect theme commands locally without hitting the API
  const tryThemeCommand = useCallback((text) => {
    const t = text.toLowerCase();
    if (/(light|светл|белую|белая|белый)/.test(t) && /(theme|тему|тема|режим|mode)/.test(t)) {
      setLight();
      return "Switched to **light theme**! You can change it back anytime in **Settings → Appearance**.";
    }
    if (/(dark|тёмн|темн|чёрн|черн)/.test(t) && /(theme|тему|тема|режим|mode)/.test(t)) {
      setDark();
      return "Switched to **dark theme**! You can change it back anytime in **Settings → Appearance**.";
    }
    if (/(toggle|switch|поменяй|переключи).*(theme|тему|тема|режим)/.test(t)) {
      if (theme === "dark") { setLight(); return "Switched to **light theme**!"; }
      else                  { setDark();  return "Switched to **dark theme**!"; }
    }
    return null;
  }, [theme, setLight, setDark]);

  const send = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg = { id: Date.now(), role: "user", text: trimmed, ts: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setQuickDone(true);

    // Handle theme commands instantly without API call
    const themeReply = tryThemeCommand(trimmed);
    if (themeReply) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: themeReply, ts: new Date() }]);
      return;
    }

    setTyping(true);
    try {
      const { answer, sources } = await fetchBotReply(trimmed);
      const sourceLine = sources.length
        ? "\n\n**Sources:** " + sources.map((s) => s.title).filter(Boolean).join(", ")
        : "";
      const botMsg = {
        id: Date.now() + 1,
        role: "bot",
        text: answer + sourceLine,
        ts: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "bot", text: "⚠️ Could not reach the agent server. Make sure it's running on port 8000.", ts: new Date() },
      ]);
    } finally {
      setTyping(false);
    }
  }, [typing, tryThemeCommand]);

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
