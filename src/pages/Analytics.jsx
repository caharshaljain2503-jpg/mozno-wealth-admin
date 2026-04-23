import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from "recharts";
import {
  Activity,
  Users,
  Globe,
  Eye,
  TrendingUp,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  MapPin,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  MousePointer,
  Timer,
  FileText,
  Zap,
  BarChart3,
} from "lucide-react";
import {
  useDailyVisits,
  useAnalyticsDashboard,
  useRecentVisits,
  useAnalyticsStats,
} from "../api/hooks/useAnalytics";

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-slate-600">
            {entry.name}:{" "}
            <span className="font-semibold text-violet-600">
              {entry.value?.toLocaleString()}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Stat Card Component
const StatCard = ({
  title,
  value,
  icon: Icon,
  iconBg,
  change,
  changeLabel,
  subtitle,
}) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs sm:text-sm font-medium text-slate-500">
          {title}
        </span>
        <div className={`p-2 sm:p-2.5 rounded-xl ${iconBg}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
      </div>
      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">
        {value}
      </p>
      <div className="mt-2 flex items-center gap-1 flex-wrap">
        {change !== undefined && (
          <div
            className={`flex items-center gap-0.5 ${isPositive ? "text-emerald-600" : "text-red-500"}`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span className="text-xs sm:text-sm font-medium">
              {isPositive ? "+" : ""}
              {change}%
            </span>
          </div>
        )}
        {changeLabel && (
          <span className="text-xs sm:text-sm text-slate-400 ml-1">
            {changeLabel}
          </span>
        )}
        {subtitle && (
          <span className="text-xs sm:text-sm text-slate-500">{subtitle}</span>
        )}
      </div>
    </div>
  );
};

// Chart Card Component
const ChartCard = ({ title, icon: Icon, children, className = "" }) => (
  <div
    className={`bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm ${className}`}
  >
    <div className="flex items-center gap-2 mb-4 sm:mb-6">
      <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h2 className="text-sm sm:text-base font-semibold text-slate-800">
        {title}
      </h2>
    </div>
    {children}
  </div>
);

// Mini Stat Card
const MiniStatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm text-center">
    <div className="flex items-center justify-center mb-2">
      <div className="p-1.5 sm:p-2 bg-violet-100 rounded-lg">
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-600" />
      </div>
    </div>
    <p className="text-[10px] sm:text-xs text-slate-500 mb-1">{title}</p>
    <p className="text-base sm:text-lg font-bold text-slate-800">{value}</p>
  </div>
);

const Analytics = () => {
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useAnalyticsStats();

  const {
    data: recentVisitsData,
    isLoading: recentLoading,
    refetch: refetchRecent,
  } = useRecentVisits(10);

  const {
    data: dailyVisitsData,
    isLoading: dailyLoading,
    refetch: refetchDaily,
  } = useDailyVisits(7);

  const stats = statsData?.data || null;
  const recentVisits = recentVisitsData?.data || [];
  const dailyVisits = dailyVisitsData?.data || [];

  const isLoading = statsLoading || recentLoading || dailyLoading;
  const isError = statsError;

  const refetch = () => {
    refetchStats();
    refetchRecent();
    refetchDaily();
  };

  // Prepare data
  const deviceData =
    stats?.deviceStats?.map((device) => ({
      name: device._id || "Unknown",
      value: device.count,
      fill:
        device._id === "mobile"
          ? "#8B5CF6"
          : device._id === "desktop"
            ? "#10B981"
            : "#F59E0B",
    })) || [];

  const countryData =
    stats?.topCountries?.slice(0, 5).map((country, index) => ({
      name: country._id,
      visits: country.count,
      fill:
        ["#8B5CF6", "#A855F7", "#C084FC", "#D8B4FE", "#EDE9FE"][index] ||
        "#6B7280",
    })) || [];

  const pageData =
    stats?.topPages?.slice(0, 6).map((page) => ({
      name: page._id.length > 15 ? page._id.substring(0, 15) + "..." : page._id,
      fullName: page._id,
      visits: page.count,
    })) || [];

  const dailyVisitsChartData = dailyVisits.map((item) => ({
    day: new Date(item._id).toLocaleDateString("en-US", { weekday: "short" }),
    visits: item.visits,
  }));

  const formattedRecentVisits = recentVisits?.slice(0, 10).map((visit) => ({
    ...visit,
    formattedTime: new Date(visit.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    formattedDate: new Date(visit.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  const calculateChange = () => {
    if (stats?.todayVisits && stats?.totalVisits) {
      const avgDaily = stats.totalVisits / 7;
      return (((stats.todayVisits - avgDaily) / avgDaily) * 100).toFixed(1);
    }
    return "0";
  };

  const percentageChange = parseFloat(calculateChange());

  const getFlagEmoji = (countryName) => {
    const flags = {
      India: "🇮🇳",
      "United States": "🇺🇸",
      "United Kingdom": "🇬🇧",
      Germany: "🇩🇪",
      France: "🇫🇷",
      Canada: "🇨🇦",
      Australia: "🇦🇺",
      Japan: "🇯🇵",
      Singapore: "🇸🇬",
    };
    return flags[countryName] || "🌍";
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            Loading Analytics...
          </h3>
          <p className="text-slate-500 mt-1">Fetching your data</p>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Error Loading Analytics
          </h3>
          <p className="text-slate-500 mb-6">
            Unable to fetch analytics data. Please try again.
          </p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">
            Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {stats?.lastUpdated
              ? `Updated: ${new Date(stats.lastUpdated).toLocaleString()}`
              : "Real-time visitor insights"}
          </p>
        </div>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden xs:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Visits"
          value={stats?.totalVisits?.toLocaleString() || "0"}
          icon={Eye}
          iconBg="bg-gradient-to-br from-violet-500 to-purple-600"
          change={percentageChange}
          changeLabel="vs avg"
        />
        <StatCard
          title="Today"
          value={stats?.todayVisits?.toLocaleString() || "0"}
          icon={Activity}
          iconBg="bg-gradient-to-br from-emerald-500 to-teal-600"
          subtitle={new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        />
        <StatCard
          title="Unique Users"
          value={stats?.uniqueUsers?.toLocaleString() || "0"}
          icon={Users}
          iconBg="bg-gradient-to-br from-blue-500 to-cyan-600"
          subtitle="All sessions"
        />
        <StatCard
          title="Top Country"
          value={countryData[0]?.name || "N/A"}
          icon={Globe}
          iconBg="bg-gradient-to-br from-amber-500 to-orange-600"
          subtitle={`${countryData[0]?.visits?.toLocaleString() || 0} visits`}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Daily Visits Trend */}
        <ChartCard title="Daily Visits" icon={TrendingUp}>
          <div className="h-48 sm:h-64">
            {dailyVisitsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyVisitsChartData}>
                  <defs>
                    <linearGradient
                      id="colorVisits"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E2E8F0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 11 }}
                    width={35}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stroke="#8B5CF6"
                    strokeWidth={2.5}
                    fill="url(#colorVisits)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No visit data available" />
            )}
          </div>
        </ChartCard>

        {/* Device Distribution */}
        <ChartCard title="Device Distribution" icon={Smartphone}>
          <div className="h-48 sm:h-64">
            {deviceData.length > 0 ? (
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius="50%"
                        outerRadius="80%"
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-2 sm:mt-4">
                  {deviceData.map((device, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 sm:gap-2"
                    >
                      <div
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                        style={{ backgroundColor: device.fill }}
                      />
                      <span className="text-xs sm:text-sm text-slate-600 capitalize">
                        {device.name}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">
                        {device.value?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState message="No device data available" />
            )}
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Pages */}
        <ChartCard title="Top Pages" icon={FileText}>
          <div className="h-48 sm:h-64">
            {pageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pageData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E2E8F0"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 10 }}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="visits" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No page data available" />
            )}
          </div>
        </ChartCard>

        {/* Top Countries */}
        <ChartCard title="Top Countries" icon={MapPin}>
          <div className="space-y-3 sm:space-y-4 max-h-48 sm:max-h-64 overflow-y-auto">
            {countryData.length > 0 ? (
              countryData.map((country, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 flex items-center justify-center text-base sm:text-lg shrink-0">
                    {getFlagEmoji(country.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                        {country.name}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-600 ml-2">
                        {country.visits?.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 sm:h-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(country.visits / (countryData[0]?.visits || 1)) * 100}%`,
                          backgroundColor: country.fill,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState message="No country data available" />
            )}
          </div>
        </ChartCard>
      </div>

      {/* Recent Visits Table */}
      <ChartCard title="Recent Visits" icon={Clock}>
        <div className="overflow-x-auto -mx-4 sm:-mx-5">
          <div className="min-w-[500px] px-4 sm:px-5">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="text-left py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="text-left py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Device
                  </th>
                </tr>
              </thead>
              <tbody>
                {formattedRecentVisits && formattedRecentVisits.length > 0 ? (
                  formattedRecentVisits.map((visit, index) => (
                    <tr
                      key={visit._id || index}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <span className="text-[10px] sm:text-xs font-mono text-slate-600">
                            {visit.visitorId?.substring(0, 6)}...
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <span className="text-xs sm:text-sm text-slate-700 truncate block max-w-[120px] sm:max-w-[200px]">
                          {visit.page}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-slate-800">
                            {visit.formattedTime}
                          </p>
                          <p className="text-[10px] sm:text-xs text-slate-400">
                            {visit.formattedDate}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {visit.device === "mobile" ? (
                            <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-500" />
                          ) : visit.device === "desktop" ? (
                            <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                          ) : (
                            <Tablet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                          )}
                          <span className="text-xs sm:text-sm text-slate-600 capitalize">
                            {visit.device || "Unknown"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <EmptyState message="No recent visits" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </ChartCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <MiniStatCard
          title="Avg. Session"
          value={stats?.avgSessionDuration || "0m 0s"}
          icon={Timer}
        />
        <MiniStatCard
          title="Bounce Rate"
          value={stats?.bounceRate || "0%"}
          icon={MousePointer}
        />
        <MiniStatCard
          title="Pages/Session"
          value={stats?.pagesPerSession || "0"}
          icon={FileText}
        />
        <MiniStatCard
          title="New Users"
          value={stats?.newUsersPercentage || "0%"}
          icon={Zap}
        />
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ message }) => (
  <div className="h-full flex flex-col items-center justify-center text-center py-8">
    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
      <BarChart3 className="w-6 h-6 text-slate-400" />
    </div>
    <p className="text-sm text-slate-500">{message}</p>
  </div>
);

export default Analytics;
