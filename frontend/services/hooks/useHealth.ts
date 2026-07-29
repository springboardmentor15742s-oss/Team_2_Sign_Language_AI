import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../api/health';

export function useHealth() {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: healthApi.getSystemHealth,
    refetchInterval: 15000, // Auto-refresh status every 15 seconds
    retry: 2,
  });
}
