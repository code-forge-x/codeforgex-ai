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

## 1. System Overview

### 1.1 Core Concepts
- **Component**: Reusable code module from official libraries
- **Micro-Module**: Optimized, token-efficient version of a component
- **Feedback Loop**: System for improving components based on usage and reviews

### 1.2 Key Workflows
```
User Request → Component Search → Code Generation → Feedback Collection → Optimization
```

## 2. Component Processing Pipeline

### 2.1 Library Scraping
```javascript
// Example scraping configuration
const scraper = new LibraryScraper({
  source: 'mql5',
  schedule: '0 0 * * *',  // Daily
  selectors: {
    functions: '.function-list',
    examples: '.code-example'
  }
});

// Start scraping
await scraper.start();
```

### 2.2 Data Cleaning
```javascript
// Example cleaning pipeline
const cleaner = new DataCleaner({
  steps: [
    {
      name: 'Code Extraction',
      processor: extractCodeBlocks,
      rules: ['Remove comments', 'Standardize formatting']
    },
    {
      name: 'Dependency Analysis',
      processor: analyzeDependencies,
      rules: ['Identify imports', 'Map function calls']
    }
  ]
});

// Process raw data
const cleanedData = await cleaner.process(rawData);
```

### 2.3 Component Generation
```javascript
// Example component generator
const generator = new ComponentGenerator({
  rules: {
    tokenLimit: 2000,
    maxFunctionLength: 50,
    requireDocumentation: true
  }
});

// Generate micro-modules
const components = await generator.generate(cleanedData);
```

## 3. Component Storage and Retrieval

### 3.1 Database Schema
```javascript
// Component Schema
const ComponentSchema = {
  name: String,
  description: String,
  content: String,
  metrics: {
    totalUses: Number,
    successRate: Number,
    avgScore: Number
  },
  variants: [{
    content: String,
    testResults: Object
  }]
};
```

### 3.2 Search and Retrieval
```javascript
// Example component search
const searcher = new ComponentSearcher({
  index: 'components',
  filters: {
    minSuccessRate: 0.8,
    maxTokens: 2000
  }
});

// Search for components
const results = await searcher.search({
  function: 'OrderSend',
  pattern: 'order_management'
});
```

## 4. Code Generation Flow

### 4.1 Request Processing
```javascript
// Example request handler
async function handleCodeRequest(request) {
  // 1. Extract parameters
  const params = extractParameters(request.message);
  
  // 2. Search for components
  const components = await searchComponents(params);
  
  // 3. Generate code
  const code = await generateCode(components, params);
  
  // 4. Optimize for tokens
  const optimizedCode = await optimizeForTokens(code);
  
  return optimizedCode;
}
```

### 4.2 Token Optimization
```javascript
// Example token optimizer
const optimizer = new TokenOptimizer({
  maxTokens: 2000,
  strategies: [
    'function_extraction',
    'code_simplification',
    'pattern_reuse'
  ]
});

// Optimize code
const optimized = await optimizer.optimize(code);
```

## 5. Feedback System

### 5.1 Feedback Collection
```javascript
// Example feedback collector
const collector = new FeedbackCollector({
  metrics: ['performance', 'usability', 'correctness'],
  storage: 'feedback_logs'
});

// Collect feedback
await collector.collect({
  componentId: 'order_manager',
  feedback: {
    score: 8,
    issues: ['high latency'],
    suggestions: ['optimize memory usage']
  }
});
```

### 5.2 Component Improvement
```javascript
// Example component improver
const improver = new ComponentImprover({
  strategies: [
    'performance_optimization',
    'code_simplification',
    'documentation_enhancement'
  ]
});

// Improve component
const improved = await improver.improve(component, feedback);
```

## 6. Implementation Guidelines

### 6.1 Code Standards
- Use TypeScript for type safety
- Follow modular architecture
- Implement error handling
- Add comprehensive logging
- Write unit tests

### 6.2 Performance Considerations
- Cache frequently used components
- Optimize database queries
- Implement rate limiting
- Monitor memory usage
- Track response times

### 6.3 Security Measures
- Validate all inputs
- Sanitize user data
- Implement access control
- Encrypt sensitive data
- Log security events

## 7. Development Workflow

### 7.1 Setup
```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### 7.2 Testing
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance
```

### 7.3 Deployment
```bash
# Build for production
npm run build

# Deploy to production
npm run deploy
```

## 8. Common Patterns

### 8.1 Component Creation
```javascript
// Example component creation
const component = new Component({
  name: 'OrderManager',
  description: 'Handles order operations',
  content: orderManagerCode,
  parameters: [
    {
      name: 'symbol',
      type: 'string',
      required: true
    },
    {
      name: 'volume',
      type: 'number',
      required: true
    }
  ]
});

await component.save();
```

### 8.2 Code Generation
```javascript
// Example code generation
const generator = new CodeGenerator({
  components: [orderManager, riskManager],
  parameters: {
    symbol: 'EURUSD',
    volume: 0.1
  }
});

const code = await generator.generate();
```

## 9. Troubleshooting

### 9.1 Common Issues
- Token limit exceeded
- Component not found
- Performance degradation
- Memory leaks
- Database connection issues

### 9.2 Debugging
```javascript
// Enable debug logging
const logger = new Logger({
  level: 'debug',
  file: 'debug.log'
});

// Add debug points
logger.debug('Processing request', { requestId, parameters });
```

## 10. Best Practices

### 10.1 Component Development
- Keep components small and focused
- Document all parameters
- Include usage examples
- Add error handling
- Optimize for tokens

### 10.2 Code Generation
- Reuse existing components
- Validate all inputs
- Handle edge cases
- Optimize performance
- Add comments

### 10.3 Testing
- Write unit tests
- Test edge cases
- Monitor performance
- Validate outputs
- Check error handling

## UI/UX Enhancement Plan (PO1–PO10)

To align with the system's USP and architecture, the following UI/UX enhancements are prioritized. Track progress in PROJECT_PROGRESS.md and see ARCHITECTURE.md for system context.

| PO  | Feature/Enhancement                | Developer Notes & Best Practices                                              |
|-----|------------------------------------|-------------------------------------------------------------------------------|
| PO1 | Material-UI Integration (In Progress) | Use MUI components, implement theme toggle, refactor CSS to MUI styling.      |
|     |                                    | Main app container/layout now uses MUI Container.                             |
|     |                                    | UserDashboard main layout migrated to MUI (Container, Grid, Paper).           |
|     |                                    | Use MUI layout components (Container, Box, Grid, Paper) for all new/refactored UI. |
|     |                                    | AdminDashboard migrated to MUI (Container, Grid, Paper).                        |
|     |                                    | Use this pattern for all admin and analytics screens.                           |
|     |                                    | ComponentList migrated to MUI (Container, Grid, Paper).                        |
|     |                                    | Use this pattern for all component library and list screens.                   |
| PO2 | Global Notification System (Completed) | All major screens now use NotificationContext for unified feedback. |
| PO3 | Component Library Browser (In Progress) | MUI Table with search/filter; Component preview modal; Usage stats and analytics; Add to Project/Rate actions. |
| PO4 | Feedback Loop UI (Completed) | ComponentList now supports user feedback/rating, feedback history, and quality metrics display. |
| PO5 | Analytics Dashboards (Completed) | User dashboard with usage/performance charts; Admin dashboard with system analytics; Integrate recharts/Chart.js for visualizations; Display feedback and quality metrics. Analytics dashboards are now live on User and Admin dashboards. |
| PO6 | Code Editor Integration            | Integrate Monaco/CodeMirror for code display/editing.                        |
| PO7 | Atomic Component Refactor          | Break down large files into smaller, reusable components.                     |
| PO8 | Responsive & Accessible Design     | Ensure mobile/tablet support, follow accessibility standards.                 |
| PO9 | Additional Context Providers       | Add Theme, Project, Notification context for state management.                |
| PO10 | Sleek Chat UI & Document Creation | Enhanced windsurf-style chat UI with integrated editor and document creation/saving capabilities. |

**Implementation Tips:**
- Use functional components and hooks.
- Keep UI atomic and reusable.
- Follow MUI and accessibility best practices.
- Cross-reference PROJECT_PROGRESS.md for status and ARCHITECTURE.md for system context.

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
- Reference this section and ARCHITECTURE.md for onboarding and ongoing development.

--- 