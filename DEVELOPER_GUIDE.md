# CodeForegX Developer Guide

## 🏗️ Key Features & Tech Stack

**Key Features:**
- Conversational AI chat interface for financial trading code generation
- Multi-phase project workflow (requirements, blueprint, approval, code, admin review)
- Context-aware session and project management
- Integration with Claude 3.7 Sonnet (Anthropic) for LLM-powered responses
- MT5/MQL5 code generation and blueprinting
- Markdown support for bot responses
- Admin dashboard and analytics (planned)
- Prompt management and external template system (planned)
- Document fingerprinting and vector search (planned)
- Grid trading, Fibonacci, and EMA-based trading strategies (EA generation)

**Tech Stack:**
- **Frontend:** React, Material-UI, react-markdown, react-icons
- **Backend:** Node.js, Express, Anthropic Claude API, JWT Auth
- **Database:** MongoDB (projects, sessions, users), TimescaleDB (planned), Redis (planned), Milvus (planned)
- **Other:** Docker, ESLint, Prettier, Jest/Mocha (testing), CI/CD pipelines (planned)

---

Welcome to the CodeForegX codebase! This guide outlines best practices and procedures for contributing to the project, following modern software development industry standards.

---

## 🚀 Project Setup
- Clone the repository: `git clone <repo-url>`
- Install dependencies: `npm install` (or `yarn install`)
- Copy `.env.example` to `.env` and fill in required secrets
- Start the development server: `npm start` or `docker-compose up`
- For frontend: `cd client && npm start`
- For backend: `cd server && npm start`

## 🌳 Branching Strategy
- Use [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) or [GitHub Flow](https://guides.github.com/introduction/flow/)
- Main branches:
  - `main` (production-ready)
  - `develop` (integration/testing)
- Feature branches: `feature/<short-description>`
- Bugfix branches: `bugfix/<short-description>`
- Hotfix branches: `hotfix/<short-description>`
- Release branches: `release/<version>`

## 📝 Commit Message Conventions
- Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
  - `feat: add new feature`
  - `fix: fix a bug`
  - `docs: update documentation`
  - `refactor: code refactoring`
  - `test: add or update tests`
  - `chore: maintenance, build, or tooling changes`
- Example: `feat(chat): add markdown support for bot messages`

## 🧑‍💻 Code Style & Linting
- Use Prettier and ESLint for JS/TS code
- Follow Airbnb or Google style guides
- Run `npm run lint` and `npm run format` before pushing
- Use descriptive variable and function names
- Write modular, reusable code

## 🧪 Testing
- Write unit tests for new features and bug fixes
- Use Jest, Mocha, or your preferred test runner
- Place tests in `__tests__` or alongside source files
- Run all tests before submitting a PR: `npm test`

## 🔍 Code Review Process
- Open a Pull Request (PR) to `develop` or `main` as appropriate
- Request at least one code review
- Address all review comments before merging
- Use draft PRs for work-in-progress

## 🚢 Deployment
- Use CI/CD pipelines for automated testing and deployment
- Tag releases with semantic versioning (e.g., `v1.2.0`)
- Update documentation and changelogs for each release

## 🤝 How to Contribute
- Read and follow this guide
- Check the [PROJECT_PROGRESS.md](./PROJECT_PROGRESS.md) and [FUTURE_DEVELOPMENT_PLAN.md](./FUTURE_DEVELOPMENT_PLAN.md) for open tasks
- Discuss large changes in issues or with the team before starting
- Be respectful and collaborative in code reviews and discussions

## 🚨 Top Priority: Orchestration & Phase Transition Logic

<span style="color: red; font-weight: bold;">🚨 All contributors: Implementing orchestration & phase transition logic (backend, frontend, and phase-specific prompt templates) is the current top priority. See PROJECT_PROGRESS.md and FUTURE_DEVELOPMENT_PLAN.md for details. Do not proceed to other features until this is complete. 🚨</span>

---

_This guide is a living document. Please update it as the project evolves!_ 