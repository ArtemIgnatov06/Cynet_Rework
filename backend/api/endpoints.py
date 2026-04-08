import json
from pathlib import Path
from .regime import apply_global_mode

DATA_FILE = Path(__file__).parent / "src" / "endpoints_data.json"


def _build_endpoints_payload(mode: str = "manageable", count: int = 6) -> dict:
    mode = apply_global_mode(mode).lower().strip()
    count = max(3, min(count, 10))

    if mode == "critical":
        devices = [
            {"id": 1, "name": "WS-FIN-01", "ip": "10.0.0.11", "os": "windows", "group": "Finance", "lastSeen": "1m ago", "status": "ok"},
            {"id": 2, "name": "MacBook-CEO", "ip": "10.0.0.22", "os": "mac", "group": "Executive", "lastSeen": "3m ago", "status": "faulty"},
            {"id": 3, "name": "Linux-Build-01", "ip": "10.0.0.31", "os": "linux", "group": "Engineering", "lastSeen": "12m ago", "status": "inactive"},
            {"id": 4, "name": "WS-HR-07", "ip": "10.0.0.44", "os": "windows", "group": "HR", "lastSeen": "5m ago", "status": "ok"},
            {"id": 5, "name": "MacBook-Sales", "ip": "10.0.0.51", "os": "mac", "group": "Sales", "lastSeen": "8m ago", "status": "faulty"},
            {"id": 6, "name": "Linux-Prod-02", "ip": "10.0.0.61", "os": "linux", "group": "Production", "lastSeen": "2m ago", "status": "ok"},
        ]
        protected = [
            {"name": "Malware", "open": 3, "closed": 12},
            {"name": "Persistence", "open": 2, "closed": 9},
            {"name": "Credential Theft", "open": 2, "closed": 5},
        ]
    elif mode == "manageable":
        devices = [
            {"id": 1, "name": "WS-FIN-01", "ip": "10.0.0.11", "os": "windows", "group": "Finance", "lastSeen": "1m ago", "status": "ok"},
            {"id": 2, "name": "MacBook-CEO", "ip": "10.0.0.22", "os": "mac", "group": "Executive", "lastSeen": "3m ago", "status": "ok"},
            {"id": 3, "name": "Linux-Build-01", "ip": "10.0.0.31", "os": "linux", "group": "Engineering", "lastSeen": "12m ago", "status": "inactive"},
            {"id": 4, "name": "WS-HR-07", "ip": "10.0.0.44", "os": "windows", "group": "HR", "lastSeen": "5m ago", "status": "ok"},
            {"id": 5, "name": "MacBook-Sales", "ip": "10.0.0.51", "os": "mac", "group": "Sales", "lastSeen": "8m ago", "status": "ok"},
            {"id": 6, "name": "Linux-Prod-02", "ip": "10.0.0.61", "os": "linux", "group": "Production", "lastSeen": "2m ago", "status": "ok"},
        ]
        protected = [
            {"name": "Malware", "open": 1, "closed": 10},
            {"name": "Persistence", "open": 0, "closed": 8},
            {"name": "Credential Theft", "open": 1, "closed": 4},
        ]
    else:
        devices = [
            {"id": i + 1, "name": f"WS-SEC-{i+1}", "ip": f"10.0.0.{10+i}", "os": "windows", "group": "Protected", "lastSeen": "1m ago", "status": "ok"}
            for i in range(count)
        ]
        protected = [
            {"name": "Malware", "open": 0, "closed": 15},
            {"name": "Persistence", "open": 0, "closed": 12},
            {"name": "Credential Theft", "open": 0, "closed": 7},
        ]

    devices = devices[:count]

    return {
        "endpoints": {
            "devices": devices,
            "protectedCategories": protected,
            "alertsOverTime": [
                {"label": "Mon", "value": 2 if mode != "critical" else 6},
                {"label": "Tue", "value": 3 if mode != "critical" else 7},
                {"label": "Wed", "value": 2 if mode != "critical" else 5},
                {"label": "Thu", "value": 4 if mode != "critical" else 8},
                {"label": "Fri", "value": 3 if mode != "critical" else 6},
            ],
            "risksOverTime": [
                {"label": "Mon", "value": 1 if mode == "safe" else 3},
                {"label": "Tue", "value": 2 if mode != "critical" else 5},
                {"label": "Wed", "value": 2 if mode != "critical" else 4},
                {"label": "Thu", "value": 3 if mode != "critical" else 6},
                {"label": "Fri", "value": 2 if mode != "critical" else 5},
            ],
        }
    }


def publish_endpoints_json(mode: str = "manageable", count: int = 6):
    payload = _build_endpoints_payload(mode, count)
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    return payload