# Database Schema

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐
│   roles     │       │ learner_profiles │
├─────────────┤       ├─────────────────┤
│ id (PK)     │◄──────│ id (PK)         │
│ name        │       │ user_id (FK)    │
│ description │       │ learning_level  │
│ created_at  │       │ preferred_lang  │
│ updated_at  │       │ learning_goals  │
└─────────────┘       │ profile_completion│
                      │ bio             │
                      │ location        │
                      │ created_at      │
                      │ updated_at      │
                      └─────────────────┘
                            │
                            ▼
                      ┌─────────────┐
                      │    users    │
                      ├─────────────┤
                      │ id (PK)     │
                      │ full_name   │
                      │ email (UQ)  │
                      │ password_hash│
                      │ is_active   │
                      │ is_verified │
                      │ role_id (FK)│
                      │ created_at  │
                      │ updated_at  │
                      └─────────────┘
```

## Tables

### roles
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, auto-increment |
| name | VARCHAR(50) | NOT NULL, UNIQUE |
| description | VARCHAR(255) | |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | ON UPDATE |

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, auto-increment |
| full_name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| is_active | BOOLEAN | DEFAULT TRUE |
| is_verified | BOOLEAN | DEFAULT FALSE |
| role_id | INTEGER | FK → roles.id |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | ON UPDATE |

### learner_profiles
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, auto-increment |
| user_id | INTEGER | FK → users.id, UNIQUE |
| learning_level | VARCHAR(50) | DEFAULT 'beginner' |
| preferred_sign_language | VARCHAR(50) | DEFAULT 'asl' |
| learning_goals | JSON | DEFAULT [] |
| profile_completion | FLOAT | DEFAULT 0.0 |
| bio | TEXT | |
| location | VARCHAR(100) | |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | ON UPDATE |

## Relationships

- `users.role_id` → `roles.id` (Many-to-One)
- `learner_profiles.user_id` → `users.id` (One-to-One)
