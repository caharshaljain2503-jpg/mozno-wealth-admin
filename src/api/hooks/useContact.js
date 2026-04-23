// api/hooks/useContact.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminClient from "../axios.instance";

// Query Keys
export const leadKeys = {
  all: ["leads"],
  lists: () => [...leadKeys.all, "list"],
  list: (filters) => [...leadKeys.lists(), { filters }],
  details: () => [...leadKeys.all, "detail"],
  detail: (id) => [...leadKeys.details(), id],
};

export const useAllLeads = (options = {}) => {
  return useQuery({
    queryKey: leadKeys.lists(),
    queryFn: async () => {
      const res = await adminClient.get("/contact/");
      return res.data.contacts || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: 2,
    ...options,
  });
};

export const useLeadById = (id, options = {}) => {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: async () => {
      const res = await adminClient.get(`/contact/${id}`);
      return res.data.contact;
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
};

export const useUpdateLeadStatus = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, status }) => {
      const res = await adminClient.post("/contact/status", {
        contactId,
        status,
      });
      return res.data.contact;
    },

    // Optimistic update - immediately update UI
    onMutate: async ({ contactId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: leadKeys.lists() });
      await queryClient.cancelQueries({ queryKey: leadKeys.detail(contactId) });

      // Snapshot previous values
      const previousLeads = queryClient.getQueryData(leadKeys.lists());
      const previousLead = queryClient.getQueryData(leadKeys.detail(contactId));

      // Optimistically update the leads list
      queryClient.setQueryData(leadKeys.lists(), (old) => {
        if (!old) return old;
        return old.map((lead) =>
          lead._id === contactId ? { ...lead, status } : lead,
        );
      });

      // Optimistically update the single lead
      queryClient.setQueryData(leadKeys.detail(contactId), (old) => {
        if (!old) return old;
        return { ...old, status };
      });

      // Return context with snapshot
      return { previousLeads, previousLead, contactId };
    },

    // On error, rollback to previous values
    onError: (err, variables, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(leadKeys.lists(), context.previousLeads);
      }
      if (context?.previousLead) {
        queryClient.setQueryData(
          leadKeys.detail(context.contactId),
          context.previousLead,
        );
      }

      // Call user's onError if provided
      options.onError?.(err, variables, context);
    },

    // On success, sync with server data
    onSuccess: (data, variables, context) => {
      // Update cache with server response
      if (data) {
        queryClient.setQueryData(leadKeys.lists(), (old) => {
          if (!old) return old;
          return old.map((lead) =>
            lead._id === variables.contactId ? { ...lead, ...data } : lead,
          );
        });

        queryClient.setQueryData(
          leadKeys.detail(variables.contactId),
          (old) => {
            if (!old) return old;
            return { ...old, ...data };
          },
        );
      }

      // Call user's onSuccess if provided
      options.onSuccess?.(data, variables, context);
    },

    // Always refetch after error or success (soft reload)
    onSettled: (data, error, variables) => {
      // Invalidate to ensure fresh data on next access
      queryClient.invalidateQueries({
        queryKey: leadKeys.lists(),
        refetchType: "none", // Don't auto-refetch, just mark as stale
      });

      // Call user's onSettled if provided
      options.onSettled?.(data, error, variables);
    },
  });
};
