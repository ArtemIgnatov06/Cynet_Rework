import json
from pathlib import Path

DATA_FILE = Path(__file__).parent / "src" / "users_data.json"


def _build_users_payload(mode: str = "critical", count: int = 5) -> dict:
    count = max(3, min(count, 6))

    users = [
        {"name": "ws-buhoffice", "alerts": 4},
        {"name": "Adeline-MacBook", "alerts": 6},
        {"name": "shtyrlya-pc", "alerts": 6},
        {"name": "buh2lm-shipilina", "alerts": 4},
        {"name": "AirIs.setekov", "alerts": 3},
    ][:count]

    issues = [
        {
            "id": 1,
            "title": "Unusual privilege escalation",
            "description": "User account accessed privileged resources outside baseline.",
            "severity": "critical",
        },
        {
            "id": 2,
            "title": "Weekend login anomaly",
            "description": "User authenticated during unusual off-hours period.",
            "severity": "warning",
        },
        {
            "id": 3,
            "title": "Suspicious file sharing",
            "description": "Mass external file sharing triggered behavioral detection.",
            "severity": "critical",
        },
    ]

    protection_areas = [
        {"name": "Access", "open": 2, "closed": 5},
        {"name": "Identity", "open": 1, "closed": 4},
        {"name": "Lateral Movement", "open": 0, "closed": 3},
    ]

    uba = [
        {
            "name": "SAP",
            "description": "User opens SAP for the first time",
            "interval": "60 minutes",
            "disabled": True,
            "action": "SMS",
            "severity": "High",
        },
        {
            "name": "Visual Studio",
            "description": "User opens Visual Studio for the first time",
            "interval": "60 minutes",
            "disabled": True,
            "action": "SMS",
            "severity": "High",
        },
        {
            "name": "Dropbox",
            "description": "User opens Dropbox for the first time",
            "interval": "60 minutes",
            "disabled": True,
            "action": "SMS",
            "severity": "High",
        },
    ]

    return {
        "users": {
            "alerts_per_user": users,
            "issues": issues,
            "protection_areas": protection_areas,
            "uba": uba,
        }
    }


def publish_users_json(mode: str = "critical", count: int = 5):
    payload = _build_users_payload(mode, count)
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    return payload