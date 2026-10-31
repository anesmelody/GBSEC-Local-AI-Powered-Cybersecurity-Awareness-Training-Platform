import json
import random
from datetime import datetime, timedelta

def generate_scenarios():
    scenarios = []
    
    threat_types = [
        "Credential Harvesting",
        "BEC / Vendor Impersonation",
        "Malicious Attachment",
        "MFA Fatigue",
        "Vishing / Fake Helpdesk",
        "Insider Threat",
        "Physical Security",
        "Lookalike Domain",
        "Cloud Misconfiguration",
        "OAuth App Consent Phishing"
    ]
    
    # 1. Phishing & Social Engineering
    t1_senders = ["IT_Support@company-helpdesk.net", "hr-benefits@company.hr-update.com", "admin@office365-alert.com", "paypal-security@paypaI.com", "ceo@company-exec.net"]
    t1_topics = ["Urgent Account Verification", "Mandatory Benefit Enrollment", "Overdue Invoice Attached", "Password Expiry Warning", "Security Alert: Unusual Login"]
    t1_snippets = [
        "Your account will be suspended in 24 hours unless you verify your identity by clicking the link below.",
        "Please review the attached PDF regarding the upcoming changes to your health benefits.",
        "Your recent payment was declined. Please update your billing information immediately.",
        "Your password expires today. Click here to retain your current password.",
        "We detected a login from an unrecognized device. If this was not you, secure your account now."
    ]
    t1_options = [
        {"correct": "Report the email using the Phishing button and do not click links.", "wrong1": "Reply to the sender to ask if it's legitimate.", "wrong2": "Click the link but only look at the page without entering details.", "wrong3": "Forward it to your colleagues to warn them."}
    ]

    # I'll build a helper to dynamically generate 10 for a given type by combining components safely
    def make_scenarios(threat_type, senders, topics, snippets, contexts, solutions, explanations):
        results = []
        for i in range(10):
            sender = random.choice(senders)
            topic = random.choice(topics)
            snippet = random.choice(snippets)
            context = random.choice(contexts)
            solution = random.choice(solutions)
            exp = random.choice(explanations)
            
            options = [
                {
                    "id": "A",
                    "text": solution["correct"],
                    "is_correct": True,
                    "explanation": exp
                },
                {
                    "id": "B",
                    "text": solution["wrong1"],
                    "is_correct": False,
                    "explanation": "Incorrect. This could compromise your system or violate policy."
                },
                {
                    "id": "C",
                    "text": solution["wrong2"],
                    "is_correct": False,
                    "explanation": "Incorrect. This introduces unnecessary risk."
                },
                {
                    "id": "D",
                    "text": solution["wrong3"],
                    "is_correct": False,
                    "explanation": "Incorrect. Following this action bypasses security protocols."
                }
            ]
            random.shuffle(options)
            # Reassign IDs A, B, C, D
            for idx, letter in enumerate(["A", "B", "C", "D"]):
                options[idx]["id"] = letter
                
            results.append({
                "id": f"{threat_type.replace(' ', '-').lower()}-{i}",
                "scenario_date": (datetime.now() - timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d"),
                "topic": topic,
                "threat_type": threat_type,
                "difficulty": random.choice(["Easy", "Medium", "Hard"]),
                "points_reward": random.choice([50, 100, 150, 200]),
                "briefing": {
                    "sender": sender,
                    "subject": topic,
                    "body_snippet": snippet,
                    "context": context
                },
                "options": options
            })
        return results

    # Data banks for 10 types:
    data_banks = {
        "Credential Harvesting": {
            "senders": ["support@it-desk-help.com", "hr@benefits-portal-update.com", "admin@web-mail-admin.co"],
            "topics": ["Account Suspension Notice", "Urgent Benefit Update", "Password Expiry"],
            "snippets": ["Click the link below to verify your account immediately.", "Review the attached document to claim your new benefits.", "Your password expires in 2 hours. Click to keep it."],
            "contexts": ["Received in your work email inbox.", "Received via SMS on your company phone.", "A message on LinkedIn from someone claiming to be IT."],
            "solutions": [{"correct": "Report via the official phishing button.", "wrong1": "Click to check the URL.", "wrong2": "Reply to ask who it is.", "wrong3": "Ignore and delete without reporting."}],
            "explanations": ["Reporting helps the security team block the attack for everyone.", "Official channels should always be used to report suspicious messages."]
        },
        "BEC / Vendor Impersonation": {
            "senders": ["ceo@company-exec.net", "finance@supplier-portal.co", "vendor@trusted-partner-inc.com"],
            "topics": ["Wire Transfer Request", "Updated Banking Details", "Urgent Payment Needed"],
            "snippets": ["I need you to process a wire transfer to our new vendor immediately.", "Please update our banking details for all future invoices to the attached account.", "We have a critical payment pending. Process it today to avoid delays."],
            "contexts": ["Email looks like it's from the CEO but the domain is slightly off.", "Invoice received from a known vendor, but the reply-to address is different.", "Marked as 'Urgent' and 'Confidential'."],
            "solutions": [{"correct": "Verify the request via a known, trusted phone number.", "wrong1": "Process the payment immediately as requested.", "wrong2": "Reply to the email to confirm the new details.", "wrong3": "Forward to a colleague and ask them to do it."}],
            "explanations": ["Out-of-band verification is crucial for financial requests.", "Always verify unexpected financial changes verbally with a known contact."]
        },
        "Malicious Attachment": {
            "senders": ["Unknown User", "Automated System", "no-reply@scanner.com"],
            "topics": ["Unexpected Attachment", "Macro Warning", "System Alert"],
            "snippets": ["Please find the invoice attached (invoice.zip).", "This document requires you to Enable Content to view.", "Your PC is infected! Download this tool to clean it."],
            "contexts": ["You plug in a USB drive found in the lobby.", "You receive an unsolicited email with a ZIP file.", "A pop-up appears on a website you are browsing."],
            "solutions": [{"correct": "Disconnect from the network and contact IT immediately.", "wrong1": "Open the file to see what it is.", "wrong2": "Enable macros just this once.", "wrong3": "Run your own antivirus scan and continue working."}],
            "explanations": ["Disconnecting prevents the malware from spreading across the network.", "Never enable macros on unexpected documents."]
        },
        "MFA Fatigue": {
            "senders": ["Security Team", "Service Desk", "System Administrator"],
            "topics": ["Verify Your Credentials", "Unusual Login Attempt", "App Re-authentication"],
            "snippets": ["Please reply with your current password to verify your account.", "We detected a login from Russia. Click here and log in to secure your account.", "Your session expired. Please enter your credentials on this external page."],
            "contexts": ["You receive a phone call from someone claiming to be IT asking for your password.", "You are prompted to log in to a familiar service, but the URL looks strange.", "A colleague asks to borrow your login because theirs is locked."],
            "solutions": [{"correct": "Never share your password and navigate to the service manually.", "wrong1": "Provide your password since they are IT.", "wrong2": "Click the link and log in to be safe.", "wrong3": "Share your credentials with your colleague temporarily."}],
            "explanations": ["Legitimate IT staff will never ask for your password.", "Always check the URL and navigate directly to the service."]
        },
        "Vishing / Fake Helpdesk": {
            "senders": ["Coffee Shop Wi-Fi", "Airport Network", "Home Router"],
            "topics": ["Connecting to Public Network", "VPN Usage", "Shoulder Surfing"],
            "snippets": ["Please connect to 'Free_Airport_WiFi' to access the internet.", "You are working in a crowded cafe and need to review confidential documents.", "Your home router still uses the default admin password."],
            "contexts": ["Working remotely from a coffee shop.", "Waiting at the airport for a flight.", "Setting up your home office network."],
            "solutions": [{"correct": "Always use the corporate VPN on public networks and position your screen privately.", "wrong1": "Connect directly to public Wi-Fi without a VPN.", "wrong2": "Work on sensitive documents where others can easily see your screen.", "wrong3": "Leave your laptop unlocked while you grab a coffee."}],
            "explanations": ["VPNs encrypt your traffic, protecting it from interception on public networks.", "Screen privacy and VPN usage are critical when working in public spaces."]
        },
        "Insider Threat": {
            "senders": ["Disgruntled Employee", "Overly Curious Colleague", "Departing Staff"],
            "topics": ["Unauthorized Access", "Data Export", "Sharing Access"],
            "snippets": ["A colleague asks for access to a project folder they shouldn't be in.", "You notice a co-worker downloading large amounts of data to a USB drive.", "An employee who is leaving next week asks you to email them some client lists."],
            "contexts": ["Working late in the office.", "Reviewing audit logs.", "Casual conversation in the breakroom."],
            "solutions": [{"correct": "Report the suspicious behavior to HR or Security.", "wrong1": "Grant them access since they asked nicely.", "wrong2": "Ignore it, it's probably fine.", "wrong3": "Confront the colleague directly and aggressively."}],
            "explanations": ["Reporting suspicious internal behavior is key to preventing data loss.", "Even colleagues can pose a security risk if policies are not followed."]
        },
        "Physical Security": {
            "senders": ["Delivery Person", "Unknown Individual", "Former Employee"],
            "topics": ["Holding the Door", "Unescorted Visitor", "Lost Badge"],
            "snippets": ["Someone carrying a large box asks you to hold the door open for them.", "You see someone wandering the office without a visitor badge.", "You find a lost access badge in the parking lot."],
            "contexts": ["Entering the secure office building.", "Walking through the office hallways.", "Arriving at work in the morning."],
            "solutions": [{"correct": "Politely ask them to use their own badge or direct them to reception.", "wrong1": "Hold the door open for them to be polite.", "wrong2": "Assume they are supposed to be there and ignore them.", "wrong3": "Use the found badge to see whose it is."}],
            "explanations": ["Physical access controls rely on every individual verifying authorization.", "Tailgating is a common method for unauthorized physical access."]
        },
        "Lookalike Domain": {
            "senders": ["Taxi Driver", "Hotel Staff", "Conference Organizer"],
            "topics": ["Lost Laptop", "Stolen Phone", "Unattended Device"],
            "snippets": ["You realize you left your company phone in a taxi.", "Your laptop is stolen from your hotel room.", "You need to step away from your laptop at a conference."],
            "contexts": ["Traveling for business.", "Attending a busy industry conference.", "Commuting to the office."],
            "solutions": [{"correct": "Report the loss immediately so a remote wipe can be initiated.", "wrong1": "Wait a few days to see if it turns up before reporting.", "wrong2": "Try to track and recover the device yourself.", "wrong3": "Leave the device unlocked on your desk."}],
            "explanations": ["Immediate reporting minimizes the window for data compromise.", "Remote wipe capabilities can protect data on lost devices if reported promptly."]
        },
        "Cloud Misconfiguration": {
            "senders": ["Marketing Team", "External Partner", "Cloud Storage Provider"],
            "topics": ["Sharing PII", "Unencrypted Email", "Improper Disposal"],
            "snippets": ["A partner requests a list of customer emails in an Excel file.", "You need to send sensitive health data to a vendor.", "You have printed confidential reports that you no longer need."],
            "contexts": ["Collaborating with a third-party vendor.", "Handling customer data for a marketing campaign.", "Cleaning out your desk at the office."],
            "solutions": [{"correct": "Use an approved, encrypted transfer method and shred physical documents.", "wrong1": "Email the unencrypted file directly to the partner.", "wrong2": "Throw the printed reports in the regular recycling bin.", "wrong3": "Store the PII on your personal Google Drive."}],
            "explanations": ["Protecting PII and sensitive data requires secure transfer and disposal methods.", "Unencrypted emails and regular trash bins expose sensitive data to unauthorized access."]
        },
        "OAuth App Consent Phishing": {
            "senders": ["Security Operations", "Helpdesk", "Compliance Officer"],
            "topics": ["Suspected Breach", "Phishing Click", "Policy Violation"],
            "snippets": ["You accidentally clicked a link in a phishing email.", "You suspect your account has been compromised.", "You witness a colleague violating a major security policy."],
            "contexts": ["Realizing a mistake was made.", "Noticing strange activity on your account.", "Observing policy non-compliance in the workplace."],
            "solutions": [{"correct": "Report the incident immediately using official channels.", "wrong1": "Hide the mistake and hope nothing happens.", "wrong2": "Try to fix the issue yourself without telling anyone.", "wrong3": "Wait until your next performance review to mention it."}],
            "explanations": ["Early detection and reporting are critical for effective incident response.", "Hiding incidents often leads to much greater damage and consequences."]
        }
    }

    for threat_type, bank in data_banks.items():
        scenarios.extend(make_scenarios(
            threat_type=threat_type,
            senders=bank["senders"],
            topics=bank["topics"],
            snippets=bank["snippets"],
            contexts=bank["contexts"],
            solutions=bank["solutions"],
            explanations=bank["explanations"]
        ))
        
    random.shuffle(scenarios)

    with open('public/scenarios.json', 'w') as f:
        json.dump(scenarios, f, indent=2)
        
if __name__ == "__main__":
    generate_scenarios()
