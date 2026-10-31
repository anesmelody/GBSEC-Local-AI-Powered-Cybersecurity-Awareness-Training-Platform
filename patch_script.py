import re

with open("generate_100_scenarios.py", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the threat_types array and the keys in data_banks
mapping = {
    "Phishing & Social Engineering": "Credential Harvesting",
    "BEC / Vendor Impersonation": "BEC / Vendor Impersonation",
    "Malware & Ransomware": "Malicious Attachment",
    "Password & Credential Theft": "MFA Fatigue",
    "Remote Work / Public Wi-Fi": "Vishing / Fake Helpdesk",
    "Insider Threats": "Insider Threat",
    "Physical Security / Tailgating": "Physical Security",
    "Device Loss & Theft": "Lookalike Domain",
    "Data Handling & Privacy": "Cloud Misconfiguration",
    "Incident Reporting": "OAuth App Consent Phishing"
}

for old, new in mapping.items():
    content = content.replace(f'"{old}"', f'"{new}"')

with open("generate_100_scenarios.py", "w", encoding="utf-8") as f:
    f.write(content)
