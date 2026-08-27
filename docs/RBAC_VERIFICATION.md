# RBAC Verification Report

## Scope
This verification covers the supplied SignSpeak backend authorization implementation and the frontend route guards.

## Server-side controls verified by source inspection
- JWT access tokens are required for protected resources.
- Inactive users receive HTTP 403.
- Public registration is restricted to `student`/Learner accounts.
- Admin-only user listing, staff creation, role changes, and account activation/deactivation use `require_admin`.
- Instructor course/lesson management uses role checks plus instructor ownership checks.
- Learners can only submit assessments for themselves.
- Learners can only view their own assessment results.
- Notifications enforce `notification.user_id == current_user.id`.
- Practice sessions enforce `session.user_id == current_user.id`.
- Lesson completion is restricted to the current learner's enrollment.
- Unpublished courses/lessons/assessments are hidden from learners.
- Assessment correct answers are not exposed through the learner assessment response schema.
- `/api/v1` and `/api` aliases use the same routers and therefore the same RBAC dependencies.

## Frontend controls added
- All dashboard/application routes now require authentication.
- `/admin` is additionally restricted to the `admin` role.
- Authentication bootstrap now waits for `/auth/me` before redirecting, preventing a false unauthenticated redirect during startup.

## Important distinction
Frontend route guards are UX/access-visibility controls, not the security boundary. The FastAPI server-side checks remain authoritative.

## Runtime status
Static/source verification and Python compilation were performed. Full live HTTP RBAC integration testing requires the project's PostgreSQL database and configured environment secrets; those are not available in this offline verification environment. Therefore this report does **not** claim that live database-backed 401/403 responses were executed here.
