# GBSEC – Local AI-Powered Cybersecurity Awareness & Training Platform

**Featuring RAG-Based Phishing Investigation for Groupement Berkine (Sonatrach – Oxy) JV**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-Scenario%20Engine-3776AB?logo=python)](https://python.org/)
[![Ollama](https://img.shields.io/badge/AI-Ollama-black)](https://ollama.com/)
[![Deployment](https://img.shields.io/badge/Deployment-On--Premises-orange)](https://www.docker.com/)

**GBSEC** is an internally deployed, AI-powered cybersecurity awareness and training platform developed for Groupement Berkine (Sonatrach–Oxy Joint Venture) during an internship within its IT&T Department.

It combines gamified cybersecurity education, realistic phishing simulations, locally hosted AI assistance, and AI-powered suspicious-file investigation into a unified platform designed for the cybersecurity challenges of the oil and gas industry.

---

## Table of Contents

- [Project Overview](#project-overview)
- [The Problem](#the-problem)
- [Project Objectives](#project-objectives)
- [Core Features](#core-features)
- [AI Architecture](#ai-architecture)
- [Technical Architecture](#technical-architecture)
- [Technology Stack](#technology-stack)
- [Deployment and Security Constraints](#deployment-and-security-constraints)
- [Live Demo and Evaluation Access](#live-demo-and-evaluation-access)
- [Running the Project Locally](#running-the-project-locally)
- [Project Structure](#project-structure)
- [Initial Evaluation and Results](#initial-evaluation-and-results)
- [Development Methodology](#development-methodology)
- [Author and Contributions](#author-and-contributions)
- [Original React + Vite Template Documentation](#original-react--vite-template-documentation)

---

## Project Overview

GBSEC (Groupement Berkine Security) is a cybersecurity awareness and training platform designed specifically for the operational context of an oil and gas joint venture.

The platform addresses the human factor in cybersecurity by transforming conventional security awareness programmes into interactive learning experiences.

Rather than relying exclusively on presentations, passive videos, and standardized questionnaires, GBSEC allows employees to:

- Complete interactive cybersecurity training.
- Practise identifying realistic phishing and social engineering attempts.
- Receive contextual explanations from an AI cybersecurity assistant.
- Submit suspicious digital artifacts for AI-assisted investigation.
- Track their progress through gamification and performance indicators.

A central design principle is **local AI deployment**. The platform uses locally hosted language models rather than relying on external cloud-based AI inference services for its core AI functionality.

This architecture is particularly relevant to organizations operating sensitive corporate and industrial infrastructure, where information confidentiality and control over internal data are essential.

## The Problem

Oil and gas organizations operate complex environments involving corporate Information Technology (IT), industrial Operational Technology (OT), external contractors, suppliers, and critical infrastructure.

These environments face several cybersecurity challenges:

### 1. Phishing and vendor impersonation

Employees regularly communicate with equipment manufacturers, contractors, and service providers.

Attackers can exploit these relationships through Business Email Compromise (BEC), fraudulent payment instructions, impersonated suppliers, and deceptive email domains.

### 2. IT/OT convergence

Corporate systems, enterprise applications, and industrial environments increasingly interact.

A compromised corporate workstation or employee account can introduce security risks that potentially extend towards interconnected industrial environments.

### 3. Passive cybersecurity training

Traditional awareness programmes often depend on mandatory videos, presentations, and generic assessments.

Employees may complete these activities without developing the practical skills needed to recognize real-world attacks.

### 4. Limited investigation experience

Employees are frequently instructed to report suspicious communications but are rarely provided with a safe environment to understand suspicious documents, identify indicators of compromise, or investigate potential phishing attempts.

GBSEC addresses these challenges through practical simulations, contextual AI assistance, and an integrated investigation environment.

## Project Objectives

The main objectives were to:

- Modernize cybersecurity awareness and induction training.
- Improve employee recognition of phishing and social engineering attacks.
- Introduce realistic scenarios based on oil and gas operations and supply chains.
- Integrate existing SCORM-compatible learning materials.
- Provide AI-powered cybersecurity guidance.
- Enable preliminary investigation of suspicious digital artifacts.
- Deploy AI inference locally to protect sensitive organizational information.
- Encourage employee engagement through gamification and measurable learning progress.

## Core Features

### 1. Authentication and SOC-Inspired Dashboard

The platform provides an organizational training environment with a dark interface inspired by Security Operations Center (SOC) dashboards.

Its interface includes:

- User authentication.
- Training progress indicators.
- Interactive learning modules.
- Experience points (XP).
- Achievement badges.
- Performance and engagement tracking.

The objective is to make cybersecurity training more engaging and encourage continuous participation.

### 2. SCORM 1.2 Learning Integration

GBSEC integrates existing SCORM 1.2-compatible interactive training packages.

A custom JavaScript SCORM runtime adapter provides compatibility between legacy learning content and the modern React application.

The adapter:

- Exposes the SCORM `window.API` object.
- Implements communication methods such as `LMSInitialize`, `LMSSetValue`, and `LMSCommit`.
- Runs training packages inside an isolated iframe.
- Synchronizes course completion and learning progress with the application.

This allows existing training materials to operate within the GBSEC interface without requiring them to be rebuilt.

### 3. Dynamic Threat Scenario Engine

GBSEC includes a procedural threat-generation engine built with Python.

It generates interactive cybersecurity challenges based on ten attack vectors.

Examples include:

| Attack vector | Description |
|---|---|
| Business Email Compromise (BEC) | Fraudulent corporate communications and payment requests. |
| Vendor impersonation | Attackers pretending to represent legitimate suppliers. |
| Credential harvesting | Attempts to steal employee login credentials. |
| MFA fatigue | Repeated authentication requests designed to manipulate users. |
| OAuth consent phishing | Malicious application permission requests. |

The scenario engine combines attack patterns with an oil and gas supplier context, including recognizable industry organizations and deceptive lookalike domains.

Examples include scenarios involving suppliers such as Baker Hughes, SLB, and Halliburton.

Employees interact with these scenarios, select responses, and receive immediate explanations to understand why particular communications may be malicious.

### 4. Renos – Context-Aware AI Cybersecurity Assistant

Renos is the platform's integrated AI cybersecurity tutor.

It is accessible throughout the application and provides explanations, guidance, and contextual assistance.

Its capabilities include:

- Explaining cybersecurity concepts.
- Answering questions about training material.
- Providing contextual guidance based on the active module.
- Helping employees understand suspicious situations.
- Supporting cybersecurity awareness within the oil and gas environment.

**AI implementation:**

- Ollama for local model inference.
- Qwen 3.5 4B as the language model.
- Hermes Agent framework.
- Ubuntu Server and Docker Compose for deployment.

Unlike externally hosted AI assistants, Renos is designed to operate within the organization's local infrastructure.

### 5. Investigate – AI-Powered Phishing Investigation

Investigate provides a simulated security investigation environment where employees can submit suspicious digital artifacts for preliminary analysis.

Instead of simply being told not to open suspicious attachments, employees can explore how potential threats are examined.

The investigation interface supports several categories:

- Phishing Analysis.
- Malware Detection.
- Social Engineering.
- General Security Audit.

The analysis workflow includes:

1. Submission of a suspicious digital artifact.
2. File metadata processing.
3. Preliminary heuristic checks.
4. Extraction and sanitization of relevant analysis information.
5. Processing through the locally deployed AI agent.
6. Presentation of AI-assisted investigation findings.

The project incorporates a Retrieval-Augmented Generation (RAG)-based investigation approach to support contextual analysis and more relevant AI-generated explanations.

The purpose is to help employees understand suspicious indicators and develop better incident recognition and reporting practices.

**Important:** The investigation module is intended for preliminary awareness and triage, not as a replacement for professional malware analysis, endpoint detection, or a dedicated Security Operations Center.

---

## AI Architecture

A major architectural decision in GBSEC was to avoid making core AI functionality dependent on external cloud inference services.

The AI environment is deployed locally using:

| Component | Technology | Purpose |
|---|---|---|
| Model runtime | Ollama | Local language model inference. |
| Language model | Qwen 3.5 4B | Natural language understanding and generation. |
| Agent framework | Hermes | AI assistant and agent orchestration. |
| Infrastructure | Ubuntu Server | Local AI hosting environment. |
| Containerization | Docker Compose | AI service deployment and management. |

This approach provides greater control over AI processing and helps prevent internal organizational information from being unnecessarily transmitted to external AI providers.

The RAG-based investigation capability complements the language model by introducing contextual information into the analysis process.

---

## Technical Architecture

GBSEC follows a layered architecture that separates the frontend, backend services, training runtime, procedural generation engine, and local AI infrastructure.

| Layer | Technologies | Responsibilities |
|---|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Lucide React | User interface and application interactions. |
| Backend | Node.js, Express, Axios, Multer | REST APIs, application logic, telemetry, and file uploads. |
| AI infrastructure | Ollama, Qwen 3.5 4B, Hermes | Local AI assistance and investigation. |
| Scenario generation | Python 3, JSON Schema | Dynamic cybersecurity scenario generation. |
| E-learning | Custom SCORM 1.2 Runtime Adapter | Integration of existing learning packages. |
| Deployment | Ubuntu Server, Docker Compose | Local service orchestration. |

### Application workflow

1. Employees access the GBSEC web application through an internal browser.
2. The React frontend communicates with the Node.js backend through REST APIs.
3. Training packages execute inside isolated iframes using the custom SCORM runtime.
4. Python-generated scenarios provide interactive cybersecurity exercises.
5. Renos communicates with the local AI infrastructure to provide contextual assistance.
6. Investigate processes submitted artifacts and forwards relevant information for AI-assisted analysis.

---

## Deployment and Security Constraints

**GBSEC is an internally deployed web application, not a publicly accessible SaaS platform.**

The application was deployed within the host organization's environment for internal use and testing.

This deployment model was intentional because of the nature of the organization's operations and the sensitivity of its internal information.

There are two important constraints concerning external access:

**1. Local AI infrastructure**

The AI assistant and investigation capabilities depend on locally hosted services, including Ollama, the Qwen language model, and the associated agent infrastructure.

These services operate within the organization's internal environment and are not exposed as publicly accessible AI endpoints.

Consequently, an external visitor cannot independently access the complete AI functionality through a public URL.

**2. Organizational confidentiality and NDA**

The project was developed and deployed in the context of an internship with Groupement Berkine (Sonatrach–Oxy JV), under the organization's internal security and confidentiality requirements.

An NDA was signed with the host organization.

For this reason, the production application, internal infrastructure, organizational data, and associated services cannot be made publicly accessible for unrestricted evaluation.

These restrictions are intentional and reflect the security and confidentiality requirements of the environment in which the project was developed.

---

## Live Demo and Evaluation Access

**Live production demo: Not publicly available.**

GBSEC operates as an internally deployed web application within Groupement Berkine's environment.

A public demo URL with unrestricted access cannot be provided because:

- The production application is hosted internally.
- Core AI services rely on locally deployed infrastructure.
- Internal services and organizational resources cannot be exposed to the public internet.
- The project is subject to an NDA and organizational confidentiality requirements.

### How can judges evaluate the project?

To ensure that the project remains demonstrable despite these restrictions, the recommended evaluation materials are:

1. **Demonstration video:** A recorded walkthrough showing the actual application, its main modules, AI assistant, threat simulations, and investigation workflow.
2. **Screenshots:** Interface captures illustrating the platform's main features and technical implementation.
3. **Public source repository:** The codebase and technical documentation, excluding confidential organizational information, credentials, internal configurations, and restricted deployment details.

The demonstration video should serve as the primary way for judges to experience the application's functionality without requiring access to the organization's internal infrastructure.

---

## Running the Project Locally

The project uses a React + Vite frontend, a Node.js backend, and locally hosted AI services.

Running the complete application requires configuring the individual services and their dependencies.

### Prerequisites

- Node.js and npm.
- Python 3.
- Git.
- Ollama.
- Docker and Docker Compose.
- Ubuntu Server or another compatible Linux environment for local AI deployment.

### 1. Clone the repository

```bash
git clone <YOUR_PUBLIC_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure the backend

Navigate to the backend service directory and install its dependencies using the available `package.json`.

Configure the required environment variables using the project's environment configuration.

Do not use production credentials, internal addresses, or confidential organizational configuration files.

### 4. Configure the AI infrastructure

Install Ollama and configure the local model environment.

The project uses Qwen 3.5 4B and the Hermes Agent framework.

The required model and agent services must be available locally for AI-dependent functionality to operate.

### 5. Configure the scenario engine

Install the Python dependencies required by the scenario-generation component.

The procedural scenario generator uses Python and JSON Schema.

### 6. Start the frontend development server

```bash
npm run dev
```

Vite will provide a local development URL, typically:

```text
http://localhost:5173
```

**Note:** Starting the frontend alone does not provide the complete GBSEC experience. Backend services, AI infrastructure, and their configurations must also be running and correctly connected.

The exact service startup commands depend on the repository's backend and deployment configuration.

---

## Project Structure

The application is organized around the following logical components:

```text
GBSEC/
│
├── Frontend/
│   ├── React application
│   ├── Training dashboard
│   ├── SCORM integration
│   ├── Threat simulations
│   ├── Renos AI interface
│   └── Investigate interface
│
├── Backend/
│   ├── Node.js
│   ├── Express APIs
│   ├── Authentication
│   ├── File upload processing
│   └── Application services
│
├── AI/
│   ├── Ollama
│   ├── Qwen 3.5 4B
│   └── Hermes Agent
│
├── Scenario Engine/
│   ├── Python
│   ├── generate_scenarios.py
│   └── JSON Schema
│
└── Deployment/
    ├── Ubuntu Server
    └── Docker Compose
```

*This is a logical representation of the system architecture, not necessarily the exact physical directory structure of the repository.*

---

## Initial Evaluation and Results

According to the internship report, initial evaluation across test cohorts within the IT&T Department demonstrated improvements compared with the legacy training approach.

| Evaluation metric | Legacy training | GBSEC |
|---|---:|---:|
| Course completion | 48% within 30 days | 94% within 14 days |
| Average active engagement | 8.5 minutes | 34.2 minutes |
| Lookalike domain detection | 31% | 88% |
| Mean time to report suspicious events | 4.2 hours | 28 minutes |

These figures represent the initial evaluation results documented in the internship report, rather than independently verified production-wide measurements.

The results indicate the potential value of interactive training, realistic simulations, and contextual assistance in improving cybersecurity awareness.

---

## Development Methodology

The project was developed using an Agile-Scrum approach, organized into two-week development sprints.

The development process included:

- Requirements gathering and discussions with IT&T personnel.
- Architectural planning and technology selection.
- Rapid prototyping of the application interface.
- Development of backend and frontend components.
- Integration of SCORM-compatible learning materials.
- Local AI infrastructure configuration.
- Implementation of procedural threat scenarios.
- Testing and refinement of the platform's main features.

The project was developed within Groupement Berkine's IT&T Department as an applied engineering internship project.

---

## Author and Contributions

**Developed by: Anas Miloudi**

Computer Science – Networks, University of Batna 2, Algeria.

**Host organization:** Groupement Berkine (Sonatrach–Oxy JV).

**Department:** IT&T Department.

**Year:** 2026.

The project was designed, developed, and integrated by Anas Miloudi, covering the application architecture, frontend and backend development, SCORM integration, procedural scenario generation, local AI integration, and deployment-related configuration.

The work combined network engineering foundations with full-stack development, applied AI, and industrial cybersecurity awareness.

---

## License and Confidentiality

This repository is intended to demonstrate the technical work and architecture behind GBSEC.

The public source code and documentation must not contain confidential company information, internal infrastructure details, production credentials, or restricted organizational data.

The internal deployment and production environment remain subject to Groupement Berkine's confidentiality requirements and the applicable NDA.

---

## Original React + Vite Template Documentation

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.