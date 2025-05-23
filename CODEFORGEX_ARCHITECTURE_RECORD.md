# CodeForegX Master Architecture (Record)

## System Overview
CodeForegX is an AI-assisted financial trading code generation platform using Claude 3.7 Sonnet with a conversational chat interface, specialized for trading applications.

## System Architecture Diagram
```
               ┌───────────────────────┐
                │                       │
                │     User Interface    │
                │                       │
                └───────────┬───────────┘
                            │
                            ▼
      ┌───────────────────────────────────────┐
      │         Chat Interface Layer          │
      └───────────────────┬───────────────────┘
                          │
                          ▼
      ┌───────────────────────────────────────┐
      │          API Gateway Layer            │
      └───────────────────┬───────────────────┘
                          │
             ┌────────────┴───────────┐
             │                        │
             ▼                        ▼
┌─────────────────────┐    ┌──────────────────────┐
│   Core Services     │    │   AI Services        │
└──────────┬──────────┘    └───────────┬──────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐
│ Repository Layer    │    │  Prompt Management   │
└──────────┬──────────┘    └───────────┬──────────┘
           │                           │
           └───────────────┬───────────┘
                           │
                           ▼
      ┌───────────────────────────────────────┐
      │            Database Layer             │
      └───────────────────────────────────────┘
```

## Core Module Map (with Status)
```
┌──────────────────────────────┐   ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
│ Chat Interface (✅ Complete) │   │ Admin Dashboard   │   │ Code Generation    │   │ Blueprint Gen      │
└───────────────┬──────────────┘   └───────┬────────────┘   └───────┬────────────┘   └───────┬────────────┘
                │                          │                    │                    │
                └──────────────────────────┼────────────────────┼────────────────────┘
                                           │                    │
                                   ┌───────┴───────┐   ┌───────┴───────┐
                                   │ Auth & Users  │   │ AI Integration │
                                   │ (✅ Complete) │   │ (✅ Complete)  │
                                   └───────┬───────┘   └───────┬───────┘
                                           │                   │
                      ┌────────────────────┼───────────────────┘
                      │                    │
┌─────────┴──────────────┐ ┌────────┴────────┐ ┌────────────────────┐ ┌────────────────────┐
│ External Prompt Mgmt   │ │ Token Mgmt      │ │ Doc Fingerprint    │ │ QuickFix Engine    │
│ System (⏳ In Progress)│ │ (⏳ In Progress) │ │ (🟡 Planned)       │ │ (🟡 Planned)        │
└─────────┬──────────────┘ └────────┬────────┘ └────────┬────────────┘ └────────┬──────────┘
          │                         │                   │                       │
          └─────────────────────────┼───────────────────┼───────────────────────┘
                                    │                   │
                           ┌────────┴────────┐ ┌────────┴───────┐
                           │ Vector Database │ │ Tech Support   │
                           │ (🟡 Planned)    │ │ (🟡 Planned)    │
                           └─────────────────┘ └────────────────┘
```

## Modules and Components (with Status)
1. **Chat Interface Module** (✅ Complete)
   - Natural language processing
   - Context-aware conversation flow
   - Project phase management
   - Multi-panel interface (chat + editor)
   - File navigation and management
2. **Code Generation Module** (✅ Complete)
   - MT5/MQL5 specialized generation
   - Component-based assembly
   - Trading strategy patterns
   - Financial validation checks
   - Code optimization
3. **Blueprint Generation Module** (✅ Complete)
   - Architecture diagram creation
   - Component dependency mapping
   - Trading system patterns
   - Blueprint visualization
   - Modification through chat
4. **Admin Dashboard Module** (⏳ In Progress)
   - User management interface (basic)
   - Token management console (basic)
   - Prompt template editor (planned)
   - System configuration (planned)
   - Analytics dashboard (planned)
   - Document crawler configuration (planned)
5. **External Prompt Management System** (⏳ In Progress)
   - Template storage and management (backend partial)
   - Component-based assembly (planned)
   - Version control system (planned)
   - Performance tracking (planned)
   - Template parameterization (planned)
   - Admin UI for customization (planned)
6. **Token Management System** (⏳ In Progress)
   - API key secure storage (basic)
   - Usage tracking and alerts (planned)
   - Rate limiting configuration (basic)
   - Provider management (Claude, basic)
   - Key rotation mechanism (planned)
7. **Document Fingerprinting System** (🟡 Planned)
   - Documentation crawler (planned)
   - Vector embedding generation (planned)
   - Similarity search (planned)
   - Documentation validation (planned)
   - Pattern extraction (planned)
   - Code library indexing (planned)
8. **QuickFix Engine** (🟡 Planned)
   - Automated code issue detection (planned)
   - Trading-specific validation (planned)
   - Smart fix generation (planned)
   - Version-aware corrections (planned)
   - MT5 compatibility checks (planned)
9. **Vector Database System** (🟡 Planned)
   - Embedding storage (planned)
   - Similarity search (planned)
   - Pattern recognition (planned)
   - Documentation linking (planned)
   - Code example storage (planned)
10. **Authentication & User System** (✅ Complete)
    - JWT authentication
    - Role-based access control
    - User management
    - Permission system
    - Session management
11. **AI Integration System** (✅ Complete)
    - Claude API client
    - Context management
    - Multi-step reasoning
    - Financial domain expertise
    - Error recovery
12. **Technical Support System** (🟡 Planned)
    - Context-aware assistance (planned)
    - Code debugging help (planned)
    - Trading knowledge base (planned)
    - Solution patterns (planned)
    - Interactive guidance (planned)
13. **Data Repository System** (✅ Complete)
    - MongoDB interface
    - TimescaleDB integration (planned)
    - Redis caching (planned)
    - Transaction management
    - Query optimization

## User Roles
- **Client Users**
  - Requirements description
  - Blueprint review/approval
  - Code viewing and testing
  - Technical support access (🟡 Planned)
- **Developer Users**
  - Project management
  - Code editing/optimization
  - Component configuration
  - Testing and deployment
  - Multiple project handling
- **Admin Users**
  - User management (⏳ In Progress)
  - Prompt template editing (planned)
  - API token management (⏳ In Progress)
  - System configuration (planned)
  - Analytics monitoring (planned)
  - Document crawler management (planned)

## Workflow Sequences (with Status)
- **Project Creation Workflow:**
  Requirements Chat → Intent Detection → Blueprint Generation → Blueprint Review → Component Generation → Testing → Deployment
  - **Status:** 80%+ Complete (Testing/Deployment UI pending)
- **Admin Management Workflow:**
  User Management → Token Configuration → Prompt Template Editing → Document Crawler Setup → System Monitoring
  - **Status:** In Progress
- **Documentation Integration Workflow:**
  Document Crawling → Validation → Embedding Generation → Vector Storage → Search Integration → AI Context Enhancement
  - **Status:** Planned/In Progress

## Multi-Database Architecture
- **MongoDB:** Projects, components, users, prompts (document store) (✅ Complete)
- **TimescaleDB:** Market data, backtest results (time-series database) (🟡 Planned)
- **Redis:** Caching, session management, pub/sub (🟡 Planned)
- **Milvus:** Vector embeddings for documentation and code (🟡 Planned)

## Critical Integration Points
- **Chat Interface ↔ AI Integration** (✅ Complete)
  - Context preservation
  - Phase transitions
  - Error handling
- **Admin Dashboard ↔ Token Management** (⏳ In Progress)
  - Secure key handling
  - Usage monitoring
  - Configuration controls
- **External Prompt ↔ AI Integration** (⏳ In Progress)
  - Template assembly
  - Dynamic parameters
  - Performance tracking
- **Document Fingerprinting ↔ Code Generation** (🟡 Planned)
  - Reference integration
  - Pattern matching
  - Validation
- **QuickFix Engine ↔ Code Editor** (🟡 Planned)
  - Error detection
  - Fix application
  - MT5 compatibility

## Security Architecture
- JWT authentication (✅ Complete)
- API key encryption (⏳ In Progress)
- Rate limiting (⏳ In Progress)
- Input validation (✅ Complete)
- HTTPS-only (deployment best practice)
- Prompt sanitization (✅ Complete)
- Role-based access (✅ Complete)
- Audit logging (🟡 Planned)

## MVP Implementation Priorities (with Status)
- Core Authentication & Chat Interface (✅ Complete)
- Financial Trading Code Generation (✅ Complete)
- External Prompt Management (⏳ In Progress)
- Admin Dashboard & Token Management (⏳ In Progress)
- Blueprint Generation & Visualization (✅ Complete)
- Technical Support System (🟡 Planned)
- Document Fingerprinting (Phase 2) (🟡 Planned)
- QuickFix Engine (Phase 2) (🟡 Planned)

## Orchestration & Phase Transition Logic (Implementation Roadmap)

<span style="color: red; font-weight: bold;">🚨 TOP PRIORITY: IMPLEMENT ORCHESTRATION & PHASE TRANSITION LOGIC (BACKEND + FRONTEND + PHASE-SPECIFIC PROMPT ENGINEERING) BEFORE ANY OTHER FEATURES. 🚨</span>

### Overview
The orchestration layer is responsible for moving a project through its lifecycle phases (requirements → blueprint → code → testing → deployment) based on user input, intent, and system state. This ensures the workflow is strictly followed and progress is traceable.

### Key Requirements
- **Intent Detection:**
  - The backend must detect user intent to advance phases (e.g., messages like "proceed", "continue", "start coding").
  - The frontend should provide UI controls (buttons) to explicitly advance to the next phase.
- **Phase Advancement:**
  - When intent is detected, the backend should update the session's `current_phase` (e.g., from `requirements` to `blueprint`, then to `code`).
  - The frontend should display the current phase and allow manual override if needed.
- **Prompt Engineering:**
  - Each phase must have a specific prompt template for the LLM. **(Update prompt templates in the admin utility to be phase-specific!)**
    - **Requirements phase:** Gather and clarify user needs.
    - **Blueprint phase:** Summarize requirements, ask for confirmation, and outline the solution.
    - **Code phase:** Instruct the LLM to generate code based on confirmed requirements and blueprint.
    - **Testing/Deployment phases:** Instruct the LLM to provide test cases, deployment steps, or review.
- **LLM Prompt Example for Code Phase:**
  - "Based on the following requirements and blueprint, generate a complete MQL5 Expert Advisor code for MT5. [Insert requirements here]"
- **Session/Context Management:**
  - All requirements, blueprints, and user confirmations must be stored in the session context and passed to the LLM as part of the prompt.
- **Progress Tracking:**
  - Each phase transition and LLM response should be logged in the session's activity log for traceability.

### Implementation Steps
1. **Backend:**
   - Add logic to detect phase-advancing intent in user messages.
   - Expose an endpoint (or use existing `/advance`) to update the session phase.
   - Ensure each phase has a dedicated, phase-specific prompt template.
   - Log all transitions and LLM responses.
2. **Frontend:**
   - Add UI controls for phase advancement (e.g., "Proceed to Code Generation").
   - Clearly display the current phase and allow manual override.
   - Send explicit phase advancement actions to the backend.
3. **LLM Prompting:**
   - Ensure the prompt sent to Claude is phase-specific and includes all relevant context.
   - For the `code` phase, the prompt must instruct the LLM to generate code, not just restate requirements.
4. **Testing:**
   - Test the full workflow: requirements → blueprint → code → testing → deployment.
   - Ensure the system does not get stuck in a requirements/blueprint loop.

### Progress Tracking Table
| Phase         | Current Status | Next Steps Needed                |
|---------------|---------------|----------------------------------|
| Requirements  | ✅            | —                                |
| Blueprint     | ✅            | —                                |
| Code          | ⏳/❌         | Implement phase transition, code prompt |
| Testing       | ⏳/❌         | Orchestrate phase, prompt, UI    |
| Deployment    | ⏳/❌         | Orchestrate phase, prompt, UI    |

---

**This section should be updated as orchestration logic is implemented and tested.**

---

**Legend:**
- ✅ Complete
- ⏳ In Progress
- 🟡 Planned

## Additional Notes
- The system architecture diagram and module map are subject to change as the codebase evolves.
- The status tags are used to indicate the current development stage of each module/component.
- The MVP Implementation Priorities section is subject to change as the system evolves. 