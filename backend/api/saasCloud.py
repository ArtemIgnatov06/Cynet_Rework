import json
from pathlib import Path

from api.regime import apply_global_mode

DATA_FILE = Path(__file__).parent / "src" / "saas_cloud_data.json"


def _format_percentage(value: int, total: int) -> int:
    if total <= 0:
        return 0
    return round((value / total) * 100)


def _build_dataset(issues, timeline):
    total = len(issues)
    severity_breakdown = {
        "critical": sum(1 for issue in issues if issue["severity"] == "critical"),
        "high": sum(1 for issue in issues if issue["severity"] == "high"),
        "medium": sum(1 for issue in issues if issue["severity"] == "medium"),
        "low": sum(1 for issue in issues if issue["severity"] == "low"),
    }

    services = {}
    for issue in issues:
        services[issue["service"]] = services.get(issue["service"], 0) + 1

    top_risky_services = [
        {"name": service, "issues": count}
        for service, count in sorted(services.items(), key=lambda item: (-item[1], item[0]))
    ]

    return {
        "topRiskyServices": top_risky_services[:5],
        "issuesOverTime": timeline,
        "severityBreakdown": {
            key: {
                "count": value,
                "percentage": _format_percentage(value, total),
            }
            for key, value in severity_breakdown.items()
        },
        "issues": issues,
    }


def _build_saasCloud_payload(mode: str, count: int = 6) -> dict:
    mode = apply_global_mode(mode).lower().strip()
    count = max(1, min(count, 12))

    risks_issues = [
        {
            "id": "risk-1",
            "severity": "critical",
            "service": "Microsoft 365",
            "category": "Conditional Access",
            "subject": "Legacy authentication is still enabled for 3 admin accounts",
            "currentValue": "Enabled",
            "secureValue": "Disabled",
            "compliance": "CIS 1.4",
            "status": "Open",
        },
        {
            "id": "risk-2",
            "severity": "high",
            "service": "AWS",
            "category": "S3 Bucket",
            "subject": "Backup bucket allows public read access",
            "currentValue": "Public",
            "secureValue": "Private",
            "compliance": "AWS Foundational",
            "status": "Open",
        },
        {
            "id": "risk-3",
            "severity": "medium",
            "service": "Google Workspace",
            "category": "Sharing Policy",
            "subject": "External Drive sharing is allowed across the whole tenant",
            "currentValue": "Allowed",
            "secureValue": "Restricted",
            "compliance": "NIST AC-3",
            "status": "Open",
        },
        {
            "id": "risk-4",
            "severity": "high",
            "service": "Microsoft Teams",
            "category": "Guest Access",
            "subject": "Guest users can create new teams without approval",
            "currentValue": "Allowed",
            "secureValue": "Approval required",
            "compliance": "CIS 2.2",
            "status": "Open",
        },
        {
            "id": "risk-5",
            "severity": "low",
            "service": "SharePoint Sites",
            "category": "Site Visibility",
            "subject": "2 collaboration sites are open to all employees",
            "currentValue": "Company-wide",
            "secureValue": "Limited audience",
            "compliance": "Best Practice",
            "status": "Review",
        },
        {
            "id": "risk-6",
            "severity": "medium",
            "service": "Email Forwarding Rules",
            "category": "Mailbox Rule",
            "subject": "Automatic external forwarding found for finance mailbox",
            "currentValue": "Forwarding enabled",
            "secureValue": "Forwarding disabled",
            "compliance": "NIST AU-12",
            "status": "Open",
        },
    ]

    users_issues = [
        {
            "id": "user-1",
            "severity": "high",
            "service": "Microsoft 365",
            "category": "Privileged User",
            "subject": "2 admin users do not have MFA enforced",
            "currentValue": "MFA optional",
            "secureValue": "MFA required",
            "compliance": "CIS 1.1",
            "status": "Open",
        },
        {
            "id": "user-2",
            "severity": "medium",
            "service": "Google Workspace",
            "category": "Dormant User",
            "subject": "7 inactive users still keep SaaS access",
            "currentValue": "Access active",
            "secureValue": "Access removed",
            "compliance": "ISO 27001 A.9",
            "status": "Review",
        },
    ]

    subdomains_issues = [
        {
            "id": "sub-1",
            "severity": "medium",
            "service": "Google Workspace",
            "category": "Subdomain Ownership",
            "subject": "marketing.company.com has no verified owner",
            "currentValue": "Unknown owner",
            "secureValue": "Verified owner",
            "compliance": "Best Practice",
            "status": "Review",
        }
    ]

    aws_bucket_issues = [
        {
            "id": "bucket-1",
            "severity": "high",
            "service": "AWS",
            "category": "Bucket Encryption",
            "subject": "logs-prod bucket is missing default encryption",
            "currentValue": "Disabled",
            "secureValue": "AES-256",
            "compliance": "AWS Foundational",
            "status": "Open",
        }
    ]

    aws_address_issues = [
        {
            "id": "addr-1",
            "severity": "low",
            "service": "AWS",
            "category": "Elastic IP",
            "subject": "Unused public IP address still allocated",
            "currentValue": "Allocated",
            "secureValue": "Released",
            "compliance": "Cost Hygiene",
            "status": "Review",
        }
    ]

    teams_issues = [
        {
            "id": "teams-1",
            "severity": "high",
            "service": "Microsoft Teams",
            "category": "External Collaboration",
            "subject": "External domains are allowed without allowlist",
            "currentValue": "Open collaboration",
            "secureValue": "Allowlist only",
            "compliance": "CIS 2.7",
            "status": "Open",
        }
    ]

    sharepoint_issues = [
        {
            "id": "sp-1",
            "severity": "medium",
            "service": "SharePoint Sites",
            "category": "Anonymous Link",
            "subject": "Anonymous sharing links remain active on 4 files",
            "currentValue": "Enabled",
            "secureValue": "Disabled",
            "compliance": "CIS 3.2",
            "status": "Review",
        }
    ]

    forwarding_issues = [
        {
            "id": "mail-1",
            "severity": "critical",
            "service": "Email Forwarding Rules",
            "category": "Auto Forwarding",
            "subject": "CEO mailbox forwards mail to an external address",
            "currentValue": "Enabled",
            "secureValue": "Disabled",
            "compliance": "NIST SI-4",
            "status": "Open",
        }
    ]

    if mode == "safe":
        risks_issues = []
        users_issues = []
        subdomains_issues = []
        aws_bucket_issues = []
        aws_address_issues = []
        teams_issues = []
        sharepoint_issues = []
        forwarding_issues = []
        page_status = "ok"
        health_score = 93
    elif mode == "manageable":
        risks_issues = risks_issues[1:4]
        users_issues = users_issues[:1]
        subdomains_issues = subdomains_issues[:1]
        aws_bucket_issues = aws_bucket_issues[:1]
        aws_address_issues = aws_address_issues[:1]
        teams_issues = teams_issues[:1]
        sharepoint_issues = sharepoint_issues[:1]
        forwarding_issues = []
        page_status = "warning"
        health_score = 76
    else:
        risks_issues = risks_issues[:count]
        page_status = "critical"
        health_score = 61

    datasets = {
        "risks": _build_dataset(
            risks_issues,
            [
                {"label": "Apr 1", "value": 1},
                {"label": "Apr 2", "value": 2},
                {"label": "Apr 3", "value": 2},
                {"label": "Apr 4", "value": 3},
                {"label": "Apr 5", "value": 4},
                {"label": "Apr 6", "value": 5},
                {"label": "Today", "value": len(risks_issues)},
            ],
        ),
        "users": _build_dataset(
            users_issues,
            [{"label": "Apr 1", "value": 0}, {"label": "Today", "value": len(users_issues)}],
        ),
        "subdomains": _build_dataset(
            subdomains_issues,
            [{"label": "Apr 1", "value": 0}, {"label": "Today", "value": len(subdomains_issues)}],
        ),
        "aws-buckets": _build_dataset(
            aws_bucket_issues,
            [{"label": "Apr 1", "value": 0}, {"label": "Today", "value": len(aws_bucket_issues)}],
        ),
        "aws-addresses": _build_dataset(
            aws_address_issues,
            [{"label": "Apr 1", "value": 0}, {"label": "Today", "value": len(aws_address_issues)}],
        ),
        "microsoft-teams": _build_dataset(
            teams_issues,
            [{"label": "Apr 1", "value": 0}, {"label": "Today", "value": len(teams_issues)}],
        ),
        "sharepoint-sites": _build_dataset(
            sharepoint_issues,
            [{"label": "Apr 1", "value": 0}, {"label": "Today", "value": len(sharepoint_issues)}],
        ),
        "email-forwarding-rules": _build_dataset(
            forwarding_issues,
            [{"label": "Apr 1", "value": 0}, {"label": "Today", "value": len(forwarding_issues)}],
        ),
    }

    all_issues_count = sum(len(dataset["issues"]) for dataset in datasets.values())

    return {
        "saasCloud": {
            "connection": {
                "connected": True,
                "provider": "Microsoft 365 + AWS",
            },
            "status": page_status,
            "healthScore": health_score,
            "scan": {
                "lastScan": "2026-04-08T08:12:00Z",
                "errorCount": all_issues_count,
            },
            "savedFilters": ["All Findings", "Critical Only", "Collaboration Apps"],
            "summary": {
                "monitoredUsers": 47,
                "monitoredServices": 8,
                "flaggedServices": len(datasets["risks"]["topRiskyServices"]),
                "openFindings": all_issues_count,
            },
            "tabs": [
                {"id": "risks", "label": "Risks", "count": len(datasets["risks"]["issues"])},
                {"id": "users", "label": "Users", "count": len(datasets["users"]["issues"])},
                {"id": "subdomains", "label": "Subdomains", "count": len(datasets["subdomains"]["issues"])},
                {"id": "aws-buckets", "label": "AWS Buckets", "count": len(datasets["aws-buckets"]["issues"])},
                {"id": "aws-addresses", "label": "AWS Addresses", "count": len(datasets["aws-addresses"]["issues"])},
                {"id": "microsoft-teams", "label": "Microsoft Teams", "count": len(datasets["microsoft-teams"]["issues"])},
                {"id": "sharepoint-sites", "label": "SharePoint Sites", "count": len(datasets["sharepoint-sites"]["issues"])},
                {"id": "email-forwarding-rules", "label": "Email Forwarding Rules", "count": len(datasets["email-forwarding-rules"]["issues"])},
            ],
            "activeTab": "risks",
            "datasets": datasets,
        }
    }


def publish_saas_cloud_json(mode: str, count: int = 6) -> dict:
    payload = _build_saasCloud_payload(mode, count)
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(payload, file, indent=2)
    return payload


def get_saas_cloud_data() -> dict:
    if not DATA_FILE.exists():
        return publish_saas_cloud_json("manageable", 6)
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)
