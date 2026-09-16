# SignSpeak Backend — RBAC Access Matrix

The backend enforces authorization server-side. Frontend route visibility is not a security boundary.

| Capability | Learner (`student`) | Instructor | Accessibility Trainer | Admin |
|---|---:|---:|---:|---:|
| Register publicly | Yes | No | No | No |
| Login / own profile | Yes | Yes | Yes | Yes |
| Browse published courses | Yes | Yes | Yes | Yes |
| Enroll in course | Yes | No | No | No |
| Complete lessons | Yes | No | No | No |
| Practice sessions | Yes | No | No | No |
| Submit assessments | Yes | No | No | No |
| View own results | Yes | Yes* | Yes* | Yes* |
| Create/update courses | No | Own courses | No | All |
| Create/update lessons | No | Own courses | No | All |
| View learner analytics | Own | Yes | Yes | Yes |
| Manage users / roles | No | No | No | Yes |
| Activate/deactivate users | No | No | No | Yes |

`*` Staff analytics/results access is intentionally broader for instructional and accessibility-support workflows.

## Important security corrections

1. Public registration is restricted to learner accounts. A client cannot self-register as admin or staff.
2. Admin-only user/role/status management is protected by `require_admin`.
3. Instructor course/lesson modification is ownership-checked.
4. Learners can only read published learning content and their own results/notifications.
5. Notification endpoints enforce ownership.
6. Assessment responses never return `correct_answer` to learners.
7. Inactive accounts are rejected by the JWT dependency.
8. CORS is restricted to the configured frontend origin.
9. Production startup rejects the default JWT secrets.
10. `accessibility_trainer` is supported as a first-class role matching the project specification. Existing `student` accounts represent the specification's Learner role.

## API prefix

Protected application endpoints are available under `/api/v1` and a backward-compatible `/api` alias so the supplied frontend can connect without frontend changes. Swagger is available at `/api/docs` when the server is running.
