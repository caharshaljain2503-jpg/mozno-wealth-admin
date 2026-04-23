// hooks/useAnalytics.js
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../functions/analytics.api';

// Get dashboard stats
export const useAnalyticsStats = () => {
  return useQuery({
    queryKey: ['analytics', 'stats'],
    queryFn: () => analyticsApi.getStats(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000 // Refresh every minute
  });
};

// Get recent visits
export const useRecentVisits = (limit = 10) => {
  return useQuery({
    queryKey: ['analytics', 'recent', limit],
    queryFn: () => analyticsApi.getRecentVisits(limit),
    staleTime: 10 * 1000
  });
};

// Get daily visits
export const useDailyVisits = (days = 7) => {
  return useQuery({
    queryKey: ['analytics', 'daily', days],
    queryFn: () => analyticsApi.getDailyVisits(days),
    staleTime: 60 * 1000
  });
};

// Combined hook for dashboard
export const useAnalyticsDashboard = () => {
  const stats = useAnalyticsStats();
  const recent = useRecentVisits(10);
  const daily = useDailyVisits(7);

  return {
    stats: stats.data?.data,
    recentVisits: recent.data?.data || [],
    dailyVisits: daily.data?.data || [],
    isLoading: stats.isLoading || recent.isLoading,
    isError: stats.isError || recent.isError,
    refetch: () => {
      stats.refetch();
      recent.refetch();
      daily.refetch();
    }
  };
};