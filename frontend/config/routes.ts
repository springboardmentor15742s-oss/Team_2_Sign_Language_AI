export const ROUTES = {
  HOME: '/',
  DOCUMENTATION: '/docs',
  API_HEALTH: '/api/v1/health',
  
  // Future Module Route Placeholders
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  LEARNER: {
    DASHBOARD: '/dashboard/learner',
    COURSES: '/courses',
    PRACTICE: '/practice',
    ASSESSMENTS: '/assessments',
  },
  INSTRUCTOR: {
    DASHBOARD: '/dashboard/instructor',
  },
  ADMIN: {
    DASHBOARD: '/dashboard/admin',
  },
} as const;
