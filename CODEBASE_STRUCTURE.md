# CodeForegX Codebase Structure & Component Overview

This document provides a detailed overview of the CodeForegX codebase, explaining the purpose and usage of each major folder and component. Use this as a reference for onboarding, development, and architecture reviews.

---

## 🖥️ Frontend (client/)

- **client/src/App.js**
  - Main React app entry point. Sets up routing and global providers.
- **client/src/api.js**
  - API base URL and helpers for HTTP requests.
- **client/src/context/AuthContext.js**
  - React context for authentication state and user info.
- **client/src/services/aiService.js**
  - Handles communication with backend Claude API for AI chat responses.

### Components
- **client/src/components/dashboard/user/ChatWindow.js**
  - Main chat interface for users. Handles user/AI conversation, markdown rendering, and phase management.
- **client/src/components/dashboard/user/UserDashboard.js**
  - User dashboard container. Manages session, project, and chat state.
- **client/src/components/dashboard/user/ChatWindowErrorBoundary.js**
  - Error boundary for the chat window UI.
- **client/src/components/dashboard/user/Prompts.js**
  - UI for managing and displaying prompt templates.
- **client/src/components/dashboard/user/components/Sidebar.js**
  - Sidebar navigation for user dashboard (project/session selection).
- **client/src/components/dashboard/user/components/NewProjectModal.js**
  - Modal for creating new projects.
- **client/src/components/dashboard/components/ComponentList.js**
  - Displays a list of code/components (reusable UI for code gen).
- **client/src/components/dashboard/prompts/TemplateEditor.js**
  - Editor for prompt templates (admin/dev use).
- **client/src/components/dashboard/admin/UserManagement.js**
  - Admin UI for managing users.
- **client/src/components/dashboard/admin/PromptTemplateList.js**
  - Admin UI for managing prompt templates.
- **client/src/components/dashboard/admin/PromptManagementDashboard.js**
  - Admin dashboard for prompt management.
- **client/src/components/dashboard/developer/DeveloperDashboard.js**
  - Developer-specific dashboard (for advanced users).
- **client/src/components/layout/Navbar.js**
  - Top navigation bar for the app.
- **client/src/components/auth/Login.js / Register.js**
  - User authentication forms.
- **client/src/components/routing/PrivateRoute.js**
  - Route protection for authenticated pages.

---

## 🖥️ Backend (server/)

- **server/index.js**
  - Main Express app entry point. Loads env, sets up routes, connects to DB.
- **server/server.js**
  - (Legacy/alt) Simple server start script.

### API Routes (server/routes/api/)
- **ai.js**
  - Endpoint for Claude API integration. Handles AI chat requests.
- **chat.js**
  - Endpoint for chat-related logic (streaming, etc.).
- **projects.js**
  - Project/session management, phase transitions, context updates.
- **auth.js / users.js**
  - Authentication and user management endpoints.
- **templateImport.js / promptManagement.js**
  - Prompt/template import and management endpoints.
- **components.js**
  - Code/component management endpoints.

### Models (server/models/)
- **Session.js / Project.js / ProjectSession.js**
  - Mongoose schemas for project sessions, projects, and session logs.
- **User.js**
  - User schema (auth, roles, etc.).
- **Component.js**
  - Code component schema for modular code gen.
- **PromptTemplate.js / PromptVersionLog.js / PromptPerformance.js / PromptParameter.js / PromptComponent.js**
  - Schemas for prompt management, versioning, and performance tracking.

### Services (server/services/)
- **aiClient.js**
  - Handles direct Claude API calls and prompt formatting.
- **promptManager.js**
  - Business logic for prompt management and enhancement.

### Middleware (server/middleware/)
- **auth.js**
  - JWT authentication and user extraction middleware.
- **promptEnhancer.js**
  - Middleware for enhancing prompts before sending to AI.

### Controllers (server/controllers/)
- **promptTemplateController.js**
  - Handles prompt template CRUD and logic.
- **componentController.js**
  - Handles code component CRUD and logic.

### Utils (server/utils/)
- **componentParser.js / templateConverter.js**
  - Helpers for parsing and converting code/components/templates.

### Scripts (server/scripts/)
- **seedAdmin.js**
  - Script to seed an admin user into the database.

---

## 🗂️ Where to Use Each Component
- **Frontend components** are used in the React app for user/admin/developer dashboards, chat, and prompt/code management.
- **Services** (both frontend and backend) are used for API calls, AI integration, and business logic.
- **Models** define the data structure for MongoDB and are used throughout the backend.
- **Routes** expose API endpoints for frontend/backend communication.
- **Middleware** is used for authentication, prompt enhancement, and error handling in Express.
- **Controllers** encapsulate business logic for modularity and testability.
- **Utils** provide helper functions for code parsing and transformation.
- **Scripts** are for setup, seeding, and maintenance tasks.

---

_Last updated: {{DATE}}_

> **NOTE:** Orchestration & phase transition logic (with phase-specific prompt templates) is the current top priority. See `server/routes/api/projects.js`, `server/services/aiClient.js`, and `client/src/components/dashboard/user/ChatWindow.js` for main logic. Progress is tracked in PROJECT_PROGRESS.md. 