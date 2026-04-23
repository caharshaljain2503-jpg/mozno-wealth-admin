import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminClient from "../axios.instance";

export const faqKeys = {
  all: ["faqs"],
  list: () => [...faqKeys.all, "list"],
};

// Fetch all FAQs (admin)
export const useAllFaqs = (options = {}) => {
  return useQuery({
    queryKey: faqKeys.list(),
    queryFn: async () => {
      const res = await adminClient.get("/faqs");
      return res.data;
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useCreateFaq = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await adminClient.post("/faqs", data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: faqKeys.list() });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};

export const useUpdateFaq = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await adminClient.put(`/faqs/${id}`, data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: faqKeys.list() });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};

export const useDeleteFaq = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await adminClient.delete(`/faqs/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: faqKeys.list() });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};

export const useToggleFaqStatus = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await adminClient.patch(`/faqs/${id}/toggle-status`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: faqKeys.list() });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};

