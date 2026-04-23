import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminClient from "../axios.instance";

// Query Keys
export const notificationKeys = {
  all: ["notifications"],
  lists: () => [...notificationKeys.all, "list"],
  list: (filters) => [...notificationKeys.lists(), { filters }],
  details: () => [...notificationKeys.all, "detail"],
  detail: (id) => [...notificationKeys.details(), id],
  stats: () => [...notificationKeys.all, "stats"],
};

// ============= GET HOOKS =============

// Get all notifications with filters
export const useNotifications = (filters = {}, options = {}) => {
  const { page = 1, limit = 20, read, type, category } = filters;

  return useQuery({
    queryKey: notificationKeys.list({ page, limit, read, type, category }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);
      if (read !== undefined) params.append("read", read);
      if (type) params.append("type", type);
      if (category) params.append("category", category);

      const res = await adminClient.get(`/notifications?${params.toString()}`);
      return res.data;
    },
    ...options,
  });
};

// Get notification by ID
export const useNotificationById = (id, options = {}) => {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: async () => {
      const res = await adminClient.get(`/notifications/${id}`);
      return res.data.notification;
    },
    enabled: !!id,
    ...options,
  });
};

// Get notification stats
export const useNotificationStats = (options = {}) => {
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: async () => {
      const res = await adminClient.get("/notifications/stats");
      return res.data.stats;
    },
    ...options,
  });
};

// ============= CREATE HOOKS =============

// Create single notification
export const useCreateNotification = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationData) => {
      const res = await adminClient.post("/notifications", notificationData);
      return res.data.notification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
    },
    ...options,
  });
};

// Create bulk notifications
export const useCreateBulkNotifications = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notifications) => {
      const res = await adminClient.post("/notifications/bulk", { notifications });
      return res.data.notifications;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
    },
    ...options,
  });
};

// ============= UPDATE HOOKS =============

// Mark single notification as read
export const useMarkAsRead = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await adminClient.patch(`/notifications/${id}/read`);
      return res.data.notification;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
    },
    ...options,
  });
};

// Mark all notifications as read
export const useMarkAllAsRead = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await adminClient.patch("/notifications/read-all");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
    },
    ...options,
  });
};

// ============= DELETE HOOKS =============

// Delete single notification
export const useDeleteNotification = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await adminClient.delete(`/notifications/${id}`);
      return res.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
    },
    ...options,
  });
};

// Clear all notifications
export const useClearAllNotifications = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await adminClient.delete("/notifications");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
    },
    ...options,
  });
};

// ============= SYSTEM NOTIFICATION HELPERS =============

// Helper to create system notifications
export const createSystemNotification = async (notification) => {
  const defaultNotification = {
    type: "info",
    category: "system",
    isGlobal: true,
    ...notification,
  };
  
  const res = await adminClient.post("/notifications", defaultNotification);
  return res.data.notification;
};

// Helper to create error notification
export const createErrorNotification = async (title, message, action = null) => {
  return createSystemNotification({
    title,
    message,
    type: "error",
    category: "system",
    action,
  });
};

// Helper to create success notification
export const createSuccessNotification = async (title, message, action = null) => {
  return createSystemNotification({
    title,
    message,
    type: "success",
    category: "system",
    action,
  });
};

// Helper to create warning notification
export const createWarningNotification = async (title, message, action = null) => {
  return createSystemNotification({
    title,
    message,
    type: "warning",
    category: "system",
    action,
  });
};

// Helper to create info notification
export const createInfoNotification = async (title, message, action = null) => {
  return createSystemNotification({
    title,
    message,
    type: "info",
    category: "system",
    action,
  });
};