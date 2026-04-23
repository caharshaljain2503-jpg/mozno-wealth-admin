import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  MapPin,
  Building,
  Loader2,
  RefreshCw,
  X,
  Briefcase,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Sparkles,
} from "lucide-react";
import { 
  useJobs, 
  useDeleteJob, 
  useChangeJobStatus,
  useJobStats 
} from "../../api/hooks/useJobPost";

const JobList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState(null);

  const { 
    data: jobsData, 
    isLoading, 
    isError, 
    error,
    refetch,
    isFetching 
  } = useJobs({ 
    page, 
    limit: 10, 
    search: searchQuery,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const { data: statsData } = useJobStats();

  const deleteJob = useDeleteJob();
  const changeStatus = useChangeJobStatus();

  const jobs = jobsData?.data || [];
  const totalJobs = jobsData?.total || 0;
  const totalPages = jobsData?.pages || 1;
  const stats = statsData?.data?.totals || { open: 0, closed: 0, draft: 0 };

  const handleDeleteJob = (jobId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${jobTitle}"?`)) return;
    deleteJob.mutate(jobId);
    setActiveMenu(null);
  };

  const handleStatusChange = (jobId, currentStatus) => {
    const newStatus = currentStatus === "open" ? "closed" : "open";
    changeStatus.mutate({ id: jobId, status: newStatus });
    setActiveMenu(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Loading Jobs...</h3>
          <p className="text-slate-500 mt-1">Fetching job listings</p>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="space-y-6">
        <Header stats={stats} totalJobs={totalJobs} />
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Failed to load jobs</h3>
              <p className="text-red-600 mt-1">{error?.message || "Something went wrong"}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
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
    <div className="space-y-4 sm:space-y-6 pb-8">
      {/* Header */}
      <Header 
        stats={stats} 
        totalJobs={totalJobs} 
        isFetching={isFetching}
        onRefresh={refetch}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Jobs" value={totalJobs} icon={Briefcase} gradient="from-violet-500 to-purple-600" />
        <StatCard label="Open" value={stats.open} icon={Eye} gradient="from-emerald-500 to-teal-600" />
        <StatCard label="Closed" value={stats.closed} icon={X} gradient="from-red-500 to-rose-600" />
        <StatCard label="Draft" value={stats.draft} icon={Clock} gradient="from-amber-500 to-orange-600" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-sm sm:text-base placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-lg"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["all", "open", "closed", "draft"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap capitalize transition-all ${
                  statusFilter === status
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

      {/* Job List */}
      {jobs.length === 0 ? (
        <EmptyState searchQuery={searchQuery} statusFilter={statusFilter} onClear={() => {
          setSearchQuery("");
          setStatusFilter("all");
          setPage(1);
        }} />
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              onEdit={() => {}}
              onDelete={() => handleDeleteJob(job._id, job.jobTitle)}
              onStatusChange={() => handleStatusChange(job._id, job.jobStatus)}
              isDeleting={deleteJob.isPending && deleteJob.variables === job._id}
              isChangingStatus={changeStatus.isPending && changeStatus.variables?.id === job._id}
              formatDate={formatDate}
              getTimeAgo={getTimeAgo}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalJobs={totalJobs}
          onPageChange={setPage}
        />
      )}

      {/* Results Info */}
      <div className="text-center">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{jobs.length}</span> of{" "}
          <span className="font-semibold text-slate-700">{totalJobs}</span> jobs
        </p>
      </div>
    </div>
  );
};

// Header Component
const Header = ({ stats, totalJobs, isFetching, onRefresh }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Job Listings</h1>
      <p className="text-sm text-slate-500 mt-1">
        {totalJobs} total positions • {stats?.open || 0} open
        {isFetching && (
          <span className="ml-2 text-violet-600">
            <Loader2 className="w-3 h-3 inline animate-spin" /> Syncing...
          </span>
        )}
      </p>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onRefresh}
        disabled={isFetching}
        className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-600 ${isFetching ? "animate-spin" : ""}`} />
      </button>
      <Link
        to="/jobs/new"
        className="inline-flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Post New Job</span>
        <span className="sm:hidden">New</span>
      </Link>
    </div>
  </div>
);

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

// Job Card Component
const JobCard = ({
  job,
  activeMenu,
  setActiveMenu,
  onDelete,
  onStatusChange,
  isDeleting,
  isChangingStatus,
  formatDate,
  getTimeAgo,
}) => {
  const statusConfig = {
    open: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-1 ring-emerald-200", dot: "bg-emerald-500" },
    closed: { bg: "bg-red-50", text: "text-red-700", ring: "ring-1 ring-red-200", dot: "bg-red-500" },
    draft: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-1 ring-amber-200", dot: "bg-amber-500" },
  };

  const config = statusConfig[job.jobStatus] || statusConfig.draft;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Job Icon */}
        <div className="hidden sm:flex w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/25">
          <Briefcase className="w-6 h-6 text-white" />
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">{job.jobTitle}</h3>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  {job.department || "General"}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.location || "Remote"}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {job.applicationCount || 0} applications
                </span>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${config.bg} ${config.text} ${config.ring}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                {job.jobStatus}
              </span>
            </div>

            {/* Mobile Menu */}
            <div className="sm:hidden relative">
              <button
                onClick={() => setActiveMenu(activeMenu === job._id ? null : job._id)}
                className="p-2 rounded-xl hover:bg-slate-100"
              >
                <MoreVertical className="w-5 h-5 text-slate-400" />
              </button>

              {activeMenu === job._id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                  <MobileMenu
                    job={job}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                    isChangingStatus={isChangingStatus}
                    config={config}
                  />
                </>
              )}
            </div>
          </div>

          {/* Tags & Date */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              {/* Mobile Status Badge */}
              <span className={`sm:hidden inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold capitalize ${config.bg} ${config.text} ${config.ring}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                {job.jobStatus}
              </span>

              {job.employmentType && (
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] sm:text-xs font-medium">
                  {job.employmentType}
                </span>
              )}
              {job.experienceLevel && (
                <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-md text-[10px] sm:text-xs font-medium">
                  {job.experienceLevel}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{getTimeAgo(job.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onStatusChange}
            disabled={isChangingStatus}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 disabled:opacity-50 ${
              job.jobStatus === "open"
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            }`}
          >
            {isChangingStatus ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : job.jobStatus === "open" ? (
              <ToggleRight className="w-3.5 h-3.5" />
            ) : (
              <ToggleLeft className="w-3.5 h-3.5" />
            )}
            {job.jobStatus === "open" ? "Close" : "Open"}
          </button>

          <Link
            to={`/jobs/edit/${job._id}`}
            className="p-2 rounded-xl hover:bg-violet-100 text-slate-400 hover:text-violet-600 transition-all"
          >
            <Edit className="w-4 h-4" />
          </Link>

          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 rounded-xl hover:bg-red-100 text-slate-400 hover:text-red-600 transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Mobile Menu Component
const MobileMenu = ({ job, onStatusChange, onDelete, isChangingStatus, config }) => (
  <div className="absolute right-0 top-10 z-20 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1">
    <div className="px-3 py-2 border-b border-slate-100">
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold capitalize ${config.bg} ${config.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {job.jobStatus}
      </span>
    </div>
    <Link
      to={`/jobs/edit/${job._id}`}
      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
    >
      <Edit className="w-4 h-4" />
      Edit Job
    </Link>
    <button
      onClick={onStatusChange}
      disabled={isChangingStatus}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
    >
      {isChangingStatus ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : job.jobStatus === "open" ? (
        <ToggleRight className="w-4 h-4" />
      ) : (
        <ToggleLeft className="w-4 h-4" />
      )}
      {job.jobStatus === "open" ? "Close Job" : "Open Job"}
    </button>
    <button
      onClick={onDelete}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
    >
      <Trash2 className="w-4 h-4" />
      Delete Job
    </button>
  </div>
);

// Empty State Component
const EmptyState = ({ searchQuery, statusFilter, onClear }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center">
    <div className="relative inline-block">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
        <Briefcase className="w-8 h-8 text-slate-400" />
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
    </div>
    <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2">
      {searchQuery || statusFilter !== "all" ? "No jobs found" : "No jobs posted yet"}
    </h3>
    <p className="text-slate-500 mb-6">
      {searchQuery || statusFilter !== "all"
        ? "Try adjusting your search or filters"
        : "Create your first job posting to get started"}
    </p>
    {searchQuery || statusFilter !== "all" ? (
      <button
        onClick={onClear}
        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
      >
        <X className="w-4 h-4" />
        Clear Filters
      </button>
    ) : (
      <Link
        to="/jobs/new"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25"
      >
        <Plus className="w-5 h-5" />
        Post First Job
      </Link>
    )}
  </div>
);

// Pagination Component
const Pagination = ({ page, totalPages, totalJobs, onPageChange }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200">
    <p className="text-sm text-slate-500 order-2 sm:order-1">
      Page <span className="font-semibold text-slate-700">{page}</span> of{" "}
      <span className="font-semibold text-slate-700">{totalPages}</span>
    </p>
    <div className="flex items-center gap-2 order-1 sm:order-2">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="hidden sm:flex items-center gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (page <= 3) {
            pageNum = i + 1;
          } else if (page >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = page - 2 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                page === pageNum
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default JobList;