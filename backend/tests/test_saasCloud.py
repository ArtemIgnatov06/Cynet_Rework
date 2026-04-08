from api.saasCloud import _build_saasCloud_payload


def test_saas_cloud_payload_contains_expected_sections():
    payload = _build_saasCloud_payload("critical", 6)

    assert "saasCloud" in payload

    data = payload["saasCloud"]
    assert data["connection"]["connected"] is True
    assert data["activeTab"] == "risks"
    assert len(data["tabs"]) == 8
    assert "risks" in data["datasets"]
    assert "users" in data["datasets"]


def test_saas_cloud_safe_mode_clears_risk_issues():
    payload = _build_saasCloud_payload("safe", 6)
    data = payload["saasCloud"]

    assert data["status"] == "ok"
    assert data["datasets"]["risks"]["issues"] == []
