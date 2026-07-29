# SignLearn Monorepo Complete Folder Structure

```text
SignLearn/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .husky/
│   └── pre-commit
├── assets/
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   └── env.py
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── health.py
│   │   │       ├── router.py
│   │   │       └── __init__.py
│   │   ├── authentication/
│   │   │   ├── jwt.py
│   │   │   ├── oauth.py
│   │   │   ├── password.py
│   │   │   ├── security.py
│   │   │   ├── token.py
│   │   │   └── __init__.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── logging.py
│   │   ├── database/
│   │   │   ├── mongodb.py
│   │   │   ├── postgres.py
│   │   │   └── redis.py
│   │   ├── dependencies/
│   │   │   ├── common.py
│   │   │   ├── database.py
│   │   │   ├── pagination.py
│   │   │   └── security.py
│   │   ├── exceptions/
│   │   │   ├── exceptions.py
│   │   │   ├── handlers.py
│   │   │   └── __init__.py
│   │   ├── middleware/
│   │   │   ├── cors_middleware.py
│   │   │   └── logging_middleware.py
│   │   ├── ml/
│   │   ├── models/
│   │   │   ├── base.py
│   │   │   └── __init__.py
│   │   ├── repositories/
│   │   ├── routers/
│   │   ├── schemas/
│   │   │   ├── base.py
│   │   │   └── health.py
│   │   ├── services/
│   │   ├── tests/
│   │   │   └── test_health.py
│   │   ├── utils/
│   │   └── main.py
│   ├── .env.example
│   ├── .flake8
│   ├── alembic.ini
│   ├── pyproject.toml
│   ├── pytest.ini
│   └── requirements.txt
├── docker/
│   ├── nginx/
│   │   └── nginx.conf
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
├── docs/
│   ├── api-documentation.md
│   ├── api-versioning-strategy.md
│   ├── architecture-overview.md
│   ├── coding-standards.md
│   ├── database-overview.md
│   ├── deployment-guide.md
│   ├── developer-setup-guide.md
│   ├── environment-variables.md
│   ├── folder-responsibilities.md
│   ├── folder-structure.md
│   ├── future-module-integration.md
│   ├── naming-conventions.md
│   └── setup-guide.md
├── frontend/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── common/
│   │   │   └── ThemeToggle.tsx
│   │   ├── layout/
│   │   │   ├── Container.tsx
│   │   │   ├── Grid.tsx
│   │   │   └── Section.tsx
│   │   ├── navigation/
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Table.tsx
│   │       └── Typography.tsx
│   ├── config/
│   │   ├── app.ts
│   │   ├── constants.ts
│   │   ├── routes.ts
│   │   └── theme.ts
│   ├── public/
│   │   ├── animations/
│   │   ├── future-models/
│   │   ├── icons/
│   │   ├── images/
│   │   ├── logos/
│   │   └── videos/
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   └── health.ts
│   │   ├── hooks/
│   │   │   └── useHealth.ts
│   │   ├── mutations/
│   │   └── queries/
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── index.ts
│   │   └── themeStore.ts
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── next.config.mjs
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.js
│   └── tsconfig.json
├── scripts/
├── shared/
│   ├── constants/
│   │   └── index.ts
│   ├── enums/
│   │   └── index.ts
│   ├── interfaces/
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   ├── index.ts
│   └── package.json
├── .env.example
├── .gitignore
├── .lintstagedrc.json
├── .pre-commit-config.yaml
├── docker-compose.yml
├── package.json
└── README.md
```
