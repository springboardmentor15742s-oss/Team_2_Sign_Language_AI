# Project Objectives

## SignSpeak — AI-Powered Sign Language Learning & Assessment Platform

### Vision
Build an accessible, AI-driven platform that enables anyone to learn sign language effectively through structured courses, real-time practice with camera feedback, and verified assessments.

### Milestone 1 Objectives

1. **Platform Foundation**
   - Initialize React frontend with Vite and Tailwind CSS
   - Initialize FastAPI backend with PostgreSQL
   - Set up project structure and tooling

2. **Authentication & Security**
   - Implement JWT-based authentication
   - Password hashing with bcrypt
   - Role-based access control (Learner, Admin)

3. **Learner Profile Management**
   - Create, view, update, and delete learner profiles
   - Store learning preferences (language, level, goals)
   - Track profile completion status

4. **Database Design**
   - PostgreSQL schema with Users, Roles, LearnerProfiles tables
   - Proper foreign key relationships
   - Alembic migrations

5. **Dataset Preparation**
   - Download and organize 4 sign language datasets
   - Document dataset structure, labels, and formats
   - Implement preprocessing pipeline (resize, normalize, split)

6. **Documentation**
   - System architecture diagrams
   - API documentation
   - Database schema documentation
   - Installation and setup guides

### Out of Scope (Future Milestones)
- AI sign recognition model training
- Real-time camera gesture recognition
- Practice module with AI feedback
- Assessment scoring engine
- Certificates and badges
- Notifications system
- Deployment and CI/CD
