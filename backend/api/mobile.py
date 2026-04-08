import json
from pathlib import Path

DATA_FILE = Path(__file__).parent / "src" / "mobile_data.json"


def _build_mobile_payload(mode: str = "manageable", count: int = 6) -> dict:
    mode = (mode or "manageable").lower().strip()
    count = max(3, min(count, 10))

    devices = [
        {
            "id": 1,
            "name": "iPhone 15 Pro - Adeline",
            "ip": "10.20.1.14",
            "os": "ios",
            "group": "Executive",
            "lastSeen": "2m ago",
            "status": "ok",
        },
        {
            "id": 2,
            "name": "Samsung S24 - Finance",
            "ip": "10.20.1.18",
            "os": "android",
            "group": "Finance",
            "lastSeen": "5m ago",
            "status": "ok",
        },
        {
            "id": 3,
            "name": "iPad Air - Support",
            "ip": "10.20.1.27",
            "os": "ios",
            "group": "Support",
            "lastSeen": "11m ago",
            "status": "inactive",
        },
        {
            "id": 4,
            "name": "Pixel 8 - DevOps",
            "ip": "10.20.1.33",
            "os": "android",
            "group": "Engineering",
            "lastSeen": "1m ago",
            "status": "ok",
        },
        {
            "id": 5,
            "name": "iPhone 13 - Sales",
            "ip": "10.20.1.41",
            "os": "ios",
            "group": "Sales",
            "lastSeen": "7m ago",
            "status": "faulty",
        },
        {
            "id": 6,
            "name": "Galaxy Tab - Ops",
            "ip": "10.20.1.52",
            "os": "android",
            "group": "Operations",
            "lastSeen": "4m ago",
            "status": "ok",
        },
    ][:count]

    protected_categories = [
        {"name": "Malicious Apps", "open": 1 if mode != "safe" else 0, "closed": 8},
        {"name": "Compliance", "open": 1 if mode == "critical" else 0, "closed": 6},
        {"name": "Network Abuse", "open": 1 if mode == "critical" else 0, "closed": 4},
        {"name": "Device Health", "open": 1 if mode != "safe" else 0, "closed": 7},
    ]

    if mode == "critical":
        alerts_over_time = [
            {"label": "Mon", "value": 3},
            {"label": "Tue", "value": 5},
            {"label": "Wed", "value": 4},
            {"label": "Thu", "value": 7},
            {"label": "Fri", "value": 6},
        ]
        risks_over_time = [
            {"label": "Mon", "value": 2},
            {"label": "Tue", "value": 4},
            {"label": "Wed", "value": 5},
            {"label": "Thu", "value": 6},
            {"label": "Fri", "value": 5},
        ]
    elif mode == "safe":
        alerts_over_time = [
            {"label": "Mon", "value": 1},
            {"label": "Tue", "value": 1},
            {"label": "Wed", "value": 2},
            {"label": "Thu", "value": 1},
            {"label": "Fri", "value": 1},
        ]
        risks_over_time = [
            {"label": "Mon", "value": 1},
            {"label": "Tue", "value": 1},
            {"label": "Wed", "value": 1},
            {"label": "Thu", "value": 1},
            {"label": "Fri", "value": 1},
        ]
    else:
        alerts_over_time = [
            {"label": "Mon", "value": 2},
            {"label": "Tue", "value": 3},
            {"label": "Wed", "value": 2},
            {"label": "Thu", "value": 4},
            {"label": "Fri", "value": 3},
        ]
        risks_over_time = [
            {"label": "Mon", "value": 1},
            {"label": "Tue", "value": 2},
            {"label": "Wed", "value": 2},
            {"label": "Thu", "value": 3},
            {"label": "Fri", "value": 2},
        ]

    return {
        "mobile": {
            "devices": devices,
            "protectedCategories": protected_categories,
            "alertsOverTime": alerts_over_time,
            "risksOverTime": risks_over_time,
        }
    }


def publish_mobile_json(mode: str = "manageable", count: int = 6):
    payload = _build_mobile_payload(mode, count)
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    return payload


def get_mobile_data():
    if not DATA_FILE.exists():
        return publish_mobile_json()

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)