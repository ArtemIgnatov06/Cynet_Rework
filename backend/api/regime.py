from pathlib import Path
import json

STATE_FILE = Path(__file__).parent / "src" / "dashboard_regime.json"

DEFAULT = {"mode": "realistic"}

VALID_MODES = {
    "none",
    "all_good",
    "all_yellow",
    "all_red",
    "realistic",
}

def apply_global_mode(requested_mode: str) -> str:
    global_mode = get_regime()

    if global_mode in {"none", "all_good"}:
        return "safe"
    if global_mode == "all_yellow":
        return "manageable"
    if global_mode == "all_red":
        return "critical"

    return requested_mode


def get_regime() -> str:
    if not STATE_FILE.exists():
        set_regime("realistic")
        return "realistic"

    with open(STATE_FILE, "r", encoding="utf-8") as f:
        return json.load(f).get("mode", "realistic")


def set_regime(mode: str):
    mode = mode.strip().lower()
    if mode not in VALID_MODES:
        mode = "realistic"

    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump({"mode": mode}, f, indent=2)

    return {"mode": mode}


