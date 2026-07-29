# SignLearn Coding Standards

## 1. Python (Backend)
- **Style Guide**: PEP 8 enforced via `Black` (line length 88) and `isort`.
- **Type Annotations**: Strict typing required for all function arguments and return types. Checked via `mypy`.
- **Docstrings**: Google-style docstrings for all classes, methods, and FastAPI routes.

## 2. TypeScript / React (Frontend)
- **Style Guide**: Standard Next.js ESLint + Prettier.
- **Component Pattern**: Functional components with strict `React.FC<Props>` interfaces.
- **State Management**: Local state via `useState`, global state via `Zustand`, server state via `TanStack Query`.
