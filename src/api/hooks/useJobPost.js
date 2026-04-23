import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminClient from '../axios.instance';
import { toast } from 'sonner';

// Query Keys
export const jobKeys = {
  all: ['jobs'],
  lists: () => [...jobKeys.all, 'list'],
  list: (filters) => [...jobKeys.lists(), { filters }],
  details: () => [...jobKeys.all, 'detail'],
  detail: (id) => [...jobKeys.details(), id],
  stats: () => [...jobKeys.all, 'stats'],
};

// ============ GET ALL JOBS ============
export const useJobs = (filters = {}) => {
  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value);
        }
      });
      
      const queryString = params.toString();
      const url = `/jobs${queryString ? `?${queryString}` : ''}`;
      
      const response = await adminClient.get(url);
      return response.data;
    },
    keepPreviousData: true,
  });
};

// ============ GET SINGLE JOB ============
export const useJob = (id) => {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: async () => {
      const response = await adminClient.get(`/jobs/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// ============ GET JOB STATS ============
export const useJobStats = () => {
  return useQuery({
    queryKey: jobKeys.stats(),
    queryFn: async () => {
      const response = await adminClient.get('/jobs/stats');
      return response.data;
    },
  });
};

// ============ CREATE JOB ============
export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobData) => {
      const response = await adminClient.post('/jobs', jobData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats() });
      toast.success(data.message || 'Job created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create job');
    },
  });
};

// ============ UPDATE JOB ============
export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await adminClient.put(`/jobs/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats() });
      toast.success(data.message || 'Job updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update job');
    },
  });
};

// ============ DELETE JOB ============
export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await adminClient.delete(`/jobs/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats() });
      toast.success(data.message || 'Job deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete job');
    },
  });
};

// ============ CHANGE JOB STATUS ============
export const useChangeJobStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await adminClient.patch(`/jobs/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats() });
      toast.success(data.message || 'Job status updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update job status');
    },
  });
};