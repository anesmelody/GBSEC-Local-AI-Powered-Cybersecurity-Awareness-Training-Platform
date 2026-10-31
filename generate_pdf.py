from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'Internship Report: Groupement Berkine', 0, 1, 'C')
        self.ln(5)
    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, 'Page ' + str(self.page_no()), 0, 0, 'C')

pdf = PDF()
pdf.add_page()
pdf.set_font('Arial', '', 12)

content = """
1. Introduction
Groupement Berkine is a prominent entity in the Algerian energy sector, operating in the strategic Berkine Basin. Formed as a joint venture between the national oil company Sonatrach and international partners, Groupement Berkine plays a critical role in the exploration, extraction, and processing of hydrocarbons. Given the sensitive nature of the energy sector and its critical infrastructure, maintaining a robust cybersecurity posture is paramount. The organization must defend against evolving threats ranging from targeted phishing campaigns to sophisticated ransomware attacks.

2. Context and Motivation
In today's digital landscape, human error remains one of the most significant cybersecurity vulnerabilities. Traditional, once-a-year security awareness training is often insufficient to keep employees vigilant against increasingly sophisticated attacks. To address this, the IT and Security departments recognized the need for a continuous, engaging, and seamlessly integrated training solution. The objective of my internship was to design and develop a tool that transforms cybersecurity awareness from a passive compliance requirement into an active, daily habit for enterprise teams.

3. Project Overview: GBSEC - Cyber Resilience Drill
During my internship, I developed GBSEC - Cyber Resilience Drill, a gamified daily IT cybersecurity retention platform built as a browser extension. By replacing the default 'New Tab' page in the browser, GBSEC ensures that security awareness is constantly visible without being intrusive. It immerses employees in bite-sized, interactive cybersecurity scenarios and training modules, making learning an engaging and regular part of their daily workflow.

4. Detailed Functionalities
The application incorporates several key features to maximize user engagement and learning retention:

- Interactive Dashboard: A centralized, modern interface that replaces the browser's new tab page. It displays the user's progress, available modules, points, and current standing on the leaderboard.
- Gamified Threat Scenarios: Users face realistic, simulated scenarios across various threat vectors, including: Business Email Compromise (BEC), Credential Harvesting, MFA Fatigue, Malicious Attachments, and Insider Threats.
- AI Tutor (Renos): An integrated AI assistant named Renos that provides personalized guidance. Renos helps users understand complex security concepts, provides hints for difficult scenarios, and answers user queries in real-time.
- Investigation Tools: A specialized module allowing users to simulate the analysis of suspicious files, phishing emails, or social engineering attempts.
- Leaderboard & Gamification: A comprehensive points and ranking system that fosters healthy competition among employees.

5. Technology Stack and Architecture
To ensure high performance, security, and a modern user experience, the project was built using a robust, contemporary technology stack:

- Frontend Framework: React (v19) and Vite, providing a fast, responsive, and highly interactive user interface.
- Styling: Tailwind CSS (v4) for utility-first, maintainable design, complemented by Lucide React for consistent iconography.
- Browser Extension Architecture: Developed using Manifest V3. The application utilizes a background service worker (background.js), a popup interface (popup.html), and overrides the default new tab.
- Backend & Data Storage: Integration with Supabase to securely manage user progress, leaderboards, and scenario data.
- Data Generation & Scripting: Python was utilized extensively in the backend data preparation pipeline to programmatically generate hundreds of diverse, randomized cybersecurity scenarios tailored to the energy sector context.

6. Conclusion
My internship at Groupement Berkine provided an invaluable opportunity to merge software engineering with cybersecurity awareness. Developing the GBSEC extension allowed me to master modern web technologies like React and Manifest V3, while also deepening my understanding of enterprise security threats. The resulting application serves as a dynamic, scalable solution that actively strengthens the human firewall, contributing directly to the digital resilience of Groupement Berkine.
"""

# Replace newlines with spaces for wrapped text, keep paragraph breaks
paragraphs = content.split('\n\n')

for p in paragraphs:
    pdf.multi_cell(0, 7, p.replace('\n', ' ').strip())
    pdf.ln(5)

pdf.output('Internship_Report_Groupement_Berkine.pdf')
