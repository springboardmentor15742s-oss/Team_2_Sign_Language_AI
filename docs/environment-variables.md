# SignLearn Environment Variables Reference

| Variable Name | Default / Example | Purpose |
| :--- | :--- | :--- |
| `APP_NAME` | `SignLearn` | Display name of application |
| `ENVIRONMENT` | `development` | Runtime mode (`development`, `staging`, `production`) |
| `DEBUG` | `True` | Enables detailed logging and SQL statement echo |
| `API_V1_STR` | `/api/v1` | Base path prefix for version 1 API endpoints |
| `SECRET_KEY` | `dev_secret_key...` | Cryptographic secret for signing sessions |
| `JWT_SECRET` | `dev_jwt_secret...` | Secret for signing JWT tokens |
| `DATABASE_URL` | `postgresql+asyncpg://...` | Async PostgreSQL connection string |
| `MONGODB_URL` | `mongodb://admin:admin_secret...` | Async MongoDB connection string |
| `REDIS_URL` | `redis://localhost:6379/0` | Async Redis client URI |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | Public frontend API target URL |
