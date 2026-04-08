import json
from pathlib import Path
from .regime import apply_global_mode
DATA_FILE = Path(__file__).parent / "src" / "email_data.json"


def _build_email_payload(mode: str, count: int = 3) -> dict:
    mode = apply_global_mode(mode).lower().strip()
    count = max(1, min(count, 3))

    critical_pool = [
        {
            "sender": "security-alert@micr0soft-login.com",
            "subject": "Password expires today",
            "reason": "Credential phishing",
            "severity": "critical",
            "status": "blocked"
        },
        {
            "sender": "ceo@company-secure.co",
            "subject": "Urgent transfer request",
            "reason": "Business email compromise",
            "severity": "critical",
            "status": "blocked"
        },
        {
            "sender": "invoice@paym3nt-alert.net",
            "subject": "Invoice attached",
            "reason": "Malicious attachment",
            "severity": "warning",
            "status": "quarantined"
        }
    ]

    manageable_pool = [
        {
            "sender": "invoice@spoofed-domain.net",
            "subject": "Pending invoice",
            "reason": "Suspicious attachment",
            "severity": "warning",
            "status": "quarantined"
        },
        {
            "sender": "sharepoint@external-share.net",
            "subject": "Document shared with you",
            "reason": "Suspicious external link",
            "severity": "warning",
            "status": "blocked"
        },
        {
            "sender": "helpdesk@company-reset.co",
            "subject": "Password reset required",
            "reason": "Suspicious password reset lure",
            "severity": "warning",
            "status": "blocked"
        }
    ]

    safe_pool = [
        {
            "sender": "newsletter@trusted.com",
            "subject": "Weekly security digest",
            "reason": "No threat detected",
            "severity": "safe",
            "status": "allowed"
        },
        {
            "sender": "updates@office.com",
            "subject": "Monthly Microsoft update",
            "reason": "Trusted sender",
            "severity": "safe",
            "status": "allowed"
        },
        {
            "sender": "noreply@warwick.ac.uk",
            "subject": "Course timetable update",
            "reason": "Trusted academic domain",
            "severity": "safe",
            "status": "allowed"
        }
    ]

    if mode == "critical":
        selected = critical_pool[:count]
        attack_level = "red"
    elif mode == "manageable":
        selected = manageable_pool[:count]
        attack_level = "yellow"
    else:
        selected = safe_pool[:count]
        attack_level = "green"

    emails = [
        {
            "id": i + 1,
            **email,
            "time": f"{2 + i * 3}m ago"
        }
        for i, email in enumerate(selected)
    ]

    return {
        "email": {
            "connection": {
                "connected": True,
                "provider": "office365"
            },
            "attack_level": attack_level,
            "blocked_emails": emails,
            "stats": {
                "total": len(emails),
                "critical": sum(1 for e in emails if e["severity"] == "critical"),
                "warning": sum(1 for e in emails if e["severity"] == "warning"),
                "safe": sum(1 for e in emails if e["severity"] == "safe")
            }
        }
    }


def publish_email_json(mode: str, count: int = 3) -> dict:
    payload = _build_email_payload(mode, count)

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    return payload


def get_email_data() -> dict:
    if not DATA_FILE.exists():
        return publish_email_json("safe", 2)

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)