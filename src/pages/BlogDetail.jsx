import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Tag,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  ExternalLink,
  Loader2,
  AlertCircle,
  ChevronRight,
  BarChart3,
  Copy,
  Check,
  Globe,
  FileText,
  Settings,
} from 'lucide-react';
import {
  useAdminBlogById,
  useAdminBlogBySlug,
  useDeleteBlog,
  useToggleBlogVisibility,
} from '../api/hooks/useBlogs';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isObjectId = (val) => /^[0-9a-fA-F]{24}$/.test(val);
  const isIdObjectId = isObjectId(id);

  const { 
    data: blog, 
    isLoading, 
    error: fetchError,
    refetch
  } = isIdObjectId 
    ? useAdminBlogById(id, { enabled: !!id })
    : useAdminBlogBySlug(id, { enabled: !!id });

  const deleteBlog = useDeleteBlog({
    onSuccess: () => navigate('/blogs'),
    onError: (error) => {
      console.error('Failed to delete blog:', error);
      alert(error?.message || 'Failed to delete blog. Please try again.');
      setShowDeleteModal(false);
    }
  });

  const toggleVisibility = useToggleBlogVisibility({
    onError: (error) => {
      console.error('Failed to toggle status:', error);
      alert('Failed to update publish status');
    }
  });

  const handleDelete = () => {
    if (!blog?._id) return;
    deleteBlog.mutate(blog._id);
  };

  const handleTogglePublish = () => {
    if (!blog?._id) return;
    toggleVisibility.mutate(blog._id);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/blog/${blog?.slug || blog?._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculateReadTime = (content) => {
    if (!content) return '1 min';
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAuthorName = () => {
    if (blog?.author?.name) return blog.author.name;
    if (blog?.author?.username) return blog.author.username;
    if (blog?.author?.email) return blog.author.email.split('@')[0];
    return 'Admin';
  };

  const getStatusBadge = (isPublished) => {
    if (isPublished) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Draft
      </span>
    );
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-slate-600 font-medium">Loading blog...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (fetchError || !blog) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Blog not found</h3>
          <p className="text-slate-500 mb-6">
            {fetchError?.message || "The blog post you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate('/blogs')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  const isDeleting = deleteBlog.isPending;
  const isToggling = toggleVisibility.isPending;

  return (
    <div className="space-y-6 pb-8">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Blog Post</h3>
            <p className="text-slate-500 mb-6">
              Are you sure you want to delete "<span className="font-medium text-slate-700">{blog.title}</span>"? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate('/blogs')}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-sm">
                <Link to="/blogs" className="text-slate-500 hover:text-violet-600">Blogs</Link>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <span className="text-slate-800 font-medium truncate max-w-[200px]">{blog.title}</span>
              </div>

              <div className="sm:hidden">
                {getStatusBadge(blog.isPublished)}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePublish}
                disabled={isToggling}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                  blog.isPublished
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                } disabled:opacity-50`}
              >
                {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : blog.isPublished ? 'Unpublish' : 'Publish'}
              </button>

              <div className="hidden sm:block">
                {getStatusBadge(blog.isPublished)}
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <button
                onClick={handleCopyLink}
                className="p-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
                title="Copy link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <a
                href={`/blog/${blog.slug || blog._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <Link
                to={`/blogs/edit/${blog._id}`}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Blog Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {blog.image && (
              <div className="aspect-video w-full bg-slate-100">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/1200x600/8B5CF6/FFFFFF?text=Image+Not+Found';
                  }}
                />
              </div>
            )}

            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg">
                  {blog.category || 'Uncategorized'}
                </span>
                {getStatusBadge(blog.isPublished)}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-3 leading-tight">
                {blog.title}
              </h1>

              {blog.subTitle && (
                <p className="text-base sm:text-lg text-slate-500 mb-4 leading-relaxed">
                  {blog.subTitle}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(blog.createdAt)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {calculateReadTime(blog.description)}
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {getAuthorName()}
                </div>
              </div>
            </div>
          </div>

          {/* Content Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Content
            </h2>
            <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-violet-600">
              {blog.description ? (
                <div dangerouslySetInnerHTML={{ __html: blog.description }} />
              ) : (
                <p className="text-slate-400 italic">No content available.</p>
              )}
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleTogglePublish}
                disabled={isToggling}
                className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  blog.isPublished
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                } disabled:opacity-50`}
              >
                {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : blog.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <Link
                to={`/blogs/edit/${blog._id}`}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-violet-500/25"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-semibold text-slate-800">Statistics</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Status</span>
                <span className={`text-sm font-medium ${blog.isPublished ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {blog.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Category</span>
                <span className="text-sm font-medium text-slate-700">{blog.category || 'Uncategorized'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-500">Read Time</span>
                <span className="text-sm font-medium text-slate-700">{calculateReadTime(blog.description)}</span>
              </div>
            </div>
          </div>

          {/* SEO Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-semibold text-slate-800">SEO Preview</h3>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs text-emerald-600 truncate mb-1 font-medium">
                {window.location.origin}/blog/{blog.slug || blog._id}
              </p>
              <p className="text-base text-blue-700 font-semibold truncate mb-1">
                {blog.title}
              </p>
              <p className="text-sm text-slate-500 line-clamp-2">
                {blog.subTitle || blog.description?.replace(/<[^>]*>/g, '').slice(0, 160) || 'No description'}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-semibold text-slate-800">Details</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">ID</span>
                <span className="text-xs font-mono text-slate-400 truncate max-w-[120px]">{blog._id}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Slug</span>
                <span className="text-sm text-slate-600 truncate max-w-[120px]">{blog.slug || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Author</span>
                <span className="text-sm text-slate-600 truncate max-w-[120px]">{getAuthorName()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Created</span>
                <span className="text-sm text-slate-600">{formatDate(blog.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-500">Updated</span>
                <span className="text-sm text-slate-600">{formatDate(blog.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-semibold text-slate-800">Actions</h3>
            </div>
            <div className="space-y-1">
              <button
                onClick={handleTogglePublish}
                disabled={isToggling}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors group disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  {isToggling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : blog.isPublished ? (
                    <>
                      <Eye className="w-4 h-4" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      Publish
                    </>
                  )}
                </span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <Link
                to={`/blogs/edit/${blog._id}`}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Post
                </span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <a
                href={`/blog/${blog.slug || blog._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View Live
                </span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors group"
              >
                <span className="flex items-center gap-2">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Post
                </span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;