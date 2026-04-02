from backend.email import publish_email_json


def main():
    print("Choose email attack mode:")
    print("1 - critical")
    print("2 - manageable")
    print("3 - safe")

    choice = input("Enter choice: ").strip()
    count_raw = input("How many emails to generate (2 or 3): ").strip()

    mapping = {
        "1": "critical",
        "2": "manageable",
        "3": "safe",
        "critical": "critical",
        "manageable": "manageable",
        "safe": "safe"
    }

    mode = mapping.get(choice, "safe")

    try:
        count = int(count_raw)
    except ValueError:
        count = 2

    if count not in {2, 3}:
        count = 2

    payload = publish_email_json(mode, count)

    print(f"\nGenerated {count} emails")
    print(f"Attack level: {payload['email']['attack_level']}")
    print("JSON saved to backend/src/email_data.json")


if __name__ == "__main__":
    main()