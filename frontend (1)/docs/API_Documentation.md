# API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication

All protected endpoints require a Bearer token:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "confirm_password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "is_active": true,
    "is_verified": false,
    "role_id": 1,
    "created_at": "2026-01-01T00:00:00"
  }
}
```

#### POST /auth/login
Authenticate and receive tokens.

#### GET /auth/me
Get current authenticated user.

### Learner Profile

#### GET /profile/
Get the current user's learner profile.

#### PUT /profile/
Update learner profile.

#### DELETE /profile/
Delete learner profile.

### Health Check

#### GET /health
```json
{
  "status": "healthy",
  "service": "signspeak-api"
}
```

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |
