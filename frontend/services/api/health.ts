import { apiClient } from './client';

export interface SystemHealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  app_name: string;
  version: string;
  environment: string;
  timestamp: string;
  services: {
    postgres: boolean;
    mongodb: boolean;
    redis: boolean;
  };
}

export interface HealthApiResponse {
  success: boolean;
  message: string;
  data: SystemHealthData;
}

export const healthApi = {
  getSystemHealth: async (): Promise<HealthApiResponse> => {
    return await apiClient.get('/health');
  },
};
