import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminClient from "../axios.instance";

// Query Keys
export const blogKeys = {
  all: ["blogs"],
  lists: () => [...blogKeys.all, "list"],
  list: (filters) => [...blogKeys.lists(), { filters }],
  details: () => [...blogKeys.all, "detail"],
  detail: (id) => [...blogKeys.details(), id],
  slug: (slug) => [...blogKeys.all, "slug", slug],
  comments: () => [...blogKeys.all, "comments"],
  comment: (id) => [...blogKeys.comments(), id],
};

// ============= GET HOOKS =============

// Get all blogs for admin
export const useAdminBlogs = (options = {}) => {
  return useQuery({
    queryKey: blogKeys.lists(),
    queryFn: async () => {
      const res = await adminClient.get("/blogs");
      return res.data.blogs;
    },
    ...options,
  });
};

// Get blog by ID for admin
export const useAdminBlogById = (id, options = {}) => {
  return useQuery({
    queryKey: blogKeys.detail(id),
    queryFn: async () => {
      const res = await adminClient.get(`/blogs/${id}`);
      return res.data.blog;
    },
    enabled: !!id,
    ...options,
  });
};

// Get blog by slug for admin
export const useAdminBlogBySlug = (slug, options = {}) => {
  return useQuery({
    queryKey: blogKeys.slug(slug),
    queryFn: async () => {
      const res = await adminClient.get(`/blogs/slug/${slug}`);
      return res.data.blog;
    },
    enabled: !!slug,
    ...options,
  });
};

// Get all comments
export const useAllComments = (options = {}) => {
  return useQuery({
    queryKey: blogKeys.comments(),
    queryFn: async () => {
      const res = await adminClient.get("/comments");
      return res.data.comments;
    },
    ...options,
  });
};

// ============= MUTATION HOOKS =============

// Add new blog
export const useAddBlog = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const res = await adminClient.post("/blogs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.blog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
    ...options,
  });
};

// Edit blog
export const useEditBlog = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ blogId, formData }) => {
      const res = await adminClient.patch(`/edit/${blogId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.blog;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: blogKeys.detail(variables.blogId),
      });
    },
    ...options,
  });
};

// Toggle blog visibility (publish/draft)
export const useToggleBlogVisibility = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blogId) => {
      const res = await adminClient.patch(`/toggle-visibility/${blogId}`);
      return res.data.blog;
    },
    onSuccess: (data, blogId) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: blogKeys.detail(blogId) });
    },
    ...options,
  });
};

// Delete blog
export const useDeleteBlog = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blogId) => {
      const res = await adminClient.delete(`/delete/${blogId}`);
      return res.data.blog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
    ...options,
  });
};

// Delete comment
export const useDeleteComment = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId) => {
      const res = await adminClient.post("/delete-comment", {
        blogId: commentId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.comments() });
    },
    ...options,
  });
};

// Change comment status
export const useChangeCommentStatus = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, status }) => {
      const res = await adminClient.patch(`/comments/${commentId}/status`, {
        status,
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.comments() });
    },
    ...options,
  });
};
