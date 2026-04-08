import json
from pathlib import Path

from api.regime import apply_global_mode

DATA_FILE = Path(__file__).parent / "src" / "network_data.json"

# Flask blueprint — only registered when running the Flask app directly
try:
    from flask import Blueprint, jsonify
    network_bp = Blueprint("network", __name__)

    @network_bp.route("/api/network", methods=["GET"])
    def api_network_flask():
        return jsonify(get_network_data())
except ImportError:
    network_bp = None


STATIC_TOPOLOGY = {
    "root": "Cynet",
    "endpoints": [
        {
            "name": "Adeline_Endpoint_MAC",
            "children": [
                {"subnet": "172.20.10.0", "host": "Apple's MacBook Pro", "type": "mac"},
                {"subnet": "192.168.1.0", "host": "adelinelp's MacBook Air", "type": "mac"},
                {"subnet": "192.168.100.0", "host": "Administrator's MacBook Air", "type": "mac"},
                {"subnet": "192.168.8.0", "host": "Adeline's MacBook Air", "type": "mac"},
            ],
        },
        {
            "name": "Adeline_Endpoint_WIN",
            "children": [
                {"subnet": "10.1.1.0", "host": "ws-buh", "type": "win"},
                {"subnet": "10.1.2.0", "host": "buh2", "type": "win"},
                {"subnet": "10.167.164.0", "host": "ibsquare-realme-book", "type": "win"},
                {"subnet": "172.20.10.0", "host": "DESKTOP-PBT0052", "type": "win"},
                {"subnet": "192.168.100.0", "host": "shtyrlya-pc", "type": "win"},
                {"subnet": "192.168.100.0", "host": "Worldsokol", "type": "win"},
                {"subnet": "192.168.5.0", "host": "DESKTOP-1QBCD2R", "type": "win"},
            ],
        },
        {
            "name": "Emir Testing WIN",
            "children": [
                {"subnet": "10.1.3.0", "host": "WINS102", "type": "phone"},
            ],
        },
    ],
}


def _build_network_payload(mode: str, count: int = 3) -> dict:
    mode = apply_global_mode(mode).lower().strip()
    count = max(1, min(count, 4))

    critical_pool = [
        {
            "id": 1,
            "title": "Lateral movement attempt detected",
            "description": "Suspicious east-west traffic between internal hosts indicates possible lateral movement.",
            "severity": "critical",
            "status": "blocked",
            "affected_endpoint": "Adeline_Endpoint_WIN",
            "affected_subnet": "192.168.100.0",
            "affected_host": "shtyrlya-pc",
            "attack_type": "lateral_movement",
            "detected_at": "2m ago",
        },
        {
            "id": 2,
            "title": "Command-and-control beaconing",
            "description": "Repeated outbound connections to an untrusted remote destination match C2 behavior.",
            "severity": "critical",
            "status": "blocked",
            "affected_endpoint": "Adeline_Endpoint_WIN",
            "affected_subnet": "10.167.164.0",
            "affected_host": "ibsquare-realme-book",
            "attack_type": "c2_beaconing",
            "detected_at": "5m ago",
        },
        {
            "id": 3,
            "title": "Suspicious port scanning activity",
            "description": "High-rate scan across multiple internal assets from a compromised workstation.",
            "severity": "warning",
            "status": "contained",
            "affected_endpoint": "Adeline_Endpoint_MAC",
            "affected_subnet": "172.20.10.0",
            "affected_host": "Apple's MacBook Pro",
            "attack_type": "port_scan",
            "detected_at": "8m ago",
        },
        {
            "id": 4,
            "title": "Unauthorized SMB access attempt",
            "description": "SMB authentication attempts from an unusual source host triggered policy controls.",
            "severity": "critical",
            "status": "blocked",
            "affected_endpoint": "Adeline_Endpoint_WIN",
            "affected_subnet": "10.1.1.0",
            "affected_host": "ws-buh",
            "attack_type": "unauthorized_access",
            "detected_at": "11m ago",
        },
    ]

    manageable_pool = [
        {
            "id": 1,
            "title": "Abnormal outbound DNS activity",
            "description": "DNS traffic volume exceeded baseline and was flagged for review.",
            "severity": "warning",
            "status": "monitored",
            "affected_endpoint": "Adeline_Endpoint_MAC",
            "affected_subnet": "192.168.1.0",
            "affected_host": "adelinelp's MacBook Air",
            "attack_type": "dns_anomaly",
            "detected_at": "4m ago",
        },
        {
            "id": 2,
            "title": "Exposed service detected",
            "description": "A host responded on a management port outside normal policy expectations.",
            "severity": "warning",
            "status": "restricted",
            "affected_endpoint": "Adeline_Endpoint_WIN",
            "affected_subnet": "172.20.10.0",
            "affected_host": "DESKTOP-PBT0052",
            "attack_type": "exposed_service",
            "detected_at": "7m ago",
        },
        {
            "id": 3,
            "title": "Unusual ARP behavior",
            "description": "ARP request patterns suggest possible reconnaissance or misconfiguration.",
            "severity": "warning",
            "status": "investigating",
            "affected_endpoint": "Emir Testing WIN",
            "affected_subnet": "10.1.3.0",
            "affected_host": "WINS102",
            "attack_type": "arp_anomaly",
            "detected_at": "10m ago",
        },
        {
            "id": 4,
            "title": "High connection retry rate",
            "description": "A workstation generated repeated failed connection attempts to internal assets.",
            "severity": "warning",
            "status": "monitored",
            "affected_endpoint": "Adeline_Endpoint_WIN",
            "affected_subnet": "192.168.5.0",
            "affected_host": "DESKTOP-1QBCD2R",
            "attack_type": "retry_spike",
            "detected_at": "13m ago",
        },
    ]

    safe_pool = [
        {
            "id": 1,
            "title": "No active network threats",
            "description": "Traffic patterns are within expected baseline thresholds.",
            "severity": "safe",
            "status": "allowed",
            "affected_endpoint": "Adeline_Endpoint_MAC",
            "affected_subnet": "192.168.8.0",
            "affected_host": "Adeline's MacBook Air",
            "attack_type": "none",
            "detected_at": "2m ago",
        },
        {
            "id": 2,
            "title": "Internal segmentation healthy",
            "description": "No suspicious cross-segment movement was observed.",
            "severity": "safe",
            "status": "allowed",
            "affected_endpoint": "Adeline_Endpoint_WIN",
            "affected_subnet": "10.1.2.0",
            "affected_host": "buh2",
            "attack_type": "none",
            "detected_at": "6m ago",
        },
        {
            "id": 3,
            "title": "Endpoint communications normal",
            "description": "No anomalies found in internal device communication patterns.",
            "severity": "safe",
            "status": "allowed",
            "affected_endpoint": "Adeline_Endpoint_WIN",
            "affected_subnet": "192.168.100.0",
            "affected_host": "Worldsokol",
            "attack_type": "none",
            "detected_at": "9m ago",
        },
        {
            "id": 4,
            "title": "Network perimeter stable",
            "description": "No policy violations or suspicious egress patterns detected.",
            "severity": "safe",
            "status": "allowed",
            "affected_endpoint": "Adeline_Endpoint_MAC",
            "affected_subnet": "172.20.10.0",
            "affected_host": "Apple's MacBook Pro",
            "attack_type": "none",
            "detected_at": "12m ago",
        },
    ]

    if mode == "critical":
        selected = critical_pool[:count]
        attack_level = "red"
        health_score = 40
    elif mode == "manageable":
        selected = manageable_pool[:count]
        attack_level = "yellow"
        health_score = 72
    else:
        selected = safe_pool[:count]
        attack_level = "green"
        health_score = 96

    incidents = [{**incident, "id": i + 1} for i, incident in enumerate(selected)]

    return {
        "network": {
            "connection": {
                "connected": True,
                "provider": "internal_network",
            },
            "attack_level": attack_level,
            "health_score": health_score,
            "topology": STATIC_TOPOLOGY,
            "incidents": incidents,
            "stats": {
                "total": len(incidents),
                "critical": sum(1 for i in incidents if i["severity"] == "critical"),
                "warning": sum(1 for i in incidents if i["severity"] == "warning"),
                "safe": sum(1 for i in incidents if i["severity"] == "safe"),
            },
        }
    }


def publish_network_json(mode: str, count: int = 3) -> dict:
    payload = _build_network_payload(mode, count)

    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    return payload


def get_network_data() -> dict:
    if not DATA_FILE.exists():
        return publish_network_json("safe", 2)

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


