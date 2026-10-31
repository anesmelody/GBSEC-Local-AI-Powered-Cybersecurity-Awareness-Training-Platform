import json
import random
from datetime import datetime, timedelta

def generate_scenarios(count=100):
    scenarios = []
    
    threat_types = [
        "BEC / Vendor Impersonation",
        "Credential Harvesting",
        "MFA Fatigue",
        "Vishing / Fake Helpdesk",
        "Lookalike Domain",
        "Malicious Attachment",
        "Insider Threat",
        "Physical Security",
        "Cloud Misconfiguration",
        "OAuth App Consent Phishing"
    ]
    
    vendors = ["bakerhughes", "slb", "halliburton", "weatherford", "aramco-jv", "eni-ops", "sonatrach-supply"]
    tlds = [".com", ".net", ".org", ".co", ".io", ".biz", ".corp"]
    
    for i in range(count * len(threat_types)):
        ttype = threat_types[i // count]
        vendor = random.choice(vendors)
        fake_domain = f"{vendor}-portal{random.choice(tlds)}"
        real_domain = f"{vendor}.com"
        
        scenario_date = (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d")
        
        if ttype == "BEC / Vendor Impersonation":
            scenario = {
                "scenario_date": scenario_date,
                "topic": "Urgent Invoice Banking Update",
                "threat_type": ttype,
                "difficulty": "Medium",
                "points_reward": 100,
                "briefing": {
                    "sender": f"accounts@{fake_domain}",
                    "subject": f"URGENT: Updated Bank Mandate for Contract #{random.randint(1000,9999)}",
                    "body_snippet": "Dear Team, our banking details for wire transfer clearance have changed. Please update your records within 24 hours to prevent delivery hold on site.",
                    "context": f"Received on corporate Outlook. Sender domain is {fake_domain} instead of {real_domain}."
                },
                "options": [
                    {
                        "id": "A",
                        "text": "Reply immediately to the email requesting executive sign-off.",
                        "is_correct": False,
                        "explanation": "Wrong. Replying directly confirms your address is active and keeps you in contact with the attacker."
                    },
                    {
                        "id": "B",
                        "text": "Execute an out-of-band phone verification using the vendor's verified directory number.",
                        "is_correct": True,
                        "explanation": "Correct! Supply-chain BEC relies on lookalike domains. Out-of-band verification is mandatory."
                    },
                    {
                        "id": "C",
                        "text": "Forward the email to your personal webmail to investigate.",
                        "is_correct": False,
                        "explanation": "Wrong. Forwarding sensitive corporate documents to external mail violates privacy policies."
                    }
                ]
            }
        elif ttype == "Credential Harvesting":
            scenario = {
                "scenario_date": scenario_date,
                "topic": "Mandatory Office 365 Password Reset",
                "threat_type": ttype,
                "difficulty": "Easy",
                "points_reward": 100,
                "briefing": {
                    "sender": f"it-support@{fake_domain}",
                    "subject": "ACTION REQUIRED: Password expires in 2 hours",
                    "body_snippet": "Your enterprise password is about to expire. Click here to keep your current password.",
                    "context": "Email bypasses some spam filters. Contains an urgent call to action and a generic login link."
                },
                "options": [
                    {
                        "id": "A",
                        "text": "Click the link but only enter your old password, not the new one.",
                        "is_correct": False,
                        "explanation": "Wrong. Any password entered on a malicious site is captured immediately."
                    },
                    {
                        "id": "B",
                        "text": "Report as Phishing using the official email client button and do not click links.",
                        "is_correct": True,
                        "explanation": "Correct! IT will never send a link asking you to 'keep your current password'."
                    },
                    {
                        "id": "C",
                        "text": "Call your manager to see if their password is also expiring.",
                        "is_correct": False,
                        "explanation": "Suboptimal. While communicating is good, you should immediately report the phishing attempt so security can block it."
                    }
                ]
            }
        elif ttype == "MFA Fatigue":
            scenario = {
                "scenario_date": scenario_date,
                "topic": "Midnight Authenticator Spam",
                "threat_type": ttype,
                "difficulty": "Hard",
                "points_reward": 150,
                "briefing": {
                    "sender": "System Notification",
                    "subject": "Microsoft Authenticator / Duo Push",
                    "body_snippet": "You are receiving 15 continuous push notifications to approve a login at 2:00 AM.",
                    "context": "You are asleep, and your phone starts buzzing repeatedly with login approval requests."
                },
                "options": [
                    {
                        "id": "A",
                        "text": "Approve one request just to make the phone stop buzzing so you can sleep.",
                        "is_correct": False,
                        "explanation": "Wrong! This is an MFA Fatigue attack. Approving even one request grants the attacker access."
                    },
                    {
                        "id": "B",
                        "text": "Deny the request and immediately change your password or contact the SOC.",
                        "is_correct": True,
                        "explanation": "Correct! If you get unexpected MFA prompts, your password has already been compromised. Deny and reset."
                    },
                    {
                        "id": "C",
                        "text": "Ignore the phone and put it on silent.",
                        "is_correct": False,
                        "explanation": "Suboptimal. While you didn't grant access, your compromised password remains a threat. You must report it."
                    }
                ]
            }
        elif ttype == "Vishing / Fake Helpdesk":
            scenario = {
                "scenario_date": scenario_date,
                "topic": "Urgent VPN Upgrade Call",
                "threat_type": ttype,
                "difficulty": "Medium",
                "points_reward": 100,
                "briefing": {
                    "sender": "Phone Call (Unknown Internal Extension)",
                    "subject": "IT Helpdesk Calling",
                    "body_snippet": "Hi, this is Alex from IT. We're doing an urgent VPN upgrade. I need you to go to vpn-upgrade-portal.com and download the patch, or you'll lose access.",
                    "context": "The caller sounds professional and knows your manager's name."
                },
                "options": [
                    {
                        "id": "A",
                        "text": "Navigate to the URL and download the patch as instructed.",
                        "is_correct": False,
                        "explanation": "Wrong. Attackers use social engineering (vishing) to trick you into downloading malware."
                    },
                    {
                        "id": "B",
                        "text": "Ask for their employee ID and verify it on the corporate directory.",
                        "is_correct": False,
                        "explanation": "Wrong. Attackers can easily impersonate real employees. Always use out-of-band verification."
                    },
                    {
                        "id": "C",
                        "text": "Hang up and call the official IT Helpdesk number listed on the intranet to verify.",
                        "is_correct": True,
                        "explanation": "Correct! Never trust unsolicited calls. Always verify by initiating communication through official channels."
                    }
                ]
            }
        elif ttype == "Malicious Attachment":
            scenario = {
                "scenario_date": scenario_date,
                "topic": "Q3 Performance Review Document",
                "threat_type": ttype,
                "difficulty": "Medium",
                "points_reward": 100,
                "briefing": {
                    "sender": "hr-updates@corporate-intranet.com",
                    "subject": "CONFIDENTIAL: Your Q3 Performance Review",
                    "body_snippet": "Please review the attached Excel document regarding your performance bonus.",
                    "context": "The attachment is named 'Q3_Bonus_Review.xlsm'. It contains macros."
                },
                "options": [
                    {
                        "id": "A",
                        "text": "Open the file and click 'Enable Content' to view the bonus details.",
                        "is_correct": False,
                        "explanation": "Wrong. Enabling macros in untrusted documents is a common way to execute malware."
                    },
                    {
                        "id": "B",
                        "text": "Report the email to the security team without opening the attachment.",
                        "is_correct": True,
                        "explanation": "Correct! Unexpected emails with macro-enabled attachments (.xlsm, .docm) are highly suspicious."
                    },
                    {
                        "id": "C",
                        "text": "Forward to a colleague to see if they got the same email.",
                        "is_correct": False,
                        "explanation": "Wrong. You might accidentally spread a malicious file to others."
                    }
                ]
            }
        else:
            # Generic fallback for other types
            scenario = {
                "scenario_date": scenario_date,
                "topic": f"Suspicious Activity: {ttype}",
                "threat_type": ttype,
                "difficulty": "Easy",
                "points_reward": 50,
                "briefing": {
                    "sender": f"system-alert@{fake_domain}",
                    "subject": f"Notice regarding {ttype}",
                    "body_snippet": "Please review the following security alert regarding recent activity.",
                    "context": "Generic security awareness scenario."
                },
                "options": [
                    {
                        "id": "A",
                        "text": "Ignore the alert entirely.",
                        "is_correct": False,
                        "explanation": "Wrong. Ignoring alerts can lead to breaches."
                    },
                    {
                        "id": "B",
                        "text": "Follow standard security operating procedures and report if suspicious.",
                        "is_correct": True,
                        "explanation": "Correct! Always adhere to security policies."
                    },
                    {
                        "id": "C",
                        "text": "Attempt to resolve the issue yourself without telling IT.",
                        "is_correct": False,
                        "explanation": "Wrong. Incident response requires coordination with the security team."
                    }
                ]
            }
        
        # shuffle options slightly
        random.shuffle(scenario["options"])
        # reassign A,B,C
        for idx, opt in enumerate(scenario["options"]):
            opt["id"] = chr(65+idx)
            
        scenarios.append(scenario)

    with open('scenarios.json', 'w') as f:
        json.dump(scenarios, f, indent=2)

if __name__ == "__main__":
    generate_scenarios(100)
    print("Generated 100 scenarios in scenarios.json")
