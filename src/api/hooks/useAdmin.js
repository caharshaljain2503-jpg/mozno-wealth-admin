import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminClient from "../axios.instance";
import { login, adminApi } from "../functions/admin.api";
import { toast } from "sonner";

// ==================== AUTH HOOKS ====================

export const useAdminLogin = (options = {}) => {
  return useMutation({
    mutationFn: (payload) => login(payload),
    onError: (error) => {
      console.error("Login failed:", error);
      toast.error(error.response?.data?.message || error.message || "Login failed");
    },
    ...options,
  });
};

export const useSendOtp = (options = {}) => {
  return useMutation({
    mutationFn: async (payload) => {
      console.log("OTP Req", payload);
      const res = await adminClient.post("/send-otp", payload);
      return res.data;
    },
    onError: (error) => {
      console.error("Send OTP failed:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    },
    ...options,
  });
};

export const useVerifyOtp = (options = {}) => {
  return useMutation({
    mutationFn: async (payload) => {
      const res = await adminClient.post("/verify-otp", payload);
      return res.data;
    },
    onError: (error) => {
      console.error("Verify OTP failed:", error);
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    },
    ...options,
  });
};

export const useAdminProfile = (options = {}) => {
  return useQuery({
    queryKey: ["admin", "profile"],
    queryFn: async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await adminClient.get("/profile");

      if (res.data.success) {
        return res.data.data;
      } else {
        throw new Error(res.data.message || "Failed to fetch profile");
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// ==================== QUERY KEYS ====================

export const adminKeys = {
  all: ["admins"],
  list: (filters) => [...adminKeys.all, "list", filters],
  detail: (id) => [...adminKeys.all, "detail", id],
  stats: () => [...adminKeys.all, "stats"],
};

// ==================== ADMIN CRUD HOOKS ====================

// Get all admins
export const useAdmins = (params = {}) => {
  return useQuery({
    queryKey: adminKeys.list(params),
    queryFn: () => adminApi.getAll(params),
    staleTime: 30 * 1000,
  });
};

// Get single admin
export const useAdmin = (id) => {
  return useQuery({
    queryKey: adminKeys.detail(id),
    queryFn: () => adminApi.getById(id),
    enabled: !!id,
  });
};

// Get admin stats
export const useAdminStats = () => {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => adminApi.getStats(),
    staleTime: 60 * 1000,
  });
};

// Create admin
export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      console.log("Creating admin:", data);
      return adminApi.create(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      toast.success(data.message || "Admin created successfully");
    },
    onError: (error) => {
      console.error("Create admin error:", error);
      const message =
        error.response?.data?.message || error.message || "Failed to create admin";
      toast.error(message);
    },
  });
};

// Update admin
export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => adminApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      toast.success(data.message || "Admin updated successfully");
    },
    onError: (error) => {
      console.error("Update admin error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to update admin"
      );
    },
  });
};

// Delete admin
export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => adminApi.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      toast.success(data.message || "Admin deleted successfully");
    },
    onError: (error) => {
      console.error("Delete admin error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to delete admin"
      );
    },
  });
};

// Toggle status
export const useToggleAdminStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => adminApi.toggleStatus(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.all });

      const previousData = queryClient.getQueriesData({
        queryKey: adminKeys.all,
      });

      // Optimistic update
      queryClient.setQueriesData({ queryKey: adminKeys.all }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((admin) =>
            admin._id === id || admin.id === id
              ? {
                  ...admin,
                  status: admin.status === "active" ? "inactive" : "active",
                }
              : admin
          ),
        };
      });

      return { previousData };
    },
    onError: (error, id, context) => {
      // Rollback on error
      context?.previousData?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      console.error("Toggle status error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to update status"
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Status updated");
    },
  });
};

// Reset password
export const useResetAdminPassword = () => {
  return useMutation({
    mutationFn: (id) => adminApi.resetPassword(id),
    onSuccess: (data) => {
      toast.success(data.message || "Password reset email sent");
    },
    onError: (error) => {
      console.error("Reset password error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to reset password"
      );
    },
  });
};

// ==================== COMBINED ACTIONS HOOK ====================

export const useAdminActions = () => {
  const createAdmin = useCreateAdmin();
  const updateAdmin = useUpdateAdmin();
  const deleteAdmin = useDeleteAdmin();
  const toggleStatus = useToggleAdminStatus();
  const resetPassword = useResetAdminPassword();

  return {
    createAdmin: createAdmin.mutateAsync,
    updateAdmin: updateAdmin.mutateAsync,
    deleteAdmin: deleteAdmin.mutateAsync,
    toggleStatus: toggleStatus.mutate,
    resetPassword: resetPassword.mutateAsync,
    isLoading:
      createAdmin.isPending ||
      updateAdmin.isPending ||
      deleteAdmin.isPending ||
      toggleStatus.isPending ||
      resetPassword.isPending,
  };
};