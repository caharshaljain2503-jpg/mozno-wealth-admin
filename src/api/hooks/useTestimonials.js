// api/hooks/useTestimonials.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminClient from "../axios.instance";

// Query Keys
export const testimonialKeys = {
  all: ["testimonials"],
  lists: () => [...testimonialKeys.all, "list"],
  list: (filters) => [...testimonialKeys.lists(), { filters }],
  details: () => [...testimonialKeys.all, "detail"],
  detail: (id) => [...testimonialKeys.details(), id],
  stats: () => [...testimonialKeys.all, "stats"],
  public: () => [...testimonialKeys.all, "public"],
};

// ============= GET HOOKS =============

// Get all testimonials (admin)
export const useAllTestimonials = (filters = {}, options = {}) => {
  const queryString = new URLSearchParams(
    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== "")
  ).toString();

  return useQuery({
    queryKey: testimonialKeys.list(filters),
    queryFn: async () => {
      const res = await adminClient.get(`/testimonials?${queryString}`);
      return res.data;
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Get testimonial by ID
export const useTestimonialById = (id, options = {}) => {
  return useQuery({
    queryKey: testimonialKeys.detail(id),
    queryFn: async () => {
      const res = await adminClient.get(`/testimonials/${id}`);
      return res.data.testimonial;
    },
    enabled: !!id,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Get published testimonials (public)
export const usePublishedTestimonials = (options = {}) => {
  return useQuery({
    queryKey: testimonialKeys.public(),
    queryFn: async () => {
      const res = await adminClient.get("/testimonials/public");
      return res.data.testimonials;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// ============= MUTATION HOOKS =============

// Create testimonial
export const useCreateTestimonial = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await adminClient.post("/testimonials", data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.lists() });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};

// Update testimonial
export const useUpdateTestimonial = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await adminClient.put(`/testimonials/${id}`, data);
      return res.data;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: testimonialKeys.lists() });
      await queryClient.cancelQueries({ queryKey: testimonialKeys.detail(id) });

      const previousList = queryClient.getQueryData(testimonialKeys.lists());
      const previousDetail = queryClient.getQueryData(testimonialKeys.detail(id));

      // Optimistic update for list
      queryClient.setQueryData(testimonialKeys.lists(), (old) => {
        if (!old?.testimonials) return old;
        return {
          ...old,
          testimonials: old.testimonials.map((t) =>
            t._id === id ? { ...t, ...data } : t
          ),
        };
      });

      // Optimistic update for detail
      queryClient.setQueryData(testimonialKeys.detail(id), (old) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      return { previousList, previousDetail, id };
    },
    onError: (err, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(testimonialKeys.lists(), context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          testimonialKeys.detail(context.id),
          context.previousDetail
        );
      }
      options.onError?.(err);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: testimonialKeys.detail(variables.id),
      });
      options.onSuccess?.(data);
    },
  });
};

// Delete testimonial
export const useDeleteTestimonial = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await adminClient.delete(`/testimonials/${id}`);
      return res.data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: testimonialKeys.lists() });

      const previousList = queryClient.getQueryData(testimonialKeys.lists());

      // Optimistic removal
      queryClient.setQueryData(testimonialKeys.lists(), (old) => {
        if (!old?.testimonials) return old;
        return {
          ...old,
          testimonials: old.testimonials.filter((t) => t._id !== id),
          stats: {
            ...old.stats,
            total: old.stats.total - 1,
          },
        };
      });

      return { previousList };
    },
    onError: (err, id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(testimonialKeys.lists(), context.previousList);
      }
      options.onError?.(err);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.lists() });
      options.onSuccess?.(data);
    },
  });
};

// Toggle status
export const useToggleTestimonialStatus = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await adminClient.patch(`/testimonials/${id}/toggle-status`);
      return res.data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: testimonialKeys.lists() });

      const previousList = queryClient.getQueryData(testimonialKeys.lists());

      queryClient.setQueryData(testimonialKeys.lists(), (old) => {
        if (!old?.testimonials) return old;
        return {
          ...old,
          testimonials: old.testimonials.map((t) =>
            t._id === id
              ? { ...t, status: t.status === "published" ? "draft" : "published" }
              : t
          ),
        };
      });

      return { previousList };
    },
    onError: (err, id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(testimonialKeys.lists(), context.previousList);
      }
      options.onError?.(err);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.lists() });
      options.onSuccess?.(data);
    },
  });
};

// Toggle featured
export const useToggleTestimonialFeatured = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await adminClient.patch(`/testimonials/${id}/toggle-featured`);
      return res.data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: testimonialKeys.lists() });

      const previousList = queryClient.getQueryData(testimonialKeys.lists());

      queryClient.setQueryData(testimonialKeys.lists(), (old) => {
        if (!old?.testimonials) return old;
        return {
          ...old,
          testimonials: old.testimonials.map((t) =>
            t._id === id ? { ...t, featured: !t.featured } : t
          ),
        };
      });

      return { previousList };
    },
    onError: (err, id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(testimonialKeys.lists(), context.previousList);
      }
      options.onError?.(err);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.lists() });
      options.onSuccess?.(data);
    },
  });
};

// Toggle approval
export const useToggleTestimonialApproval = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await adminClient.patch(`/testimonials/${id}/toggle-approval`);
      return res.data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: testimonialKeys.lists() });

      const previousList = queryClient.getQueryData(testimonialKeys.lists());

      queryClient.setQueryData(testimonialKeys.lists(), (old) => {
        if (!old?.testimonials) return old;
        return {
          ...old,
          testimonials: old.testimonials.map((t) =>
            t._id === id ? { ...t, approved: !t.approved } : t
          ),
        };
      });

      return { previousList };
    },
    onError: (err, id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(testimonialKeys.lists(), context.previousList);
      }
      options.onError?.(err);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.lists() });
      options.onSuccess?.(data);
    },
  });
};

// Bulk update status
export const useBulkUpdateStatus = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, status }) => {
      const res = await adminClient.post("/testimonials/bulk/status", {
        ids,
        status,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.lists() });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};

// Bulk delete
export const useBulkDelete = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids) => {
      const res = await adminClient.post("/testimonials/bulk/delete", { ids });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.lists() });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};