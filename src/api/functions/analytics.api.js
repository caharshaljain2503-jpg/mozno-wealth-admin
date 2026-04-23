import adminClient from "../axios.instance";

export const analyticsApi = {
  // Track a page visit (public)
  trackVisit: (data) => adminClient.post("/analytics/track", data),

  // Update session duration (public)
  updateDuration: (data) => adminClient.patch("/analytics/duration", data),

  // Get dashboard stats (protected)
  getStats: () => adminClient.get("/analytics/stats").then((res) => res.data),

  // Get recent visits (protected)
  getRecentVisits: (limit = 10) =>
    adminClient.get("/analytics/recent", { params: { limit } }).then((res) => res.data),

  // Get daily visits (protected)
  getDailyVisits: (days = 7) =>
    adminClient.get("/analytics/daily", { params: { days } }).then((res) => res.data),
};
