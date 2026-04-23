import React, { useState } from 'react';
import {
  Search,
  Download,
  FileText,
  ChevronDown,
  ExternalLink,
  Loader2,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Clock,
  RefreshCw,
  X,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Mail,
  Phone,
  Trash2,
  Sparkles,
  Eye,
  Calendar,
} from 'lucide-react';
import { 
  useApplications, 
  useChangeApplicationStatus, 
  useDeleteApplication,
  useApplicationStats,
  useExportApplicationsCSV
} from '../../api/hooks/useApplication';
import { formatDate, getInitials } from '../../utils/formatters';

const statusConfig = {
  new: { 
    bg: 'bg-blue-50', 
    text: 'text-blue-700', 
    ring: 'ring-1 ring-blue-200',
    dot: 'bg-blue-500',
    icon: Clock
  },
  shortlisted: { 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-700', 
    ring: 'ring-1 ring-emerald-200',
    dot: 'bg-emerald-500',
    icon: UserCheck
  },
  interviewed: { 
    bg: 'bg-violet-50', 
    text: 'text-violet-700', 
    ring: 'ring-1 ring-violet-200',
    dot: 'bg-violet-500',
    icon: Users
  },
  rejected: { 
    bg: 'bg-red-50', 
    text: 'text-red-700', 
    ring: 'ring-1 ring-red-200',
    dot: 'bg-red-500',
    icon: UserX
  },
  hired: { 
    bg: 'bg-amber-50', 
    text: 'text-amber-700', 
    ring: 'ring-1 ring-amber-200',
    dot: 'bg-amber-500',
    icon: CheckCircle
  },
};

const applicationStatuses = ['new', 'shortlisted', 'interviewed', 'rejected', 'hired'];

const Application = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

  const { 
    data: applicationsData, 
    isLoading, 
    isError, 
    error,
    refetch,
    isFetching
  } = useApplications({ 
    page, 
    limit: 10, 
    search: searchQuery,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const { data: statsData } = useApplicationStats();
  const changeStatus = useChangeApplicationStatus();
  const deleteApplication = useDeleteApplication();
  const exportApplications = useExportApplicationsCSV();

  const applications = applicationsData?.data || [];
  const totalApplications = applicationsData?.total || 0;
  const totalPages = applicationsData?.pages || 1;

  const stats = {
    total: totalApplications,
    new: statsData?.data?.byStatus?.find(s => s._id === 'new')?.count || 0,
    shortlisted: statsData?.data?.byStatus?.find(s => s._id === 'shortlisted')?.count || 0,
    hired: statsData?.data?.byStatus?.find(s => s._id === 'hired')?.count || 0,
  };

  const handleStatusChange = (id, newStatus) => {
    changeStatus.mutate({ id, status: newStatus });
    setOpenDropdown(null);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete ${name}'s application?`)) {
      deleteApplication.mutate(id);
    }
  };

  const handleExport = () => {
    exportApplications.mutate({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchQuery || undefined
    });
  };

  const toggleSelect = (id) => {
    setSelectedApplications(prev =>
      prev.includes(id) ? prev.filter(appId => appId !== id) : [...prev, id]
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
          <h3 className="text-lg font-bold text-slate-800">Loading Applications...</h3>
          <p className="text-slate-500 mt-1">Fetching applicant data</p>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-red-800">Failed to load applications</h3>
            <p className="text-red-600 mt-1">{error?.message || 'Something went wrong'}</p>
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
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      {/* Header */}
      <Header 
        stats={stats} 
        onExport={handleExport}
        isExporting={exportApplications.isPending}
        onRefresh={refetch}
        isFetching={isFetching}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total" value={stats.total} icon={Users} gradient="from-violet-500 to-purple-600" />
        <StatCard label="New" value={stats.new} icon={Clock} gradient="from-blue-500 to-cyan-600" />
        <StatCard label="Shortlisted" value={stats.shortlisted} icon={UserCheck} gradient="from-emerald-500 to-teal-600" />
        <StatCard label="Hired" value={stats.hired} icon={CheckCircle} gradient="from-amber-500 to-orange-600" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search applications..."
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
                  setSearchQuery('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-lg"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['all', ...applicationStatuses].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap capitalize transition-all ${
                  statusFilter === status
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <EmptyState 
          searchQuery={searchQuery} 
          statusFilter={statusFilter}
          onClear={() => {
            setSearchQuery('');
            setStatusFilter('all');
            setPage(1);
          }}
        />
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {applications.map((app) => (
            <ApplicationCard
              key={app._id}
              application={app}
              isSelected={selectedApplications.includes(app._id)}
              onSelect={() => toggleSelect(app._id)}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              isChangingStatus={changeStatus.isPending && changeStatus.variables?.id === app._id}
              isDeleting={deleteApplication.isPending && deleteApplication.variables === app._id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalApplications={totalApplications}
          onPageChange={setPage}
        />
      )}

      {/* Results Info */}
      <div className="text-center">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{applications.length}</span> of{' '}
          <span className="font-semibold text-slate-700">{totalApplications}</span> applications
        </p>
      </div>
    </div>
  );
};

// Header Component
const Header = ({ stats, onExport, isExporting, onRefresh, isFetching }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Job Applications</h1>
      <p className="text-sm text-slate-500 mt-1">
        {stats.total} total applications
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
        <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-600 ${isFetching ? 'animate-spin' : ''}`} />
      </button>
      <button
        onClick={onExport}
        disabled={isExporting}
        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Export</span>
      </button>
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

// Application Card Component
const ApplicationCard = ({
  application: app,
  isSelected,
  onSelect,
  openDropdown,
  setOpenDropdown,
  onStatusChange,
  onDelete,
  isChangingStatus,
  isDeleting,
}) => {
  const config = statusConfig[app.status] || statusConfig.new;
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex gap-3 sm:gap-4">
        {/* Checkbox */}
        <div className="pt-1 hidden sm:block">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
          />
        </div>

        {/* Avatar */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/25">
          <span className="text-white font-semibold text-sm sm:text-base">
            {getInitials(app.name)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-800 truncate">{app.name}</h3>
                <StatusBadge status={app.status} config={config} StatusIcon={StatusIcon} />
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="truncate max-w-[150px] sm:max-w-none">{app.email}</span>
                </span>
                {app.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {app.phone}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-lg text-xs font-medium">
                  {app.jobTitle}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {formatDate(app.createdAt)}
                </span>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <StatusDropdown
                currentStatus={app.status}
                isOpen={openDropdown === app._id}
                onToggle={() => setOpenDropdown(openDropdown === app._id ? null : app._id)}
                onSelect={(status) => onStatusChange(app._id, status)}
                isLoading={isChangingStatus}
                config={config}
              />

              {app.resume && (
                <a
                  href={app.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Resume
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <button
                onClick={() => onDelete(app._id, app.name)}
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

            {/* Mobile Actions */}
            <div className="sm:hidden relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === app._id ? null : app._id)}
                className="p-2 rounded-xl hover:bg-slate-100"
              >
                <MoreVertical className="w-5 h-5 text-slate-400" />
              </button>

              {openDropdown === app._id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                  <MobileMenu
                    app={app}
                    onStatusChange={(status) => onStatusChange(app._id, status)}
                    onDelete={() => onDelete(app._id, app.name)}
                    isChangingStatus={isChangingStatus}
                    config={config}
                  />
                </>
              )}
            </div>
          </div>

          {/* Cover Letter Preview */}
          {app.coverLetter && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-600 line-clamp-2">{app.coverLetter}</p>
            </div>
          )}

          {/* Internal Note */}
          {app.internalNote && (
            <div className="mt-2 text-xs text-slate-500 italic flex items-start gap-1">
              <span>📝</span>
              <span>{app.internalNote}</span>
            </div>
          )}

          {/* Mobile Quick Actions */}
          <div className="sm:hidden flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            {app.resume && (
              <a
                href={app.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-violet-100 text-violet-700 rounded-xl text-xs font-medium"
              >
                <FileText className="w-3.5 h-3.5" />
                View Resume
              </a>
            )}
            <StatusBadge status={app.status} config={config} StatusIcon={StatusIcon} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status, config, StatusIcon }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-semibold capitalize ${config.bg} ${config.text} ${config.ring}`}>
    <StatusIcon className="w-3 h-3" />
    {status}
  </span>
);

// Status Dropdown Component
const StatusDropdown = ({ currentStatus, isOpen, onToggle, onSelect, isLoading, config }) => (
  <div className="relative">
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${config.bg} ${config.text} ${config.ring} hover:opacity-80 disabled:opacity-50`}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <>
          <span className="capitalize">{currentStatus}</span>
          <ChevronDown className="w-3 h-3" />
        </>
      )}
    </button>

    {isOpen && (
      <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-20">
        {applicationStatuses.map((status) => {
          const statusConf = statusConfig[status];
          return (
            <button
              key={status}
              onClick={() => onSelect(status)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 capitalize"
            >
              <span className={`w-2 h-2 rounded-full ${statusConf.dot}`} />
              {status}
            </button>
          );
        })}
      </div>
    )}
  </div>
);

// Mobile Menu Component
const MobileMenu = ({ app, onStatusChange, onDelete, isChangingStatus, config }) => (
  <div className="absolute right-0 top-10 z-20 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1">
    <div className="px-3 py-2 border-b border-slate-100">
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold capitalize ${config.bg} ${config.text}`}>
        {app.status}
      </span>
    </div>
    
    <div className="py-1">
      <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">Change Status</p>
      {applicationStatuses.map((status) => {
        const statusConf = statusConfig[status];
        return (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            disabled={isChangingStatus}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 capitalize disabled:opacity-50"
          >
            <span className={`w-2 h-2 rounded-full ${statusConf.dot}`} />
            {status}
          </button>
        );
      })}
    </div>

    <div className="border-t border-slate-100 pt-1">
      <button
        onClick={onDelete}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
        Delete Application
      </button>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ searchQuery, statusFilter, onClear }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center">
    <div className="relative inline-block">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
        <FileText className="w-8 h-8 text-slate-400" />
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
    </div>
    <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2">No applications found</h3>
    <p className="text-slate-500 mb-6">
      {searchQuery || statusFilter !== 'all'
        ? 'Try adjusting your search or filters'
        : 'No applications have been submitted yet'}
    </p>
    {(searchQuery || statusFilter !== 'all') && (
      <button
        onClick={onClear}
        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
      >
        <X className="w-4 h-4" />
        Clear Filters
      </button>
    )}
  </div>
);

// Pagination Component
const Pagination = ({ page, totalPages, totalApplications, onPageChange }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200">
    <p className="text-sm text-slate-500 order-2 sm:order-1">
      Page <span className="font-semibold text-slate-700">{page}</span> of{' '}
      <span className="font-semibold text-slate-700">{totalPages}</span>
    </p>
    <div className="flex items-center gap-2 order-1 sm:order-2">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="hidden sm:flex items-center gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) pageNum = i + 1;
          else if (page <= 3) pageNum = i + 1;
          else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
          else pageNum = page - 2 + i;
          
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                page === pageNum
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
        className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default Application;