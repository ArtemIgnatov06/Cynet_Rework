import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./ChatWidget.css";

const AGENT_URL = (import.meta.env.VITE_AGENT_URL ?? "http://localhost:8000") + "/chat";

async function fetchBotReply(query) {
  const res = await fetch(AGENT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  const data = await res.json();
  const sourceLine = data.sources?.length
    ? "\n\n**Sources:** " + data.sources.map((s) => s.title).filter(Boolean).join(", ")
    : "";
  return data.answer + sourceLine;
}

const QUICK_ACTIONS = [
  "How do I isolate an endpoint?",
  "Explain alert severity levels",
  "How to set up integrations?",
];

const WELCOME = {
  id: "w",
  role: "bot",
  text: "Hi! I'm your **Cynet AI Assistant**.\nAsk me anything about the platform.",
  ts: new Date(),
};

function renderText(text) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer">{children}</a>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconClose = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconExpand = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);
const IconSend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconChat = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

function BotAvatar({ size = 28 }) {
  return (
    <div className="cw-avatar" style={{ width: size, height: size }}>
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
          fill="rgba(14,165,233,0.2)" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="#7dd3fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="cw-msg cw-msg--bot">
      <BotAvatar />
      <div className="cw-bubble cw-bubble--bot cw-bubble--typing">
        <span className="cw-dot"/><span className="cw-dot"/><span className="cw-dot"/>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isBot = msg.role === "bot";
  return (
    <div className={`cw-msg cw-msg--${isBot ? "bot" : "user"}`}>
      {isBot && <BotAvatar />}
      <div className={`cw-bubble cw-bubble--${isBot ? "bot" : "user"}`}>
        <div className="cw-bubble__text">{renderText(msg.text)}</div>
      </div>
    </div>
  );
}

// ─── Widget ───────────────────────────────────────────────────────────────────
export default function ChatWidget() {
  const navigate = useNavigate();
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput]       = useState("");
  const [typing, setTyping]     = useState(false);
  const [quickDone, setQuickDone] = useState(false);
  const [unread, setUnread]     = useState(0);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Listen for toggle event from Navbar
  useEffect(() => {
    const handler = () => setOpen((v) => !v);
    window.addEventListener("toggle-chat-widget", handler);
    return () => window.removeEventListener("toggle-chat-widget", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: trimmed, ts: new Date() }]);
    setInput("");
    setQuickDone(true);
    setTyping(true);

    try {
      const reply = await fetchBotReply(trimmed);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: reply, ts: new Date() }]);
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: "⚠️ Agent server unavailable. Try opening the full assistant.", ts: new Date() }]);
    } finally {
      setTyping(false);
    }
  }, [typing, open]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const openFull = () => { setOpen(false); navigate("/help-bot"); };

  return (
    <>
      {/* ── Panel ── */}
      <div className={`cw-panel ${open ? "cw-panel--open" : ""}`}>
        {/* Header */}
        <div className="cw-header">
          <div className="cw-header__left">
            <BotAvatar size={34} />
            <div>
              <div className="cw-header__name">Cynet AI</div>
              <div className="cw-header__status"><span className="cw-header__dot"/>Online</div>
            </div>
          </div>
          <div className="cw-header__actions">
            <button className="cw-header__btn" title="Open full chat" onClick={openFull}>
              <IconExpand />
            </button>
            <button className="cw-header__btn" title="Close" onClick={() => setOpen(false)}>
              <IconClose />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="cw-messages">
          {messages.map((m) => <Message key={m.id} msg={m} />)}

          {!quickDone && messages.length === 1 && (
            <div className="cw-quick">
              {QUICK_ACTIONS.map((q) => (
                <button key={q} className="cw-quick__btn" onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          )}

          {typing && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="cw-input-wrap">
          <input
            ref={inputRef}
            className="cw-input"
            placeholder="Ask anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            className={`cw-send ${input.trim() && !typing ? "cw-send--active" : ""}`}
            onClick={() => send(input)}
            disabled={!input.trim() || typing}
          >
            <IconSend />
          </button>
        </div>

        {/* Footer link */}
        <button className="cw-fullpage-btn" onClick={openFull}>
          <IconExpand /> Open full assistant
        </button>
      </div>

      {/* ── FAB button ── */}
      <button
        className={`cw-fab ${open ? "cw-fab--open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        title="Cynet AI Assistant"
      >
        <span className="cw-fab__icon">
          {open ? <IconClose /> : <IconChat />}
        </span>
        {unread > 0 && !open && (
          <span className="cw-fab__badge">{unread}</span>
        )}
      </button>
    </>
  );
}
