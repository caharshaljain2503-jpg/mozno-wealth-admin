import React, { useState } from "react";
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  Clock,
  X,
  Filter,
  Trash2,
  CheckCheck,
  RefreshCw,
  ExternalLink,
  Loader2,
  Sparkles,
  MoreVertical,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import {
  useNotifications,
  useNotificationStats,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useClearAllNotifications,
} from "../api/hooks/useNotifications";

const Notifications = () => {
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const { data, isLoading, error, refetch } = useNotifications({
    read: filter === "all" ? undefined : filter === "unread" ? false : true,
    type: typeFilter === "all" ? undefined : typeFilter,
    limit: 50,
  });

  const { data: stats } = useNotificationStats({
    refetchInterval: 30000,
  });

  const notifications = data?.notifications || [];
  const pagination = data?.pagination;

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const clearAllNotifications = useClearAllNotifications({
    onSuccess: () => {
      setShowClearAllModal(false);
    },
  });

  const getTypeConfig = (type) => {
    switch (type) {
      case "error":
        return {
          icon: XCircle,
          bg: "bg-red-50",
          iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
          text: "text-red-700",
          border: "border-red-200",
          ring: "ring-red-100",
          shadow: "shadow-red-500/10",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          bg: "bg-amber-50",
          iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
          text: "text-amber-700",
          border: "border-amber-200",
          ring: "ring-amber-100",
          shadow: "shadow-amber-500/10",
        };
      case "success":
        return {
          icon: CheckCircle,
          bg: "bg-emerald-50",
          iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
          text: "text-emerald-700",
          border: "border-emerald-200",
          ring: "ring-emerald-100",
          shadow: "shadow-emerald-500/10",
        };
      case "info":
      default:
        return {
          icon: Info,
          bg: "bg-blue-50",
          iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
          text: "text-blue-700",
          border: "border-blue-200",
          ring: "ring-blue-100",
          shadow: "shadow-blue-500/10",
        };
    }
  };

  const getCategoryConfig = (category) => {
    const configs = {
      api: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        ring: "ring-1 ring-purple-200",
      },
      security: {
        bg: "bg-red-50",
        text: "text-red-700",
        ring: "ring-1 ring-red-200",
      },
      system: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        ring: "ring-1 ring-blue-200",
      },
      user: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        ring: "ring-1 ring-emerald-200",
      },
      blog: {
        bg: "bg-orange-50",
        text: "text-orange-700",
        ring: "ring-1 ring-orange-200",
      },
      lead: {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        ring: "ring-1 ring-indigo-200",
      },
      admin: {
        bg: "bg-slate-100",
        text: "text-slate-700",
        ring: "ring-1 ring-slate-200",
      },
    };
    return configs[category] || configs.admin;
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleAction = (action) => {
    if (action?.url) {
      window.open(action.url, "_blank");
    }
  };

  const unreadCount = stats?.unread || 0;
  const errorCount = stats?.byType?.error || 0;
  const warningCount = stats?.byType?.warning || 0;
  const totalCount = stats?.total || notifications.length;

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
          <h3 className="text-lg font-semibold text-slate-800">
            Loading notifications...
          </h3>
          <p className="text-slate-500 mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="space-y-6">
        <Header unreadCount={unreadCount} />
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 text-lg">
                Failed to load notifications
              </h3>
              <p className="text-red-600 mt-1">
                {error?.message || "Something went wrong"}
              </p>
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
      <Header
        unreadCount={unreadCount}
        onMarkAllRead={() => markAllAsRead.mutate()}
        onClearAll={() => setShowClearAllModal(true)}
        isMarkingAll={markAllAsRead.isPending}
        hasNotifications={notifications.length > 0}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Critical"
          value={errorCount}
          icon={XCircle}
          gradient="from-red-500 to-rose-600"
          shadow="shadow-red-500/20"
        />
        <StatCard
          label="Warnings"
          value={warningCount}
          icon={AlertTriangle}
          gradient="from-amber-500 to-orange-600"
          shadow="shadow-amber-500/20"
        />
        <StatCard
          label="Unread"
          value={unreadCount}
          icon={Bell}
          gradient="from-violet-500 to-purple-600"
          shadow="shadow-violet-500/20"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Status Filters */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Status
            </label>
            <div className="hidden sm:flex items-center gap-2">
              {["all", "unread", "read"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
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

          {/* Type Filters */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Type
            </label>
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              {[
                { id: "all", label: "All Types" },
                { id: "error", label: "Errors" },
                { id: "warning", label: "Warnings" },
                { id: "success", label: "Success" },
                { id: "info", label: "Info" },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setTypeFilter(type.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    typeFilter === type.id
                      ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl text-slate-700 font-medium"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          {/* Mobile Filters Dropdown */}
          {showMobileFilters && (
            <div className="sm:hidden space-y-4 pt-4 border-t border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Status
                </label>
                <div className="flex gap-2">
                  {["all", "unread", "read"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                        filter === status
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "all", label: "All" },
                    { id: "error", label: "Errors" },
                    { id: "warning", label: "Warnings" },
                    { id: "success", label: "Success" },
                    { id: "info", label: "Info" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setTypeFilter(type.id)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        typeFilter === type.id
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <EmptyState filter={filter} typeFilter={typeFilter} />
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden lg:block space-y-3">
              {notifications.map((notification, index) => {
                const typeConfig = getTypeConfig(notification.type);
                const categoryConfig = getCategoryConfig(notification.category);
                const IconComponent = typeConfig.icon;
                const isMarkingRead =
                  markAsRead.isPending &&
                  markAsRead.variables === notification._id;
                const isDeleting =
                  deleteNotification.isPending &&
                  deleteNotification.variables === notification._id;

                return (
                  <div
                    key={notification._id}
                    className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all ${
                      !notification.read ? "border-l-4 border-l-violet-500" : ""
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${typeConfig.iconBg} flex items-center justify-center flex-shrink-0 shadow-lg ${typeConfig.shadow}`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-semibold text-slate-800 truncate">
                                {notification.title}
                              </h4>
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.ring}`}
                              >
                                {notification.category}
                              </span>
                              {!notification.read && (
                                <span className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-pulse" />
                              )}
                            </div>
                            <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                                <Clock className="w-4 h-4" />
                                {formatTimeAgo(notification.createdAt)}
                              </div>
                              {notification.action && (
                                <button
                                  onClick={() =>
                                    handleAction(notification.action)
                                  }
                                  className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
                                >
                                  {notification.action.label}
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <button
                                onClick={() =>
                                  markAsRead.mutate(notification._id)
                                }
                                disabled={isMarkingRead}
                                className="p-2 rounded-lg hover:bg-violet-100 text-slate-400 hover:text-violet-600 transition-all disabled:opacity-50"
                                title="Mark as read"
                              >
                                {isMarkingRead ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() =>
                                deleteNotification.mutate(notification._id)
                              }
                              disabled={isDeleting}
                              className="p-2 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-all disabled:opacity-50"
                              title="Delete"
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
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-3">
              {notifications.map((notification, index) => {
                const typeConfig = getTypeConfig(notification.type);
                const categoryConfig = getCategoryConfig(notification.category);
                const IconComponent = typeConfig.icon;
                const isMarkingRead =
                  markAsRead.isPending &&
                  markAsRead.variables === notification._id;
                const isDeleting =
                  deleteNotification.isPending &&
                  deleteNotification.variables === notification._id;

                return (
                  <div
                    key={notification._id}
                    className={`bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all ${
                      !notification.read ? "border-l-4 border-l-violet-500" : ""
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${typeConfig.iconBg} flex items-center justify-center flex-shrink-0 shadow-lg ${typeConfig.shadow}`}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-slate-800 line-clamp-2 text-sm">
                            {notification.title}
                          </h4>
                          <div className="relative flex-shrink-0">
                            <button
                              onClick={() =>
                                setActiveDropdown(
                                  activeDropdown === notification._id
                                    ? null
                                    : notification._id,
                                )
                              }
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>

                            {activeDropdown === notification._id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setActiveDropdown(null)}
                                />
                                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20">
                                  {!notification.read && (
                                    <button
                                      onClick={() => {
                                        markAsRead.mutate(notification._id);
                                        setActiveDropdown(null);
                                      }}
                                      disabled={isMarkingRead}
                                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 w-full"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Mark as Read
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      deleteNotification.mutate(
                                        notification._id,
                                      );
                                      setActiveDropdown(null);
                                    }}
                                    disabled={isDeleting}
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
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.ring}`}
                          >
                            {notification.category}
                          </span>
                          {!notification.read && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-600 rounded-md text-xs font-medium ring-1 ring-violet-200">
                              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                              Unread
                            </span>
                          )}
                        </div>

                        <p className="text-slate-600 text-sm line-clamp-2 mt-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {notification.action && (
                            <button
                              onClick={() => handleAction(notification.action)}
                              className="inline-flex items-center gap-1 text-xs text-violet-600 font-medium"
                            >
                              {notification.action.label}
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-medium text-slate-700">
            {notifications.length}
          </span>{" "}
          of <span className="font-medium text-slate-700">{totalCount}</span>{" "}
          notifications
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

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Page{" "}
              <span className="font-medium text-slate-700">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">
                {pagination.pages}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30">
                <Trash2 className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
              Clear All Notifications
            </h3>
            <p className="text-slate-500 text-center mb-6">
              Are you sure you want to delete all{" "}
              <span className="font-semibold text-slate-700">
                {notifications.length}
              </span>{" "}
              notifications? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowClearAllModal(false)}
                className="flex-1 px-5 py-3 text-slate-700 bg-slate-100 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => clearAllNotifications.mutate()}
                disabled={clearAllNotifications.isPending}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50"
              >
                {clearAllNotifications.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Clear All"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Header Component
const Header = ({
  unreadCount,
  onMarkAllRead,
  onClearAll,
  isMarkingAll,
  hasNotifications,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
        Notifications
        {unreadCount > 0 && (
          <span className="ml-3 inline-flex items-center justify-center px-3 py-1 text-sm font-bold bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full shadow-lg shadow-violet-500/25">
            {unreadCount}
          </span>
        )}
      </h1>
      <p className="text-slate-500 mt-1">
        System alerts and activity notifications
      </p>
    </div>
    <div className="flex items-center gap-2">
      {unreadCount > 0 && (
        <button
          onClick={onMarkAllRead}
          disabled={isMarkingAll}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          {isMarkingAll ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCheck className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Mark All Read</span>
        </button>
      )}
      {hasNotifications && (
        <button
          onClick={onClearAll}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear All</span>
        </button>
      )}
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, gradient, shadow }) => (
  <div
    className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-2xl p-4 sm:p-5 text-white ${shadow} shadow-lg`}
  >
    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
    <div className="relative flex items-center gap-3">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div>
        <p className="text-white/80 text-xs sm:text-sm font-medium">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ filter, typeFilter }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12">
    <div className="text-center max-w-md mx-auto">
      <div className="relative inline-block">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto">
          <Inbox className="w-10 h-10 text-violet-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mt-6">
        {filter !== "all" || typeFilter !== "all"
          ? "No notifications found"
          : "All caught up!"}
      </h3>
      <p className="text-slate-500 mt-2">
        {filter !== "all" || typeFilter !== "all"
          ? "No notifications match your current filters. Try adjusting them."
          : "You're all caught up! No notifications at the moment."}
      </p>
    </div>
  </div>
);

export default Notifications;
