import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminClient from "../axios.instance";

export const partnerLogoKeys = {
  all: ["partner-logos"],
  list: () => [...partnerLogoKeys.all, "list"],
};

export const useAdminPartnerLogos = (options = {}) => {
  return useQuery({
    queryKey: partnerLogoKeys.list(),
    queryFn: async () => {
      const res = await adminClient.get("/partner-logos");
      return res.data;
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useCreatePartnerLogo = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const res = await adminClient.post("/partner-logos", formData);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: partnerLogoKeys.list() });
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });
};

export const useUpdatePartnerLogo = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const res = await adminClient.put(`/partner-logos/${id}`, formData);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: partnerLogoKeys.list() });
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });
};

export const useDeletePartnerLogo = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await adminClient.delete(`/partner-logos/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: partnerLogoKeys.list() });
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });
};

export const useReorderPartnerLogos = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds) => {
      const res = await adminClient.patch("/partner-logos/reorder", { orderedIds });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: partnerLogoKeys.list() });
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });
};
