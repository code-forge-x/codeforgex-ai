# CodeForegX Master Architecture

---

## Introduction & Vision

**CodeForegX** is a specialized, next-generation orchestration and code generation platform for financial trading automation. Our vision is to deliver ultra-reliable, low-latency, and highly reusable trading components, trained exclusively on official sources, and optimized for both expert and beginner users. This document is the master reference for system architecture, logic, and terminology—serving as both blueprint and developer knowledge base.

---

## 1. High-Level System Blueprint

### 1.1 System Philosophy
- **Official Source Only Training** → **Micro-Modular Components** → **Ultra-Low Latency** → **Specialized Financial Domain**

### 1.2 Architecture Flow Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 1 (COMPLETE)                          │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React) ◄───► Backend (Node/Express) ◄───► MongoDB   │
│       Chat Interface    │    Prompt Management     │  Projects │
└─────────────────────────┼─────────────────────────────────────────┘
                          │
┌─────────────────────────┼─────────────────────────────────────────┐
│                    PHASE 2 (MVP NEXT)                          │
├─────────────────────────┼─────────────────────────────────────────┤
│    Official Library     │     Micro-Component      │   Quality   │
│    Scraping System  ◄───┼────► Generation Hub  ◄───┼──► Control  │
└─────────────────────────┼─────────────────────────────────────────┘
                          │
┌─────────────────────────┼─────────────────────────────────────────┐
│                    PHASE 3 (OPTIMIZATION)                      │
├─────────────────────────┼─────────────────────────────────────────┤
│  Ultra-Fast Component   │   AI Training Pipeline   │  Performance │
│  Database (TimescaleDB) │   (Feedback Loop)        │  Monitoring  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Component & Layer Diagram
```
┌──────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                        │
├──────────────────────────────────────────────────────────────────┤
│  Chat Interface  │  Code Editor  │  Dashboard  │  Component Lib  │
└─────────┬────────────────┬───────────────┬──────────────┬────────┘
          │                │               │              │
          ▼                ▼               ▼              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                          │
├──────────────────────────────────────────────────────────────────┤
│     API Gateway     │    Session Mgmt    │    Auth & Security    │
└─────────┬───────────────────┬────────────────────┬──────────────┘
          │                   │                    │
          ▼                   ▼                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                     CORE SERVICES LAYER                         │
├──────────────────────────────────────────────────────────────────┤
│ Prompt Manager │ Component Gen │ Quality Control │ Feedback Loop │
└─────────┬──────────────┬──────────────┬──────────────┬──────────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
┌──────────────────────────────────────────────────────────────────┐
│                  SPECIALIZED AI LAYER                           │
├──────────────────────────────────────────────────────────────────┤
│  Official Lib    │  Micro-Component  │  Performance  │  Training │
│  Scraper         │  Generator        │  Optimizer    │  Pipeline │
└─────────┬────────────────┬──────────────┬──────────────┬────────┘
          │                │              │              │
          ▼                ▼              ▼              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    DATA STORAGE LAYER                           │
├──────────────────────────────────────────────────────────────────┤
│  MongoDB        │  TimescaleDB     │  Redis Cache   │  Vector DB │
│  (Projects)     │  (Components)    │  (Sessions)    │  (Search)  │
└──────────────────────────────────────────────────────────────────┘
```

### 1.4 Tech Stack
- **Frontend:** React, Material-UI, react-markdown, react-icons, Monaco Editor/CodeMirror
- **Backend:** Node.js, Express, Anthropic Claude API, JWT Auth
- **Database:** MongoDB (projects, sessions, users), TimescaleDB (planned), Redis (planned), Milvus (planned)
- **Other:** Docker, ESLint, Prettier, Jest/Mocha (testing), CI/CD pipelines (planned)

### 1.5 Code Editor Management
- **Editor Component:** Use Monaco Editor or CodeMirror for code editing and syntax highlighting.
- **Integration:** Embed the editor component within the React frontend for seamless user interaction.
- **Packaging:** Bundle the editor as a standalone application using Electron or a web-based solution for downloadable use.

---

## 2. Subsystem Logic & Flow (Blueprint Style)

### 2.1 User Interface Layer
- **What:** React-based chat, code editor, dashboard, and component library UI (`client/`)
- **Why:** Provides intuitive, real-time interaction for users to generate, review, and manage trading code and components.
- **Flow:**
  - User submits request (e.g., "Create grid system MQL5")
  - UI displays code, feedback, and analytics

### 2.2 Orchestration Layer
- **What:** API gateway, session management, authentication, and security (`server/routes/`, `server/middleware/`)
- **Why:** Centralizes request routing, user/session state, and security for all backend operations.
- **Flow:**
  - Receives user/API requests
  - Authenticates and manages session context
  - Routes to core services

### 2.3 Core Services Layer
- **What:** Prompt management, component generation, quality control, and feedback loop (`server/services/`, `server/utils/`)
- **Why:** Implements the business logic for code generation, validation, and continuous improvement.
- **Flow:**
  - Extracts parameters, fills defaults, renders templates
  - Generates or retrieves components
  - Collects and processes feedback
  - Optimizes prompts/components

### 2.4 Specialized AI Layer
- **What:** Official library scraping, micro-component generation, performance optimization, and AI training pipeline (`server/services/officialLibScraper.js`, `server/services/microComponentGenerator.js`)
- **Why:** Ensures all code is sourced from official documentation, modularized, and optimized for speed and accuracy.
- **Flow:**
  - Scrapes and validates official sources
  - Splits code into micro-modules
  - Fingerprints and indexes components
  - Feeds performance and feedback data into training pipeline

### 2.5 Data Storage Layer
- **What:** Multi-database architecture for projects, components, sessions, and search (`server/models/`, TimescaleDB, Redis, Vector DB)
- **Why:** Enables ultra-fast, reliable storage and retrieval of all system data, supporting analytics and real-time operations.
- **Flow:**
  - Stores user projects (MongoDB)
  - Stores components and metrics (TimescaleDB)
  - Caches hot data (Redis)
  - Supports semantic search (Vector DB)

---

## 3. Glossary & Knowledge Base

| Term/Feature         | What is it?                                                                 | Why are we using it?                                                                                 |
|----------------------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| **Official Source**  | Documentation or code from MQL5, QuickFIX, MATLAB, etc.                     | Ensures accuracy, compliance, and reliability of generated code.                                     |
| **Micro-Module**     | Small, reusable code unit optimized for token limits and performance.        | Enables fast, composable, and memory-efficient code generation.                                      |
| **Fingerprint**      | Unique hash/index for a component or code block.                            | Allows ultra-fast lookup, deduplication, and reuse of components.                                    |
| **TimescaleDB**      | Time-series optimized relational database.                                   | Provides ultra-low latency for component retrieval and real-time analytics.                          |
| **Redis**            | In-memory data store for caching.                                            | Accelerates hot data access (e.g., most-used components, sessions).                                  |
| **Vector DB**        | Database for vector (embedding) search.                                      | Enables semantic code/component search and similarity matching.                                      |
| **Prompt Manager**   | Service for assembling and optimizing LLM prompts.                           | Centralizes prompt logic, supports feedback-driven improvement.                                      |
| **Quality Control**  | Multi-layer validation (source, AI, performance).                            | Ensures only high-quality, accurate, and performant code is delivered.                               |
| **Feedback Loop**    | System for collecting and acting on user/AI feedback.                        | Drives continuous improvement and adaptation of components and prompts.                              |
| **Component Library**| Database of reusable, validated code modules.                                | Maximizes code reuse, reliability, and speed of code generation.                                     |
| **Token Optimization**| Process of minimizing code size for LLM context limits.                     | Ensures generated code fits within LLM token constraints and is efficient.                           |
| **Session Management**| Tracks user/project context across requests.                                | Enables context-aware code generation and project continuity.                                        |
| **Authentication**   | User and API identity verification.                                          | Secures system access and protects sensitive data.                                                   |
| **API Gateway**      | Central entry point for all backend/API requests.                            | Simplifies routing, monitoring, and security for backend services.                                   |
| **Performance Metrics**| Real-time tracking of latency, success, and usage.                         | Enables monitoring, optimization, and SLA enforcement.                                               |
| **Official Library Scraper**| Service for extracting code/data from official sources.                | Automates population and updating of the component library with trusted code.                        |
| **Component Generator**| Service for creating and optimizing micro-modules.                         | Automates modularization, optimization, and validation of code blocks.                               |
| **Human/AI Review**  | Manual and automated code validation.                                        | Ensures correctness, compliance, and best practices.                                                 |
| **Project Data**     | User-created projects, configs, and history.                                 | Supports user workflows, versioning, and reproducibility.                                            |

---

## 4. Component & Data Flow (Logic Overview)

1. **User submits request** via chat or dashboard (e.g., "Create grid system MQL5").
2. **API Gateway** authenticates and routes the request to backend services.
3. **Prompt Manager** extracts parameters, fills defaults, and assembles the LLM prompt.
4. **Component Generator** searches for matching micro-modules (fingerprint search) or creates new ones from official sources.
5. **Quality Control** validates the code (source, AI, performance).
6. **Component Library** stores/retrieves the validated component.
7. **Feedback Loop** collects user/AI feedback and updates metrics.
8. **Performance Monitoring** tracks latency, usage, and success rates.
9. **Response** is returned to the user, with code, metrics, and feedback options.

---

## 5. Codebase Cross-Reference

- **Frontend:** `client/` (UI, chat, dashboard, code editor)
- **Backend:** `server/` (API, orchestration, services)
  - **API Routes:** `server/routes/api/`
  - **Services:** `server/services/`
    - `officialLibScraper.js`, `microComponentGenerator.js`, `promptManager.js`, `performanceOptimizer.js`
  - **Models:** `server/models/`
    - `OfficialComponent.js`, `ComponentFingerprint.js`
  - **Utils:** `server/utils/`
    - `officialValidator.js`, `tokenOptimizer.js`, `latencyTracker.js`
- **Database:**
  - **MongoDB:** Projects, user data (`server/models/`)
  - **TimescaleDB:** Components, metrics (external schema)
  - **Redis:** Session cache (external config)
  - **Vector DB:** Semantic search (planned)

---

## 6. Success Metrics & Monitoring

- **Component Retrieval Latency:** < 10ms (avg)
- **Official Source Accuracy:** > 99.5%
- **Component Reuse Rate:** > 85%
- **Token Optimization:** < 1500 tokens/component
- **Compilation Success Rate:** > 98%
- **Version Accuracy:** 100% (no MQL4 in MQL5 projects)
- **Real-Time Monitoring:** Prometheus/Grafana endpoints for all core services

---

## 7. Security, Extensibility, and CI/CD

- **Security:** JWT auth, input validation, audit logging, GDPR compliance
- **Extensibility:** Plug-in architecture for new scrapers/generators, modular service design
- **CI/CD:** Automated testing, code linting, and deployment pipelines (Jest/Mocha, ESLint, Docker, GitHub Actions)

---

## 8. Glossary Quick Reference (for Training)

See Section 3 above for full table. Use this as a quick lookup for onboarding and ongoing development.

---

## UI/UX Enhancement Vision & Roadmap

To deliver a world-class, USP-driven user experience, CodeForegX is implementing a phased UI/UX enhancement plan. This plan is tracked in PROJECT_PROGRESS.md and detailed in DEVELOPER_GUIDE.md.

### Key UI/UX Enhancements (PO1–PO9)

- **PO1: Material-UI Integration** – Modern, unified design system and theme toggle. (Completed)
- **PO2: Global Notification System** – Consistent feedback for all user/system actions. (Completed)
- **PO3: Component Library Browser** – Searchable, analytics-rich explorer for official micro-modules. (Completed)
- **PO4: Feedback Loop UI** – User feedback/rating on code/components, feedback history, and quality metrics. (Completed)
- **PO5: Analytics Dashboards** – User/admin dashboards with usage, performance, and feedback charts. (Completed; dashboards are now live on User and Admin dashboards)
- **PO6: Code Editor Integration** – Monaco/CodeMirror for code display/editing.
- **PO7: Atomic Component Refactor** – Smaller, reusable UI components.
- **PO8: Responsive & Accessible Design** – Mobile/tablet support, accessibility improvements.
- **PO9: Additional Context Providers** – Theme, Project, Notification context for state management.
- **PO10: Sleek Chat UI & Document Creation** – Enhanced windsurf-style chat UI with integrated editor and document creation/saving capabilities.
- **PO11: Downloadable Window Editor** – Implement a downloadable window editor similar to Windsurf's style.

#### Analytics Dashboards (PO5)
- **User Dashboard:** Visualizes project usage, code generation history, and feedback summary.
- **Admin Dashboard:** Displays system-wide analytics, component performance, prompt effectiveness, and user feedback trends.
- **Tech:** Integrates recharts/Chart.js for interactive visualizations.
- **Role in Architecture:** Enables data-driven decision making, quality monitoring, and continuous improvement across the platform.

### Downloadable Window Editor (PO11)

**What is it?**
A standalone, downloadable code editor application (desktop or web-based) styled after Windsurf, designed for editing, saving, and managing trading code and documents. It leverages modern code editor components and integrates with the CodeForegX platform.

**Why are we using it?**
- Provides users with a powerful, familiar, and offline-capable code editing experience.
- Enables advanced editing, syntax highlighting, and document management outside the browser.
- Supports the platform's USP of professional, modular, and user-friendly tooling for both beginners and experts.

**Tech Specs:**
- **Editor Component**: Use Monaco Editor or CodeMirror for code editing and syntax highlighting.
- **Packaging**: Bundle as a standalone application using Electron or a web-based solution.
- **Integration**: Provide a download button in the UI for easy access.
- **Code Reference**: See `client/components/DownloadableEditor.js` (or equivalent Electron entry point).

**Blueprint Style:**
```
┌─────────────────────────────────────────────────────────────────┐
│                    DOWNLOADABLE WINDOW EDITOR                  │
├─────────────────────────────────────────────────────────────────┤
│  Editor Component (Monaco/CodeMirror)                          │
│  Packaging (Electron/Web)                                      │
│  Integration (Download Button)                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Detailed Flow Diagram:**
```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  Chat Interface  │  Code Editor  │  Dashboard  │  Component Lib  │
└─────────┬────────────────┬───────────────┬──────────────┬────────┘
          │                │               │              │
          ▼                ▼               ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│     API Gateway     │    Session Mgmt    │    Auth & Security    │
└─────────┬───────────────────┬────────────────────┬──────────────┘
          │                   │                    │
          ▼                   ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CORE SERVICES LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│ Prompt Manager │ Component Gen │ Quality Control │ Feedback Loop │
└─────────┬──────────────┬──────────────┬──────────────┬──────────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SPECIALIZED AI LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Official Lib    │  Micro-Component  │  Performance  │  Training │
│  Scraper         │  Generator        │  Optimizer    │  Pipeline │
└─────────┬────────────────┬──────────────┬──────────────┬────────┘
          │                │              │              │
          ▼                ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA STORAGE LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB        │  TimescaleDB     │  Redis Cache   │  Vector DB │
│  (Projects)     │  (Components)    │  (Sessions)    │  (Search)  │
└─────────────────────────────────────────────────────────────────┘
```

**Knowledge Base & Glossary (PO11):**
| Term/Feature         | What is it?                                                                 | Why are we using it?                                                                                 |
|----------------------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| **Downloadable Window Editor** | A standalone code editor app (Electron/web) for editing and managing code/projects. | Provides offline, advanced editing and document management for users.                                |
| **Monaco Editor**    | A powerful, VSCode-like code editor component for web/Electron apps.        | Delivers professional code editing features (syntax, autocomplete, etc.) in the downloadable app.    |
| **CodeMirror**       | Lightweight, embeddable code editor for browsers and Electron.              | Alternative to Monaco for smaller footprint or different feature set.                                |
| **Electron**         | Framework for building cross-platform desktop apps with web tech.            | Allows packaging the editor as a native desktop application.                                         |
| **Download Button**  | UI element to trigger download/install of the editor app.                   | Makes it easy for users to access and install the downloadable editor.                               |
| **Integration**      | The process of connecting the downloadable editor with the main platform.   | Ensures seamless workflow between browser and desktop editing.                                       |
| **Document Management** | Features for saving, opening, and organizing code files/projects.        | Empowers users to manage their work efficiently, both online and offline.                            |
| **Code Reference**   | `client/components/DownloadableEditor.js`, Electron main process entry file | For implementation details and further development.                                                  |

**Best Practices:**
- Follow modular, maintainable code structure (see `client/components/DownloadableEditor.js`).
- Document all features and parameters in code and user docs.
- Ensure accessibility and cross-platform compatibility.
- Use official libraries and keep dependencies up to date.
- Reference this section and DEVELOPER_GUIDE.md for onboarding and ongoing development.

These enhancements directly support our USP: official-source-only, micro-modular, ultra-low latency, and feedback-optimized financial code generation. See PROJECT_PROGRESS.md for status and DEVELOPER_GUIDE.md for implementation guidelines.

---

_This document is a living reference. Update as the system evolves and new features/components are added._ 