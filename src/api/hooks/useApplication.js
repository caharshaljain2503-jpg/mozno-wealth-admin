import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminClient from "../axios.instance";
import { toast } from "sonner";

// Query Keys
export const applicationKeys = {
  all: ["applications"],
  lists: () => [...applicationKeys.all, "list"],
  list: (filters) => [...applicationKeys.lists(), { filters }],
  details: () => [...applicationKeys.all, "detail"],
  detail: (id) => [...applicationKeys.details(), id],
  stats: () => [...applicationKeys.all, "stats"],
};

// ============ GET ALL APPLICATIONS ============
export const useApplications = (filters = {}) => {
  return useQuery({
    queryKey: applicationKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          params.append(key, value);
        }
      });

      const queryString = params.toString();
      const url = `/applications${queryString ? `?${queryString}` : ""}`;

      const response = await adminClient.get(url);
      return response.data;
    },
    keepPreviousData: true,
  });
};

// ============ GET SINGLE APPLICATION ============
export const useApplication = (id) => {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: async () => {
      const response = await adminClient.get(`/applications/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// ============ GET APPLICATION STATS ============
export const useApplicationStats = () => {
  return useQuery({
    queryKey: applicationKeys.stats(),
    queryFn: async () => {
      const response = await adminClient.get("/applications/stats/overview");
      return response.data;
    },
  });
};

// ============ CHANGE APPLICATION STATUS ============
export const useChangeApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await adminClient.patch(`/applications/${id}/status`, {
        status,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: applicationKeys.stats() });
      toast.success(data.message || "Application status updated successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update application status",
      );
    },
  });
};

// ============ ADD INTERNAL NOTE ============
export const useAddInternalNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, note }) => {
      const response = await adminClient.post(`/applications/${id}/notes`, {
        note,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.detail(variables.id),
      });
      toast.success(data.message || "Internal note added successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to add internal note",
      );
    },
  });
};

// ============ DELETE APPLICATION ============
export const useDeleteApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await adminClient.delete(`/applications/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.stats() });
      toast.success(data.message || "Application deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete application",
      );
    },
  });
};

// ============ BULK DELETE APPLICATIONS ============
export const useBulkDeleteApplications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids) => {
      const response = await adminClient.delete("/applications/bulk/delete", {
        data: { ids },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.stats() });
      toast.success(data.message || "Applications deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete applications",
      );
    },
  });
};

// ============ EXPORT APPLICATIONS CSV ============
export const useExportApplicationsCSV = () => {
  return useMutation({
    mutationFn: async (filters = {}) => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          params.append(key, value);
        }
      });

      const queryString = params.toString();
      const url = `/applications/export/csv${queryString ? `?${queryString}` : ""}`;

      const response = await adminClient.get(url, {
        responseType: "blob",
      });

      return response.data;
    },
    onSuccess: (data, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;

      // Generate filename with date
      const date = new Date().toISOString().split("T")[0];
      link.setAttribute("download", `applications-${date}.csv`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Applications exported successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to export applications",
      );
    },
  });
};

// ============ DOWNLOAD RESUME ============
export const useDownloadResume = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await adminClient.get(`/applications/${id}/resume`, {
        responseType: "blob",
      });
      return response.data;
    },
    onSuccess: (data, id) => {
      // Open resume in new tab
      const url = window.URL.createObjectURL(new Blob([data]));
      window.open(url, "_blank");
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to download resume");
    },
  });
};
