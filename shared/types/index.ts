/**
 * SignLearn Monorepo - Shared Core Types
 */

import { UserRole, DifficultyLevel, AssessmentStatus } from '../enums';

export type UUID = string;
export type ISODateString = string;

export interface BaseEntity {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  isDeleted: boolean;
  createdBy?: UUID | null;
  updatedBy?: UUID | null;
}

export interface UserSummary {
  id: UUID;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string | null;
}

export interface SystemHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: ISODateString;
  services: {
    postgres: boolean;
    mongodb: boolean;
    redis: boolean;
  };
}
