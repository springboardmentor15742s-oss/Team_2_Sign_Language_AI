# SignSpeak Frontend Enhancement

This package contains presentation-layer enhancements based on the Sign Language Learning & Assessment Platform specification.

## Enhanced
- Professional learner dashboard and AI learning workspace
- AI practice workspace visual hierarchy
- Dark, accessible dashboard navigation and topbar
- Landing page aligned with learning, gesture recognition, assessment, feedback and analytics modules
- Responsive layouts, spacing, typography, cards and accessibility-focused states

## Intentionally untouched
- `src/services/*`
- API base URL / `.env`
- Authentication logic
- React routes
- Backend endpoints, payloads, database and server code

Dynamic values are intentionally shown as API-ready placeholders where the existing backend service layer does not currently provide data.

## Course catalogue data

The frontend course catalogue is connected to the backend `/courses` API. A new backend seed script at `backend/scripts/seed_courses.py` supplies six published courses and thirty lessons aligned with the specification's six course categories. Run it once after database migrations to populate the learner catalogue.
