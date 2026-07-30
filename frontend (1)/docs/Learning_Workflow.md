# Learning Workflow

## User Journey

### 1. Registration & Authentication
```
Landing Page → Register → Login
```

### 2. Onboarding
```
Dashboard → Choose Sign Language → Select Skill Level → Set Learning Goals → Complete Profile
```

### 3. Learning Path
```
Browse Courses → Enroll → Watch Lessons → Practice Signs → Take Assessment → Earn Certificate
```

### 4. Profile Management
```
Profile Page → Edit Preferences → View Progress → Update Goals
```

## Authentication Flow

```
[User] → POST /auth/register → [Backend: Hash Password, Create User + Profile]
[User] → POST /auth/login → [Backend: Verify Password, Issue JWT]
[User] → Request with Bearer Token → [Backend: Verify JWT, Check Role]
```

## Role-Based Access

| Role | Permissions |
|------|-------------|
| Learner | View courses, practice, take assessments, manage own profile |
| Admin | Manage users, courses, view analytics, system settings |

## Profile Completion Flow

1. User registers → empty profile created (0% completion)
2. User sets sign language preference → +20%
3. User sets skill level → +20%
4. User sets learning goals → +20%
5. User adds bio/location → +20%
6. User uploads avatar → +20%
