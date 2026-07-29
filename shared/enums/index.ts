/**
 * SignLearn Monorepo - Shared Enumerations
 * Shared across frontend and backend API definitions.
 */

export enum UserRole {
  LEARNER = 'learner',
  INSTRUCTOR = 'instructor',
  ACCESSIBILITY_TRAINER = 'accessibility_trainer',
  ADMINISTRATOR = 'administrator',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum AssessmentStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PASSED = 'passed',
}

export enum GestureConfidence {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  OPTIMAL = 'optimal',
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system',
}
