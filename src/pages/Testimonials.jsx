import React, { useState, useEffect } from "react";
import {
  Star,
  Quote,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  MoreVertical,
  ThumbsUp,
  MessageCircle,
  Award,
  Loader2,
  RefreshCw,
  X,
  Sparkles,
  Users,
} from "lucide-react";
import {
  useAllTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
  useToggleTestimonialStatus,
  useToggleTestimonialFeatured,
  useToggleTestimonialApproval,
} from "../api/hooks/useTestimonials";

const Testimonials = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    designation: "",
    company: "",
    avatar: "",
    rating: 5,
    content: "",
    status: "draft",
    featured: false,
    approved: false,
  });

  // API Hooks
  const {
    data: testimonialsData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useAllTestimonials({
    status: filter === "all" ? undefined : filter,
    search: searchQuery || undefined,
  });

  const createMutation = useCreateTestimonial({
    onSuccess: () => {
      setShowAddModal(false);
      resetNewTestimonialForm();
    },
  });

  const updateMutation = useUpdateTestimonial({
    onSuccess: () => {
      setShowEditModal(false);
      setSelectedTestimonial(null);
    },
  });

  const deleteMutation = useDeleteTestimonial({
    onSuccess: () => {
      setShowDeleteModal(false);
      setSelectedTestimonial(null);
    },
  });

  const toggleStatusMutation = useToggleTestimonialStatus();
  const toggleFeaturedMutation = useToggleTestimonialFeatured();
  const toggleApprovalMutation = useToggleTestimonialApproval();

  const testimonials = testimonialsData?.testimonials || [];
  const stats = testimonialsData?.stats || {
    total: 0,
    published: 0,
    draft: 0,
    featured: 0,
    totalLikes: 0,
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-menu")) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  };

  const renderStars = (rating, interactive = false, onSelect = null) => {
    return Array(5).fill(0).map((_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => interactive && onSelect && onSelect(index + 1)}
        className={`${interactive ? "hover:scale-110 transition-transform cursor-pointer" : "cursor-default"}`}
        disabled={!interactive}
      >
        <Star
          className={`w-4 h-4 sm:w-5 sm:h-5 ${
            index < rating ? "text-amber-400 fill-amber-400" : "text-slate-300"
          }`}
        />
      </button>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleAddTestimonial = () => {
    if (!newTestimonial.name.trim() || !newTestimonial.content.trim()) {
      alert("Please fill all required fields");
      return;
    }
    createMutation.mutate(newTestimonial);
  };

  const handleUpdateTestimonial = () => {
    if (!selectedTestimonial) return;
    updateMutation.mutate({
      id: selectedTestimonial._id,
      data: selectedTestimonial,
    });
  };

  const handleDeleteTestimonial = () => {
    if (!selectedTestimonial) return;
    deleteMutation.mutate(selectedTestimonial._id);
  };

  const resetNewTestimonialForm = () => {
    setNewTestimonial({
      name: "",
      designation: "",
      company: "",
      avatar: "",
      rating: 5,
      content: "",
      status: "draft",
      featured: false,
      approved: false,
    });
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Loading Testimonials...</h3>
          <p className="text-slate-500 mt-1">Fetching reviews</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Failed to load testimonials</h3>
              <p className="text-red-600 mt-1">{error?.message || "Something went wrong"}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Testimonials</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage client reviews
            {isFetching && !isLoading && (
              <span className="ml-2 text-violet-600">
                <Loader2 className="w-3 h-3 inline animate-spin" /> Syncing...
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-600 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Testimonial</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total" value={stats.total} icon={Quote} gradient="from-violet-500 to-purple-600" />
        <StatCard label="Published" value={stats.published} icon={CheckCircle} gradient="from-emerald-500 to-teal-600" />
        <StatCard label="Featured" value={stats.featured} icon={Award} gradient="from-amber-500 to-orange-600" />
        <StatCard label="Total Likes" value={stats.totalLikes} icon={ThumbsUp} gradient="from-blue-500 to-cyan-600" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search testimonials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-sm sm:text-base placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-lg"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["all", "published", "draft"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap capitalize transition-all ${
                  filter === status
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      {testimonials.length === 0 ? (
        <EmptyState searchQuery={searchQuery} filter={filter} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial._id}
              testimonial={testimonial}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              onEdit={() => {
                setSelectedTestimonial(testimonial);
                setShowEditModal(true);
                setActiveMenu(null);
              }}
              onDelete={() => {
                setSelectedTestimonial(testimonial);
                setShowDeleteModal(true);
                setActiveMenu(null);
              }}
              onToggleFeatured={() => {
                toggleFeaturedMutation.mutate(testimonial._id);
                setActiveMenu(null);
              }}
              onToggleStatus={() => {
                toggleStatusMutation.mutate(testimonial._id);
                setActiveMenu(null);
              }}
              onToggleApproval={() => {
                toggleApprovalMutation.mutate(testimonial._id);
                setActiveMenu(null);
              }}
              isToggling={toggleStatusMutation.isPending || toggleFeaturedMutation.isPending || toggleApprovalMutation.isPending}
              getInitials={getInitials}
              renderStars={renderStars}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <TestimonialModal
          title="Add New Testimonial"
          subtitle="Add a client testimonial or review"
          testimonial={newTestimonial}
          setTestimonial={setNewTestimonial}
          onClose={() => {
            setShowAddModal(false);
            resetNewTestimonialForm();
          }}
          onSubmit={handleAddTestimonial}
          isLoading={createMutation.isPending}
          submitLabel="Add Testimonial"
          renderStars={renderStars}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTestimonial && (
        <TestimonialModal
          title="Edit Testimonial"
          subtitle="Update testimonial details"
          testimonial={selectedTestimonial}
          setTestimonial={setSelectedTestimonial}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateTestimonial}
          isLoading={updateMutation.isPending}
          submitLabel="Save Changes"
          renderStars={renderStars}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedTestimonial && (
        <DeleteModal
          name={selectedTestimonial.name}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteTestimonial}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, gradient }) => (
  <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-2xl p-4 sm:p-5 text-white shadow-lg`}>
    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white/20 rounded-xl">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div>
        <p className="text-xl sm:text-2xl font-bold">{value}</p>
        <p className="text-white/80 text-xs sm:text-sm">{label}</p>
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ searchQuery, filter }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
      <Quote className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-2">No testimonials found</h3>
    <p className="text-slate-500">
      {searchQuery || filter !== "all"
        ? "Try adjusting your search or filters"
        : "Add your first client testimonial!"}
    </p>
  </div>
);

// Testimonial Card Component
const TestimonialCard = ({
  testimonial,
  activeMenu,
  setActiveMenu,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleStatus,
  onToggleApproval,
  isToggling,
  getInitials,
  renderStars,
  formatDate,
}) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
    {/* Header */}
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 flex-shrink-0">
          {testimonial.avatar ? (
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}
          {!testimonial.avatar && (
            <span className="text-white font-semibold text-sm sm:text-base">{getInitials(testimonial.name)}</span>
          )}
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-slate-800 truncate">{testimonial.name}</h4>
          <p className="text-xs sm:text-sm text-slate-500 truncate">{testimonial.designation}</p>
          {testimonial.company && (
            <p className="text-xs text-slate-400 truncate">{testimonial.company}</p>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="relative dropdown-menu">
        <button
          onClick={() => setActiveMenu(activeMenu === testimonial._id ? null : testimonial._id)}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
        </button>

        {activeMenu === testimonial._id && (
          <div className="absolute right-0 top-10 z-20 w-44 sm:w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1">
            <MenuItem icon={Edit} label="Edit" onClick={onEdit} />
            <MenuItem
              icon={Award}
              label={testimonial.featured ? "Remove Featured" : "Mark Featured"}
              onClick={onToggleFeatured}
              disabled={isToggling}
            />
            <MenuItem
              icon={testimonial.status === "published" ? EyeOff : Eye}
              label={testimonial.status === "published" ? "Unpublish" : "Publish"}
              onClick={onToggleStatus}
              disabled={isToggling}
            />
            <MenuItem
              icon={testimonial.approved ? XCircle : CheckCircle}
              label={testimonial.approved ? "Unapprove" : "Approve"}
              onClick={onToggleApproval}
              disabled={isToggling}
            />
            <MenuItem icon={Trash2} label="Delete" onClick={onDelete} danger />
          </div>
        )}
      </div>
    </div>

    {/* Rating */}
    <div className="flex items-center gap-1 mb-3">
      {renderStars(testimonial.rating)}
    </div>

    {/* Content */}
    <div className="relative mb-4">
      <Quote className="absolute -top-1 -left-1 w-5 h-5 sm:w-6 sm:h-6 text-violet-100" />
      <p className="text-slate-600 text-sm sm:text-base italic pl-4 line-clamp-3">
        "{testimonial.content}"
      </p>
    </div>

    {/* Footer */}
    <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
          {formatDate(testimonial.createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
          {testimonial.likes}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {testimonial.featured && (
          <Badge text="Featured" color="amber" />
        )}
        <Badge
          text={testimonial.status}
          color={testimonial.status === "published" ? "emerald" : "slate"}
        />
        <Badge
          text={testimonial.approved ? "Approved" : "Pending"}
          color={testimonial.approved ? "blue" : "slate"}
        />
      </div>
    </div>
  </div>
);

// Menu Item Component
const MenuItem = ({ icon: Icon, label, onClick, disabled, danger }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm transition-colors disabled:opacity-50 ${
      danger
        ? "text-red-600 hover:bg-red-50"
        : "text-slate-700 hover:bg-slate-50"
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

// Badge Component
const Badge = ({ text, color }) => {
  const colors = {
    amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    blue: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    slate: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  };

  return (
    <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-md capitalize ${colors[color]}`}>
      {text}
    </span>
  );
};

// Testimonial Modal Component
const TestimonialModal = ({
  title,
  subtitle,
  testimonial,
  setTestimonial,
  onClose,
  onSubmit,
  isLoading,
  submitLabel,
  renderStars,
}) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Name"
            required
            value={testimonial.name}
            onChange={(e) => setTestimonial({ ...testimonial, name: e.target.value })}
            placeholder="Client name"
          />
          <InputField
            label="Designation"
            value={testimonial.designation}
            onChange={(e) => setTestimonial({ ...testimonial, designation: e.target.value })}
            placeholder="e.g., CEO"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Company"
            value={testimonial.company}
            onChange={(e) => setTestimonial({ ...testimonial, company: e.target.value })}
            placeholder="Company name"
          />
          <InputField
            label="Client Image URL"
            value={testimonial.avatar || ""}
            onChange={(e) => setTestimonial({ ...testimonial, avatar: e.target.value })}
            placeholder="https://... (optional)"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Or Upload Client Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                setTestimonial({ ...testimonial, avatar: reader.result });
              };
              reader.readAsDataURL(file);
            }}
            className="w-full text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-violet-50 file:text-violet-700 file:font-medium"
          />
          {testimonial.avatar ? (
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
              <img src={testimonial.avatar} alt="Client preview" className="w-full h-full object-cover" />
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Rating *</label>
            <div className="flex items-center gap-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {renderStars(testimonial.rating, true, (rating) =>
                setTestimonial({ ...testimonial, rating })
              )}
              <span className="ml-2 text-sm text-slate-500">{testimonial.rating}/5</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Content *</label>
          <textarea
            value={testimonial.content}
            onChange={(e) => setTestimonial({ ...testimonial, content: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all resize-none"
            placeholder="Enter testimonial content..."
          />
        </div>

        <div className="flex flex-wrap gap-4 sm:gap-6">
          <Checkbox
            label="Featured"
            checked={testimonial.featured}
            onChange={(e) => setTestimonial({ ...testimonial, featured: e.target.checked })}
          />
          <Checkbox
            label="Approved"
            checked={testimonial.approved}
            onChange={(e) => setTestimonial({ ...testimonial, approved: e.target.checked })}
          />
          <Checkbox
            label="Published"
            checked={testimonial.status === "published"}
            onChange={(e) => setTestimonial({ ...testimonial, status: e.target.checked ? "published" : "draft" })}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </div>
  </div>
);

// Input Field Component
const InputField = ({ label, required, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-sm sm:text-base"
    />
  </div>
);

// Checkbox Component
const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
    />
    <span className="text-sm text-slate-700">{label}</span>
  </label>
);

// Delete Modal Component
const DeleteModal = ({ name, onClose, onDelete, isLoading }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
      <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-7 h-7 text-red-600" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Delete Testimonial?</h3>
      <p className="text-slate-500 text-center mb-6">
        Are you sure you want to delete <span className="font-medium text-slate-700">"{name}"</span>'s testimonial?
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onDelete}
          disabled={isLoading}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-semibold hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

export default Testimonials;