# SignLearn Naming Conventions

| Entity | Python | TypeScript | Example |
| :--- | :--- | :--- | :--- |
| **Files** | `snake_case.py` | `camelCase.ts` / `PascalCase.tsx` | `health_check.py` / `Button.tsx` |
| **Classes** | `PascalCase` | `PascalCase` | `BaseModel`, `UserRole` |
| **Functions** | `snake_case` | `camelCase` | `get_db()`, `useHealth()` |
| **Variables** | `snake_case` | `camelCase` | `user_id`, `isLoading` |
| **Constants** | `UPPER_SNAKE_CASE` | `UPPER_SNAKE_CASE` | `API_V1_STR`, `APP_CONFIG` |
| **DB Tables** | `snake_case_plural` | N/A | `users`, `practice_attempts` |
| **DB Columns** | `snake_case` | N/A | `created_at`, `is_deleted` |
