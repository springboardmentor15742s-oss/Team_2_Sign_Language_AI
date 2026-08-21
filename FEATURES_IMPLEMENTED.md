# SignSpeak implementation update

## Learner workflow
- Live course catalogue from FastAPI instead of mock course data.
- Course cards use backend thumbnails when supplied, with local SignSpeak course artwork fallbacks.
- `Enroll in Course` persists through `POST /courses/{course_id}/enroll`.
- `My Enrolled Courses` loads from `GET /courses/enrolled`.
- Enrollment progress is stored in PostgreSQL and updated when published lessons are completed.
- Course detail uses live course and lesson APIs.
- Learner profile reads and writes profile fields through `/users/profile`.
- Profile includes level, preferred sign language, learning goals, location, bio and avatar URL.
- Profile progress/assessment/practice cards use connected report endpoints.

## PDF alignment
The implementation directly covers the PDF-supported learner profile fields, course learning path/enrollment workflow, progress monitoring, practice/assessment history presentation, and learner dashboard data. The PDF's AI gesture recognition, pose tracking, feedback intelligence, certification and deployment engines remain dependent on their respective backend/ML implementations and are not fabricated by this frontend update.
