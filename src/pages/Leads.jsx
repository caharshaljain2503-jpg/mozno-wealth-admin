import React, { useState } from "react";
import {
  Search,
  Download,
  Mail,
  MailOpen,
  Reply,
  Eye,
  Clock,
  Phone,
  Building,
  MapPin,
  Loader2,
  RefreshCw,
  X,
  Users,
  Filter,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  useAllLeads,
  useLeadById,
  useUpdateLeadStatus,
} from "../api/hooks/useContact";

const Leads = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: leads = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useAllLeads();

  const {
    data: selectedLead,
    isLoading: leadLoading,
    error: leadError,
  } = useLeadById(selectedLeadId);

  const updateStatus = useUpdateLeadStatus({
    onSuccess: () => console.log("Status updated"),
    onError: (error) => console.error("Failed to update status:", error),
  });

  const statusConfig = {
    new: { 
      icon: Mail, 
      bg: "bg-blue-50", 
      text: "text-blue-700", 
      ring: "ring-1 ring-blue-200",
      dot: "bg-blue-500"
    },
    read: { 
      icon: MailOpen, 
      bg: "bg-amber-50", 
      text: "text-amber-700", 
      ring: "ring-1 ring-amber-200",
      dot: "bg-amber-500"
    },
    replied: { 
      icon: Reply, 
      bg: "bg-emerald-50", 
      text: "text-emerald-700", 
      ring: "ring-1 ring-emerald-200",
      dot: "bg-emerald-500"
    },
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone?.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    read: leads.filter(l => l.status === "read").length,
    replied: leads.filter(l => l.status === "replied").length,
  };

  const handleStatusChange = (id, newStatus) => {
    updateStatus.mutate({ contactId: id, status: newStatus });
  };

  const exportToCSV = () => {
    if (leads.length === 0) return alert("No leads to export");
    
    const headers = ["Name", "Email", "Phone", "Company", "Service", "Status", "Message", "Created At", "Country"];
    const csvRows = leads.map((lead) =>
      [
        `"${(lead.fullName || "").replace(/"/g, '""')}"`,
        `"${(lead.email || "").replace(/"/g, '""')}"`,
        `"${(lead.phone || "").replace(/"/g, '""')}"`,
        `"${(lead.company || "").replace(/"/g, '""')}"`,
        `"${(lead.service || "").replace(/"/g, '""')}"`,
        `"${lead.status || "new"}"`,
        `"${(lead.message || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
        `"${lead.createdAt || ""}"`,
        `"${lead.country || ""}"`,
      ].join(",")
    );

    const blob = new Blob([[headers.join(","), ...csvRows].join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Loading Leads...</h3>
          <p className="text-slate-500 mt-1">Fetching contact submissions</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="space-y-6">
        <Header stats={stats} onExport={exportToCSV} onRefresh={refetch} isFetching={isFetching} />
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Failed to load leads</h3>
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
      <Header stats={stats} onExport={exportToCSV} onRefresh={refetch} isFetching={isFetching} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total" value={stats.total} color="violet" />
        <StatCard label="New" value={stats.new} color="blue" />
        <StatCard label="Read" value={stats.read} color="amber" />
        <StatCard label="Replied" value={stats.replied} color="emerald" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads..."
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

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["all", "new", "read", "replied"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== "all" && (
                  <span className="ml-1.5 opacity-70">({stats[status]})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {/* Desktop Table */}
        <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Service</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState searchQuery={searchQuery} />
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <LeadTableRow
                    key={lead._id}
                    lead={lead}
                    statusConfig={statusConfig}
                    onView={() => setSelectedLeadId(lead._id)}
                    onStatusChange={handleStatusChange}
                    isUpdating={updateStatus.isPending && updateStatus.variables?.contactId === lead._id}
                    formatDate={formatDate}
                    getInitials={getInitials}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Cards */}
        <div className="lg:hidden space-y-3">
          {filteredLeads.length === 0 ? (
            <EmptyState searchQuery={searchQuery} />
          ) : (
            filteredLeads.map((lead) => (
              <LeadCard
                key={lead._id}
                lead={lead}
                statusConfig={statusConfig}
                onView={() => setSelectedLeadId(lead._id)}
                onStatusChange={handleStatusChange}
                isUpdating={updateStatus.isPending && updateStatus.variables?.contactId === lead._id}
                getTimeAgo={getTimeAgo}
                getInitials={getInitials}
              />
            ))
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-center">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filteredLeads.length}</span> of{" "}
          <span className="font-semibold text-slate-700">{leads.length}</span> leads
        </p>
      </div>

      {/* Lead Detail Modal */}
      {selectedLeadId && (
        <LeadModal
          lead={selectedLead}
          isLoading={leadLoading}
          error={leadError}
          statusConfig={statusConfig}
          onClose={() => setSelectedLeadId(null)}
          formatDate={formatDate}
          getInitials={getInitials}
        />
      )}
    </div>
  );
};

// Header Component
const Header = ({ stats, onExport, onRefresh, isFetching }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Contact Leads</h1>
      <p className="text-sm text-slate-500 mt-1">
        {stats.total} total submission{stats.total !== 1 ? "s" : ""}
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
      <button
        onClick={onExport}
        disabled={stats.total === 0}
        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
      </button>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ label, value, color }) => {
  const colors = {
    violet: "from-violet-500 to-purple-600 shadow-violet-500/20",
    blue: "from-blue-500 to-cyan-600 shadow-blue-500/20",
    amber: "from-amber-500 to-orange-600 shadow-amber-500/20",
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/20",
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${colors[color]} rounded-2xl p-4 sm:p-5 text-white shadow-lg`}>
      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <p className="text-white/80 text-xs sm:text-sm font-medium">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold mt-1">{value}</p>
    </div>
  );
};

// Lead Table Row Component
const LeadTableRow = ({ lead, statusConfig, onView, onStatusChange, isUpdating, formatDate, getInitials }) => {
  const config = statusConfig[lead.status] || statusConfig.new;
  const StatusIcon = config.icon;

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
            <span className="text-sm font-semibold text-white">{getInitials(lead.fullName)}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate">{lead.fullName}</p>
            <p className="text-sm text-slate-500 truncate">{lead.email}</p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
          {lead.service || "N/A"}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
          <MapPin className="w-4 h-4 text-slate-400" />
          {lead.country || "Unknown"}
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
          <Clock className="w-4 h-4 text-slate-400" />
          {formatDate(lead.createdAt)}
        </div>
      </td>
      <td className="p-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${config.bg} ${config.text} ${config.ring}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          {lead.status}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onView}
            className="p-2 rounded-xl hover:bg-violet-100 text-slate-400 hover:text-violet-600 transition-all"
          >
            <Eye className="w-4 h-4" />
          </button>
          {lead.status === "new" && (
            <button
              onClick={() => onStatusChange(lead._id, "read")}
              disabled={isUpdating}
              className="p-2 rounded-xl hover:bg-amber-100 text-slate-400 hover:text-amber-600 transition-all disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MailOpen className="w-4 h-4" />}
            </button>
          )}
          {lead.status !== "replied" && (
            <button
              onClick={() => onStatusChange(lead._id, "replied")}
              disabled={isUpdating}
              className="p-2 rounded-xl hover:bg-emerald-100 text-slate-400 hover:text-emerald-600 transition-all disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Reply className="w-4 h-4" />}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

// Lead Card Component (Mobile)
const LeadCard = ({ lead, statusConfig, onView, onStatusChange, isUpdating, getTimeAgo, getInitials }) => {
  const config = statusConfig[lead.status] || statusConfig.new;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
          <span className="text-sm font-semibold text-white">{getInitials(lead.fullName)}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-slate-800 truncate">{lead.fullName}</h4>
              <p className="text-sm text-slate-500 truncate">{lead.email}</p>
            </div>
            <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-semibold capitalize ${config.bg} ${config.text} ${config.ring}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {lead.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
            {lead.service && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                {lead.service}
              </span>
            )}
            {lead.country && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="w-3 h-3" />
                {lead.country}
              </span>
            )}
            <span className="text-xs text-slate-400">{getTimeAgo(lead.createdAt)}</span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-violet-600">
                <Phone className="w-3 h-3" />
                {lead.phone}
              </a>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={onView}
                className="p-2 rounded-lg bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              {lead.status !== "replied" && (
                <button
                  onClick={() => onStatusChange(lead._id, lead.status === "new" ? "read" : "replied")}
                  disabled={isUpdating}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : lead.status === "new" ? (
                    <MailOpen className="w-4 h-4" />
                  ) : (
                    <Reply className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ searchQuery }) => (
  <div className="py-12 sm:py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
      <Users className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-800">
      {searchQuery ? "No leads found" : "No leads yet"}
    </h3>
    <p className="text-slate-500 mt-1">
      {searchQuery ? "Try adjusting your search" : "Contact submissions will appear here"}
    </p>
  </div>
);

// Lead Modal Component
const LeadModal = ({ lead, isLoading, error, statusConfig, onClose, formatDate, getInitials }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div
      className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto" />
          <p className="mt-3 text-slate-600">Loading details...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <X className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">Failed to load</h3>
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium">
            Close
          </button>
        </div>
      ) : lead ? (
        <>
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <span className="text-white font-semibold">{getInitials(lead.fullName)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{lead.fullName}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {lead.email}
                  </p>
                  {lead.phone && (
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                      {lead.phone}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            {lead.status && (
              <div className="mt-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${statusConfig[lead.status]?.bg} ${statusConfig[lead.status]?.text} ${statusConfig[lead.status]?.ring}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[lead.status]?.dot}`} />
                  {lead.status}
                </span>
              </div>
            )}
          </div>

          {/* Modal Content */}
          <div className="p-5 sm:p-6 space-y-4 max-h-[50vh] overflow-y-auto">
            {lead.company && (
              <DetailRow icon={Building} label="Company" value={lead.company} />
            )}
            <DetailRow icon={Sparkles} label="Service" value={lead.service} badge />
            {lead.message && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Message</label>
                <p className="mt-2 text-slate-700 text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {lead.message}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <DetailRow icon={Clock} label="Submitted" value={formatDate(lead.createdAt)} small />
              {lead.country && <DetailRow icon={MapPin} label="Location" value={lead.country} small />}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <a
              href={`mailto:${lead.email}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25"
            >
              <Mail className="w-4 h-4" />
              Reply via Email
            </a>
          </div>
        </>
      ) : null}
    </div>
  </div>
);

// Detail Row Component
const DetailRow = ({ icon: Icon, label, value, badge, small }) => (
  <div>
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </label>
    {badge ? (
      <span className="inline-block mt-1.5 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium">
        {value || "N/A"}
      </span>
    ) : (
      <p className={`mt-1 text-slate-800 ${small ? "text-sm" : ""}`}>{value || "N/A"}</p>
    )}
  </div>
);

export default Leads;