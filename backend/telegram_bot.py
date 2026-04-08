"""
Cynet Telegram Bot
──────────────────
Commands:
  /start   — subscribe to alert notifications + welcome
  /status  — live security overview from backend
  /alerts  — list current active alerts
  /stop    — unsubscribe from notifications
  /help    — command reference

Any other text message → forwarded to the Cynet AI agent (/chat endpoint).

Required in backend/.env:
  TELEGRAM_BOT_TOKEN=<your token from @BotFather>

Optional:
  BACKEND_URL=http://localhost:8000   (default)
  ALERT_POLL_SECS=60                  (default)
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from pathlib import Path

import httpx
from dotenv import load_dotenv
import telegram
from telegram import BotCommand, Update
from telegram.constants import ParseMode
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

# ── Config ────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent
_env = ROOT / ".env"
_env_agent = ROOT / "agent" / ".env"
load_dotenv(_env if _env.exists() else _env_agent)

TOKEN       = os.getenv("TELEGRAM_BOT_TOKEN", "")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000").rstrip("/")
POLL_SECS   = int(os.getenv("ALERT_POLL_SECS", "60"))
SUBS_FILE   = ROOT / "telegram_subs.json"

if not TOKEN:
    sys.exit(
        "\n❌  TELEGRAM_BOT_TOKEN not set.\n"
        "   Add it to backend/.env:\n"
        "   TELEGRAM_BOT_TOKEN=123456:ABC-...\n"
        "   Get a token from @BotFather on Telegram.\n"
    )

# ── Subscription store (persisted to JSON) ────────────────────────────────────
def _load_subs() -> set[int]:
    if SUBS_FILE.exists():
        try:
            return set(json.loads(SUBS_FILE.read_text()))
        except Exception:
            pass
    return set()

def _save_subs(subs: set[int]) -> None:
    SUBS_FILE.write_text(json.dumps(list(subs)))

SUBS: set[int] = _load_subs()

# ── Backend API helpers ───────────────────────────────────────────────────────
_API_SECTIONS = ["devices", "network", "users", "email", "cloud", "mobile", "saasCloud"]

async def _fetch_sections() -> list[dict]:
    """Call all /api/* endpoints in parallel and return their payloads."""
    async with httpx.AsyncClient(timeout=12) as client:
        tasks = [
            client.get(f"{BACKEND_URL}/api/{s}?mode=critical&count=20")
            for s in _API_SECTIONS
        ]
        responses = await asyncio.gather(*tasks, return_exceptions=True)

    results = []
    for name, resp in zip(_API_SECTIONS, responses):
        if isinstance(resp, Exception):
            continue
        try:
            results.append({"_section": name, **resp.json()})
        except Exception:
            pass
    return results


async def _ask_agent(query: str) -> str:
    """POST query to the AI agent and return the answer text."""
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            f"{BACKEND_URL}/chat",
            json={"query": query, "top_k": 5},
        )
        r.raise_for_status()
        return r.json().get("answer", "No answer returned.")


# ── Alert helpers ─────────────────────────────────────────────────────────────
_SEV_EMOJI = {
    "critical": "🔴",
    "high":     "🟠",
    "medium":   "🟡",
    "low":      "🔵",
}

def _iter_incidents(sections: list[dict]):
    """Yield (section_name, incident_dict) for every incident across all sections."""
    for sec in sections:
        name = sec["_section"]
        for key in ("incidents", "events", "alerts", "issues"):
            items = sec.get(key)
            if not isinstance(items, list):
                continue
            for item in items:
                if isinstance(item, dict):
                    yield name, item


def _incident_fp(section: str, item: dict) -> str:
    """Unique fingerprint for deduplication."""
    uid = item.get("id") or f"{item.get('title','')}|{item.get('type','')}"
    return f"{section}:{uid}"


def _fmt_incident(section: str, item: dict) -> str:
    sev   = item.get("severity", "").lower()
    emoji = _SEV_EMOJI.get(sev, "⚠️")
    title = item.get("title") or item.get("type") or "Alert"
    desc  = item.get("description") or item.get("target") or item.get("details") or ""
    ts    = item.get("timestamp") or item.get("time") or ""
    if ts:
        try:
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00")).strftime("%d %b %H:%M")
            ts = f" · _{ts}_"
        except Exception:
            ts = ""
    return f"{emoji} *{sev.upper()}* · {section.upper()}{ts}\n*{title}*\n{desc}".strip()


def _section_status_line(section: str, incidents: list[dict]) -> str:
    if not incidents:
        return f"✅ *{section.capitalize()}* — secure"
    counts: dict[str, int] = {}
    for inc in incidents:
        s = inc.get("severity", "unknown").lower()
        counts[s] = counts.get(s, 0) + 1
    worst = next(
        (s for s in ("critical", "high", "medium", "low") if counts.get(s)),
        "unknown",
    )
    emoji = _SEV_EMOJI.get(worst, "⚠️")
    detail = ", ".join(f"{v} {k}" for k, v in counts.items())
    return f"{emoji} *{section.capitalize()}* — {detail}"


# ── Known-alerts tracker (for change notifications) ───────────────────────────
_known_fps: set[str] = set()
_poller_initialized = False

# ── Regime tracker ────────────────────────────────────────────────────────────
_known_regime: str | None = None

_REGIME_MSG = {
    "all_good":   "✅ *TEST MODE: ALL GOOD*\nAll systems switched to secure — no active threats.",
    "all_yellow": "🟠 *TEST MODE: WARNING*\nMultiple systems showing warning status. Review recommended.",
    "all_red":    "🔴 *TEST MODE: CRITICAL*\nCritical threats detected across all systems! Immediate action required.",
    "realistic":  "📊 *TEST MODE: RESET*\nDashboard returned to realistic data mode.",
}


# ── Command handlers ──────────────────────────────────────────────────────────
_HELP_TEXT = (
    "🛡 *Cynet Security Bot*\n\n"
    "*/start*  — subscribe to alert notifications\n"
    "*/status* — live security overview\n"
    "*/alerts* — current active alerts\n"
    "*/stop*   — unsubscribe from notifications\n"
    "*/help*   — this message\n\n"
    "💬 Send any text to chat with the Cynet AI agent."
)


async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    cid = update.effective_chat.id
    SUBS.add(cid)
    _save_subs(SUBS)
    await update.message.reply_text(
        _HELP_TEXT + "\n\n✅ *Subscribed* to alert notifications.",
        parse_mode=ParseMode.MARKDOWN,
    )


async def cmd_help(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(_HELP_TEXT, parse_mode=ParseMode.MARKDOWN)


async def cmd_stop(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    cid = update.effective_chat.id
    SUBS.discard(cid)
    _save_subs(SUBS)
    await update.message.reply_text(
        "🔕 Unsubscribed from notifications.\nSend /start to re-subscribe."
    )


async def cmd_status(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    msg = await update.message.reply_text("⏳ Fetching security data…")

    sections = await _fetch_sections()
    if not sections:
        await msg.edit_text(
            "❌ Could not reach the backend.\nMake sure `uvicorn main:app` is running."
        )
        return

    # Group incidents by section
    by_section: dict[str, list[dict]] = {s["_section"]: [] for s in sections}
    for sname, inc in _iter_incidents(sections):
        by_section.setdefault(sname, []).append(inc)

    total_crit = sum(
        1 for _, inc in _iter_incidents(sections)
        if inc.get("severity", "").lower() == "critical"
    )
    total_high = sum(
        1 for _, inc in _iter_incidents(sections)
        if inc.get("severity", "").lower() == "high"
    )

    ts = datetime.now().strftime("%d %b %Y, %H:%M")
    lines = [f"🛡 *Security Overview*", f"_{ts}_\n"]
    for sname, incs in by_section.items():
        lines.append(_section_status_line(sname, incs))

    overall = (
        "🔴 *Overall: CRITICAL*"
        if total_crit
        else "🟠 *Overall: WARNING*"
        if total_high
        else "✅ *Overall: SECURE*"
    )
    lines.append(f"\n{overall}")
    if total_crit or total_high:
        lines.append(f"_{total_crit} critical · {total_high} high severity_")
    lines.append("\nUse /alerts for full details.")

    await msg.edit_text("\n".join(lines), parse_mode=ParseMode.MARKDOWN)


async def cmd_alerts(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    msg = await update.message.reply_text("⏳ Loading alerts…")

    sections = await _fetch_sections()
    alert_blocks = [
        _fmt_incident(sname, inc)
        for sname, inc in _iter_incidents(sections)
        if inc.get("severity", "").lower() in ("critical", "high", "medium")
    ]

    if not alert_blocks:
        await msg.edit_text("✅ No active alerts — all systems look secure.")
        return

    header = f"🚨 *Active Alerts* ({len(alert_blocks)})\n"
    body = "\n\n".join(alert_blocks)
    text = header + "\n" + body
    if len(text) > 4000:
        text = text[:3990] + "\n…_(truncated)_"

    await msg.edit_text(text, parse_mode=ParseMode.MARKDOWN)


async def handle_message(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    """Proxy any text message to the AI agent."""
    query = (update.message.text or "").strip()
    if not query:
        return

    typing = await update.message.reply_text("🤔 Thinking…")
    try:
        answer = await _ask_agent(query)
        if len(answer) > 4000:
            answer = answer[:3990] + "\n…_(truncated)_"
        await typing.edit_text(answer, parse_mode=ParseMode.MARKDOWN)
    except httpx.ConnectError:
        await typing.edit_text(
            "❌ Could not reach the backend. Is it running?\n"
            "`uvicorn main:app --reload --port 8000`"
        )
    except Exception as e:
        await typing.edit_text(f"❌ Agent error: {e}")


# ── Background alert poller ───────────────────────────────────────────────────
async def _check_regime(app: Application) -> None:
    """Check if the dashboard test regime changed and notify subscribers."""
    global _known_regime
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(f"{BACKEND_URL}/api/regime")
            r.raise_for_status()
            regime = r.json().get("mode")

        if regime == _known_regime:
            return
        prev = _known_regime
        _known_regime = regime

        # Skip notification on very first check (just initializing)
        if prev is None:
            return

        text = _REGIME_MSG.get(regime, f"📊 *Dashboard mode changed:* `{regime}`")
        for cid in list(SUBS):
            try:
                await app.bot.send_message(cid, text, parse_mode=ParseMode.MARKDOWN)
            except Exception as e:
                print(f"[bot] Failed to notify {cid}: {e}")

    except Exception as e:
        print(f"[bot] Regime check error: {e}")


async def _alert_poller(app: Application) -> None:
    global _known_fps, _poller_initialized

    print(f"[bot] Alert poller started — checking every {POLL_SECS}s")

    # Regime check runs every 10s regardless of POLL_SECS
    regime_tick = 0

    while True:
        await asyncio.sleep(10)
        regime_tick += 10

        # Always check regime every 10 seconds
        await _check_regime(app)

        # Check real alerts at full POLL_SECS interval
        if regime_tick < POLL_SECS:
            continue
        regime_tick = 0

        try:
            sections = await _fetch_sections()
            current_fps = {
                _incident_fp(sname, inc)
                for sname, inc in _iter_incidents(sections)
            }

            if not _poller_initialized:
                _known_fps = current_fps
                _poller_initialized = True
                print(f"[bot] Poller initialized — tracking {len(_known_fps)} alerts")
                continue

            new_fps = current_fps - _known_fps
            _known_fps = current_fps

            if not new_fps or not SUBS:
                continue

            # Build notification
            new_incs = [
                (sname, inc)
                for sname, inc in _iter_incidents(sections)
                if _incident_fp(sname, inc) in new_fps
            ]
            header = f"🚨 *New Alert{'s' if len(new_incs) > 1 else ''}* (+{len(new_incs)})\n"
            blocks = [_fmt_incident(s, i) for s, i in new_incs]
            text = header + "\n" + "\n\n".join(blocks)
            if len(text) > 4000:
                text = text[:3990] + "\n…_(truncated)_"

            for cid in list(SUBS):
                try:
                    await app.bot.send_message(cid, text, parse_mode=ParseMode.MARKDOWN)
                except Exception as e:
                    print(f"[bot] Failed to notify {cid}: {e}")

        except Exception as e:
            print(f"[bot] Poller error: {e}")


async def _post_init(app: Application) -> None:
    await app.bot.set_my_commands([
        BotCommand("start",  "Subscribe & see welcome"),
        BotCommand("status", "Live security overview"),
        BotCommand("alerts", "Current active alerts"),
        BotCommand("stop",   "Unsubscribe from notifications"),
        BotCommand("help",   "Command reference"),
    ])
    asyncio.create_task(_alert_poller(app))
    print(f"[bot] Connected to backend: {BACKEND_URL}")


# ── Entry point ───────────────────────────────────────────────────────────────
async def _error_handler(_update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    err = context.error
    if isinstance(err, telegram.error.Conflict):
        print("[bot] Conflict: another instance is running, waiting 30s before retry…")
        await asyncio.sleep(30)
    else:
        print(f"[bot] Unhandled error: {err}")


def main() -> None:
    app = (
        Application.builder()
        .token(TOKEN)
        .post_init(_post_init)
        .build()
    )

    app.add_handler(CommandHandler("start",  cmd_start))
    app.add_handler(CommandHandler("help",   cmd_help))
    app.add_handler(CommandHandler("stop",   cmd_stop))
    app.add_handler(CommandHandler("status", cmd_status))
    app.add_handler(CommandHandler("alerts", cmd_alerts))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    app.add_error_handler(_error_handler)

    print(f"[bot] Starting Cynet Telegram Bot…")
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
