// api/hooks/useDashboard.js
import { useQuery } from "@tanstack/react-query";
import adminClient from "../axios.instance";

export const dashboardKeys = {
  all: ["dashboard"],
  stats: (timeRange) => [...dashboardKeys.all, "stats", timeRange],
  quickStats: () => [...dashboardKeys.all, "quickStats"],
  analytics: (days) => [...dashboardKeys.all, "analytics", days],
};

export const useDashboardStats = (timeRange = "month", options = {}) => {
  return useQuery({
    queryKey: dashboardKeys.stats(timeRange),
    queryFn: async () => {
      const res = await adminClient.get(`/dashboard?timeRange=${timeRange}`);
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to fetch dashboard data");
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useQuickStats = (options = {}) => {
  return useQuery({
    queryKey: dashboardKeys.quickStats(),
    queryFn: async () => {
      const res = await adminClient.get("/dashboard/quick-stats");
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to fetch quick stats");
      }
      return res.data;
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    retry: 2,
    ...options,
  });
};

export const useAnalyticsDashboard = (days = 7, options = {}) => {
  return useQuery({
    queryKey: dashboardKeys.analytics(days),
    queryFn: async () => {
      const res = await adminClient.get(`/dashboard/analytics?days=${days}`);
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to fetch analytics");
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    ...options,
  });
};