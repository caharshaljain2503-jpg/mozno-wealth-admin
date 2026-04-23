import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  Calendar,
  User,
  RefreshCw,
  FileText,
  Filter,
  MoreVertical,
  Tag,
  Clock,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { useAdminBlogs, useDeleteBlog } from "../api/hooks/useBlogs";

const BlogList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const { data: blogs = [], isLoading, error, refetch } = useAdminBlogs();

  const deleteBlog = useDeleteBlog({
    onSuccess: () => {
      console.log("Blog deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete blog:", error);
    },
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusConfig = (isPublished) => {
    if (isPublished) {
      return {
        text: "Published",
        bg: "bg-emerald-50",
        text_color: "text-emerald-700",
        ring: "ring-1 ring-emerald-200",
        dot: "bg-emerald-500",
      };
    }
    return {
      text: "Draft",
      bg: "bg-amber-50",
      text_color: "text-amber-700",
      ring: "ring-1 ring-amber-200",
      dot: "bg-amber-500",
    };
  };

  const handleDelete = (blogId, blogTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${blogTitle}"?`)) {
      return;
    }
    deleteBlog.mutate(blogId);
    setActiveDropdown(null);
  };

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && blog.isPublished) ||
      (statusFilter === "draft" && !blog.isPublished);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: blogs.length,
    published: blogs.filter((b) => b.isPublished).length,
    drafts: blogs.filter((b) => !b.isPublished).length,
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full animate-bounce" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Loading blogs...</h3>
          <p className="text-slate-500 mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && blogs.length === 0) {
    return (
      <div className="space-y-6">
        <Header stats={stats} />
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 text-lg">Failed to load blogs</h3>
              <p className="text-red-600 mt-1">{error?.message || "Something went wrong"}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header stats={stats} />

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          gradient="from-violet-500 to-purple-600"
          shadow="shadow-violet-500/20"
        />
        <StatCard
          label="Published"
          value={stats.published}
          gradient="from-emerald-500 to-teal-600"
          shadow="shadow-emerald-500/20"
        />
        <StatCard
          label="Drafts"
          value={stats.drafts}
          gradient="from-amber-500 to-orange-600"
          shadow="shadow-amber-500/20"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search blogs by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Desktop Filters */}
          <div className="hidden sm:flex items-center gap-2">
            {["all", "published", "draft"].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                  statusFilter === filter
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter === "all" ? "All Posts" : filter}
              </button>
            ))}
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl text-slate-700 font-medium"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Mobile Filters Dropdown */}
        {showMobileFilters && (
          <div className="sm:hidden mt-4 pt-4 border-t border-slate-200 flex gap-2">
            {["all", "published", "draft"].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setStatusFilter(filter);
                  setShowMobileFilters(false);
                }}
                className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                  statusFilter === filter
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {filter === "all" ? "All" : filter}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Blog List */}
      <div className="space-y-4">
        {filteredBlogs.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Blog Post</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Category</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Author</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Date</th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBlogs.map((blog, index) => {
                    const status = getStatusConfig(blog.isPublished);
                    return (
                      <tr
                        key={blog._id}
                        className="hover:bg-slate-50/50 transition-colors group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                              <FileText className="w-5 h-5 text-violet-600" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-slate-800 truncate max-w-[250px]">
                                {blog.title}
                              </h4>
                              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[250px]">
                                /{blog.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                            <Tag className="w-3 h-3" />
                            {blog.category || "Uncategorized"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${status.bg} ${status.text_color} ${status.ring}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.text}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {(blog.author?.name || "A").charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-slate-600 text-sm">
                              {blog.author?.name || "Admin"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(blog.createdAt)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/blogs/${blog._id}`}
                              className="p-2 rounded-lg hover:bg-violet-100 text-slate-400 hover:text-violet-600 transition-all"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/blogs/edit/${blog._id}`}
                              className="p-2 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition-all"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(blog._id, blog.title)}
                              disabled={deleteBlog.isPending}
                              className="p-2 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-all disabled:opacity-50"
                              title="Delete"
                            >
                              {deleteBlog.isPending && deleteBlog.variables === blog._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-3">
              {filteredBlogs.map((blog, index) => {
                const status = getStatusConfig(blog.isPublished);
                return (
                  <div
                    key={blog._id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-slate-800 line-clamp-2">
                            {blog.title}
                          </h4>
                          <div className="relative">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown === blog._id ? null : blog._id)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>
                            
                            {activeDropdown === blog._id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setActiveDropdown(null)}
                                />
                                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20">
                                  <Link
                                    to={`/blogs/${blog._id}`}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Preview
                                  </Link>
                                  <Link
                                    to={`/blogs/edit/${blog._id}`}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(blog._id, blog.title)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${status.bg} ${status.text_color} ${status.ring}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.text}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs">
                            <Tag className="w-3 h-3" />
                            {blog.category || "Uncategorized"}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-[10px] font-medium">
                                {(blog.author?.name || "A").charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {blog.author?.name || "Admin"}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {formatDate(blog.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState searchQuery={searchQuery} onClear={() => setSearchQuery("")} />
        )}
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-700">{filteredBlogs.length}</span> of{" "}
          <span className="font-medium text-slate-700">{blogs.length}</span> posts
          {searchQuery && (
            <span>
              {" "}matching "<span className="font-medium text-violet-600">{searchQuery}</span>"
            </span>
          )}
        </p>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </div>
  );
};

// Header Component
const Header = ({ stats }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
        Blog Posts
      </h1>
      <p className="text-slate-500 mt-1">
        Manage and organize your blog content
      </p>
    </div>
    <Link
      to="/blogs/edit/new"
      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98]"
    >
      <Plus className="w-5 h-5" />
      <span>New Post</span>
    </Link>
  </div>
);

// Stat Card Component
const StatCard = ({ label, value, gradient, shadow }) => (
  <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-2xl p-4 sm:p-5 text-white ${shadow} shadow-lg`}>
    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
    <div className="relative">
      <p className="text-white/80 text-xs sm:text-sm font-medium">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold mt-1">{value}</p>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ searchQuery, onClear }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12">
    <div className="text-center max-w-md mx-auto">
      <div className="relative inline-block">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto">
          <FileText className="w-10 h-10 text-violet-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 mt-6">
        {searchQuery ? "No blogs found" : "No blogs yet"}
      </h3>
      <p className="text-slate-500 mt-2">
        {searchQuery
          ? "Try adjusting your search terms"
          : "Create your first blog post to get started"}
      </p>
      
      <div className="mt-6">
        {searchQuery ? (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear Search
          </button>
        ) : (
          <Link
            to="/blogs/edit/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25"
          >
            <Plus className="w-5 h-5" />
            Create First Post
          </Link>
        )}
      </div>
    </div>
  </div>
);

export default BlogList;