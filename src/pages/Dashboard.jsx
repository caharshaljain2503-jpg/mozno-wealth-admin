import React, { useState } from "react";
import {
  TrendingUp,
  Users,
  Eye,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  FileText,
  Star,
  TrendingDown,
  ChevronRight,
  Target,
  Loader2,
  AlertCircle,
  Bell,
  MessageSquare,
  Briefcase,
  Mail,
  BarChart3,
  Zap,
  Activity,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
} from "lucide-react";
import { useDashboardStats } from "../api/hooks/useDashboard";
import { Link } from "react-router-dom";

// Gradient Stat Card Component
const StatCard = ({ title, value, growth, icon: Icon, subtitle, gradient, delay = 0 }) => {
  const isPositive = growth > 0;
  const isNegative = growth < 0;

  const gradients = {
    violet: "from-violet-500 to-purple-600",
    emerald: "from-emerald-500 to-teal-600",
    blue: "from-blue-500 to-indigo-600",
    amber: "from-amber-500 to-orange-600",
    rose: "from-rose-500 to-pink-600",
    slate: "from-slate-600 to-slate-800",
  };

  return (
    <div 
      className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background Gradient Accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradients[gradient] || gradients.violet} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <span className="text-sm font-medium text-slate-500">{title}</span>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {growth !== undefined && growth !== null && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold ${
                isPositive 
                  ? "bg-emerald-50 text-emerald-600" 
                  : isNegative 
                    ? "bg-red-50 text-red-600" 
                    : "bg-slate-100 text-slate-500"
              }`}>
                {isPositive ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : isNegative ? (
                  <ArrowDownRight className="w-4 h-4" />
                ) : null}
                <span>{isPositive ? "+" : ""}{growth}%</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 bg-gradient-to-br ${gradients[gradient] || gradients.violet} rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Mini Stat Card
const MiniStatCard = ({ title, value, subtitle, icon: Icon, gradient }) => {
  const gradients = {
    violet: { bg: "bg-violet-50", icon: "bg-gradient-to-br from-violet-500 to-purple-600", text: "text-violet-600" },
    emerald: { bg: "bg-emerald-50", icon: "bg-gradient-to-br from-emerald-500 to-teal-600", text: "text-emerald-600" },
    blue: { bg: "bg-blue-50", icon: "bg-gradient-to-br from-blue-500 to-indigo-600", text: "text-blue-600" },
    amber: { bg: "bg-amber-50", icon: "bg-gradient-to-br from-amber-500 to-orange-600", text: "text-amber-600" },
    rose: { bg: "bg-rose-50", icon: "bg-gradient-to-br from-rose-500 to-pink-600", text: "text-rose-600" },
  };

  const colors = gradients[gradient] || gradients.violet;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl ${colors.icon} shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm font-medium text-slate-500">{title}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
};

// Section Header Component
const SectionHeader = ({ title, subtitle, action, actionLabel = "View All", to }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {(action || to) && (
      <Link
        to={to}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-colors"
      >
        {actionLabel}
        <ArrowRight className="w-4 h-4" />
      </Link>
    )}
  </div>
);

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("month");

  const { data, isLoading, isError, error, refetch, isFetching } =
    useDashboardStats(timeRange);

  const dashboard = data?.data;

  // Helper functions
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    const n = Number(num);
    if (isNaN(n)) return "0";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toLocaleString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return "";
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      new: { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-1 ring-blue-200" },
      read: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-1 ring-amber-200" },
      replied: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-1 ring-emerald-200" },
      published: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-1 ring-emerald-200" },
      draft: { bg: "bg-slate-100", text: "text-slate-600", ring: "ring-1 ring-slate-200" },
      pending: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-1 ring-amber-200" },
      approved: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-1 ring-emerald-200" },
      rejected: { bg: "bg-red-50", text: "text-red-700", ring: "ring-1 ring-red-200" },
      hired: { bg: "bg-purple-50", text: "text-purple-700", ring: "ring-1 ring-purple-200" },
      shortlisted: { bg: "bg-indigo-50", text: "text-indigo-700", ring: "ring-1 ring-indigo-200" },
    };
    const config = configs[status?.toLowerCase()] || configs.new;
    return `${config.bg} ${config.text} ${config.ring}`;
  };

  const getDeviceIcon = (device) => {
    switch (device?.toLowerCase()) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      case 'desktop': return Monitor;
      default: return Globe;
    }
  };

  // Loading state
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
          <h3 className="text-lg font-semibold text-slate-800">Loading dashboard...</h3>
          <p className="text-slate-500 mt-1">Fetching your latest analytics</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Failed to load dashboard
          </h3>
          <p className="text-slate-500 mb-6">
            {error?.message || "Something went wrong. Please try again."}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all font-semibold shadow-lg shadow-violet-500/25"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!dashboard) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto">
              <BarChart3 className="w-10 h-10 text-slate-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">
            No data available
          </h3>
          <p className="text-slate-500 mb-6">
            Dashboard data could not be loaded.
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all font-semibold shadow-lg shadow-violet-500/25"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const {
    stats = {},
    performance = {},
    charts = {},
    recent = {},
    summary = {},
  } = dashboard;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Dashboard</h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full shadow-lg shadow-violet-500/25">
              <Sparkles className="w-3 h-3 mr-1" />
              Live
            </span>
          </div>
          <p className="text-slate-500 mt-1">
            Here's what's happening with your site today
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {["day", "week", "month", "year"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all duration-200 ${
                  timeRange === range
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 shadow-sm"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 text-slate-600 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Visits"
          value={formatNumber(stats.totalVisits)}
          growth={stats.visitsGrowth}
          icon={Eye}
          subtitle={`${formatNumber(stats.todayVisits)} today`}
          gradient="violet"
          delay={0}
        />
        <StatCard
          title="Total Leads"
          value={formatNumber(stats.totalLeads)}
          growth={stats.leadsGrowth}
          icon={Users}
          subtitle={`${stats.newLeadsToday || 0} new today`}
          gradient="emerald"
          delay={50}
        />
        <StatCard
          title="Total Blogs"
          value={formatNumber(stats.totalBlogs)}
          icon={FileText}
          subtitle={`${stats.publishedBlogs || 0} published`}
          gradient="blue"
          delay={100}
        />
        <StatCard
          title="Conversion Rate"
          value={performance.conversionRate || "0%"}
          icon={Target}
          subtitle="Leads / Visits"
          gradient="amber"
          delay={150}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visits Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <SectionHeader 
            title="Visits Overview" 
            subtitle="Daily traffic for the selected period"
          />
          
          <div className="h-64">
            {charts.dailyVisits?.length > 0 ? (
              <div className="flex items-end justify-between h-52 gap-1 px-2">
                {charts.dailyVisits.slice(-14).map((item, index) => {
                  const maxVisits = Math.max(...charts.dailyVisits.map((d) => d.visits || 0), 1);
                  const height = ((item.visits || 0) / maxVisits) * 180;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group cursor-pointer">
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 mb-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-xl">
                        {item.visits} visits
                        <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-slate-900" />
                      </div>
                      
                      {/* Bar */}
                      <div
                        className="w-full bg-gradient-to-t from-violet-600 to-purple-500 rounded-t-lg transition-all duration-300 hover:from-violet-500 hover:to-purple-400 min-h-[4px] shadow-lg shadow-violet-500/20"
                        style={{ height: `${Math.max(height, 4)}px` }}
                      />
                      
                      {/* Label */}
                      <span className="text-[10px] sm:text-xs text-slate-400 mt-2 font-medium">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-7 h-7 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium">No visit data available</p>
                  <p className="text-slate-400 text-sm mt-1">Data will appear once you have traffic</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance & Devices */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Performance</h3>
            <div className="space-y-4">
              {[
                { label: "Avg. Session", value: performance.avgSessionDuration || "0m 0s", icon: Clock, gradient: "from-blue-500 to-indigo-600" },
                { label: "Bounce Rate", value: performance.bounceRate || "0%", icon: TrendingDown, gradient: "from-rose-500 to-pink-600" },
                { label: "Pages/Session", value: performance.pagesPerSession || "0", icon: FileText, gradient: "from-emerald-500 to-teal-600" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient} shadow-lg`}>
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{item.label}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Device Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Devices</h3>
            <div className="space-y-4">
              {charts.deviceDistribution?.length > 0 ? (
                charts.deviceDistribution.map((device, index) => {
                  const DeviceIcon = getDeviceIcon(device.device);
                  const colors = ["from-violet-500 to-purple-600", "from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600"];
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <DeviceIcon className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-700 capitalize">
                            {device.device}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {device.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-700`}
                          style={{ width: `${device.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No device data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <SectionHeader 
              title="Recent Leads" 
              subtitle="Latest contact submissions"
              to="/leads"
            />
          </div>
          
          <div className="divide-y divide-slate-100">
            {recent.leads?.length > 0 ? (
              recent.leads.slice(0, 5).map((lead, index) => (
                <div 
                  key={lead.id} 
                  className="p-4 hover:bg-slate-50 transition-colors group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                      <span className="text-white font-semibold text-sm">
                        {lead.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-slate-800 truncate">{lead.name}</h4>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${getStatusConfig(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm text-slate-500 truncate">{lead.email}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-400">{formatTimeAgo(lead.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">No recent leads</p>
                <p className="text-slate-400 text-sm mt-1">New leads will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Blogs */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <SectionHeader 
              title="Recent Blogs" 
              subtitle="Latest blog posts"
              to="/blogs"
            />
          </div>
          
          <div className="divide-y divide-slate-100">
            {recent.blogs?.length > 0 ? (
              recent.blogs.slice(0, 5).map((blog, index) => (
                <div 
                  key={blog.id} 
                  className="p-4 hover:bg-slate-50 transition-colors group cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    {blog.image ? (
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-slate-200 group-hover:scale-105 transition-transform"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-6 h-6 text-blue-500" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 truncate group-hover:text-violet-600 transition-colors">{blog.title}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${getStatusConfig(blog.status)}`}>
                          {blog.status}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(blog.date)}
                        </span>
                      </div>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">No recent blogs</p>
                <p className="text-slate-400 text-sm mt-1">Published blogs will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStatCard
          title="Testimonials"
          value={stats.totalTestimonials || 0}
          subtitle={`⭐ ${stats.avgRating || 0} avg rating`}
          icon={Star}
          gradient="amber"
        />
        <MiniStatCard
          title="Comments"
          value={stats.totalComments || 0}
          subtitle={`${stats.pendingComments || 0} pending`}
          icon={MessageSquare}
          gradient="blue"
        />
        <MiniStatCard
          title="Applications"
          value={stats.totalApplications || 0}
          subtitle={`${stats.newApplications || 0} new`}
          icon={Briefcase}
          gradient="emerald"
        />
        <MiniStatCard
          title="Notifications"
          value={stats.unreadNotifications || 0}
          subtitle="Unread alerts"
          icon={Bell}
          gradient="rose"
        />
      </div>

      {/* Top Pages & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <SectionHeader title="Top Pages" subtitle="Most visited pages" />
          
          <div className="space-y-2">
            {charts.topPages?.length > 0 ? (
              charts.topPages.slice(0, 8).map((page, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                    index < 3 
                      ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20" 
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {page.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-slate-700 truncate block group-hover:text-violet-600 transition-colors">
                      {page.page}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-900">
                      {formatNumber(page.visits)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">No page data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Summary Card */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-violet-500/25">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Summary</h3>
              <p className="text-white/70 text-sm">{summary.month || "This Month"}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { label: "Total Traffic", value: formatNumber(summary.totalTraffic), icon: Eye },
              { label: "New Leads", value: summary.newLeads || 0, icon: Users },
              { label: "New Blogs", value: summary.newBlogs || 0, icon: FileText },
              { label: "Avg. Rating", value: `⭐ ${summary.avgRating || 0}`, icon: Star },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-white/70" />
                  <span className="text-white/80 text-sm">{item.label}</span>
                </div>
                <span className="font-bold">{item.value}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-sm">Goal Progress</span>
              <span className="font-bold">{summary.goalCompletion || 0}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700 shadow-lg"
                style={{ width: `${Math.min(summary.goalCompletion || 0, 100)}%` }}
              />
            </div>
            <p className="text-white/60 text-xs mt-2">Keep it up! You're doing great 🎉</p>
          </div>
        </div>
      </div>

      {/* Recent Admin Activity */}
      {recent.adminLogins?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <SectionHeader title="Team Activity" subtitle="Recent admin logins" />
          
          <div className="flex flex-wrap gap-3">
            {recent.adminLogins.map((admin, index) => (
              <div
                key={admin.id}
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:from-violet-50 hover:to-purple-50 transition-all group cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                    {admin.avatar ? (
                      <img
                        src={admin.avatar}
                        alt={admin.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold">
                        {admin.name?.charAt(0)?.toUpperCase() || "A"}
                      </span>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{admin.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(admin.lastLogin)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;