# CodeLearn Platform

AI-powered learning and developer productivity platform built with Next.js 14, TypeScript, and AWS services.

## Tech Stack

- **Framework:** Next.js 14.2+ (App Router)
- **Language:** TypeScript 5.3+
- **Styling:** Tailwind CSS 3.4+, shadcn/ui
- **State Management:** TanStack Query 5.x, React Context API
- **Forms:** React Hook Form + Zod
- **Code Editor:** Monaco Editor 4.6+
- **Testing:** Vitest 1.x (unit), Playwright 1.x (E2E)
- **Code Quality:** ESLint, Prettier, Husky, lint-staged

## Getting Started

### Prerequisites

- Node.js 20.x LTS
- npm 10.x

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run E2E tests with Playwright

## Project Structure

```
codelearn/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Protected routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── learning/          # Learning Mode components
│   ├── developer/         # Developer Mode components
│   └── shared/            # Shared components
├── lib/                   # Utilities, helpers
│   ├── agents/            # AI agents
│   ├── prompts/           # AI prompts
│   ├── db/                # Database utilities
│   └── utils/             # General utilities
├── types/                 # TypeScript types
├── tests/                 # Test files
│   ├── unit/              # Unit tests
│   └── e2e/               # E2E tests
└── public/                # Static assets
```

## Git Workflow

This project uses conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `test:` - Test changes
- `refactor:` - Code refactoring

Example: `feat: add user authentication`

## License

Private - All rights reserved
