import adminClient from "../axios.instance";


export const dashboardApi = {
  // Get full dashboard stats
  getStats: async (timeRange = "month") => {
    const response = await adminClient.get("/", { params: { timeRange } });
    return response.data;
  },

  // Get quick stats only
  getQuickStats: async () => {
    const response = await adminClient.get("/quick-stats");
    return response.data;
  },
};

export default dashboardApi;