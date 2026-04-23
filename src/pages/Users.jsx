import React, { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  Key,
  MoreVertical,
  Loader2,
  AlertCircle,
  RefreshCw,
  Shield,
  UserCheck,
  UserX,
  Users as UsersIcon,
  Sparkles,
  X,
  Clock,
  CheckCircle,
  Filter,
} from "lucide-react";
import { useAdmins, useAdminActions } from "../api/hooks/useAdmin";

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const {
    data: adminsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdmins({ search: searchQuery });

  const {
    createAdmin,
    updateAdmin,
    deleteAdmin,
    toggleStatus,
    resetPassword,
    isLoading: isActionsLoading,
  } = useAdminActions();

  const users = adminsData?.data || [];

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "admin",
    password: "",
  });

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "superadmin", label: "Super Admin" },
  ];

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    superadmins: users.filter((u) => u.role === "superadmin").length,
  };

  const getStatusConfig = (status) => {
    if (status === "active") {
      return {
        text: "Active",
        bg: "bg-emerald-50",
        textColor: "text-emerald-700",
        ring: "ring-1 ring-emerald-200",
        dot: "bg-emerald-500",
      };
    }
    return {
      text: "Inactive",
      bg: "bg-slate-100",
      textColor: "text-slate-600",
      ring: "ring-1 ring-slate-200",
      dot: "bg-slate-400",
    };
  };

  const getRoleConfig = (role) => {
    if (role === "superadmin") {
      return {
        text: "Super Admin",
        bg: "bg-violet-50",
        textColor: "text-violet-700",
        ring: "ring-1 ring-violet-200",
        icon: Shield,
      };
    }
    return {
      text: "Admin",
      bg: "bg-blue-50",
      textColor: "text-blue-700",
      ring: "ring-1 ring-blue-200",
      icon: User,
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const handleAddUser = async () => {
    if (!newUser.firstName || !newUser.email || !newUser.password) {
      return;
    }

    try {
      await createAdmin(newUser);
      resetNewUserForm();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error creating admin:", error);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await updateAdmin({
        id: selectedUser._id || selectedUser.id,
        data: {
          firstName: selectedUser.firstName,
          lastName: selectedUser.lastName,
          email: selectedUser.email,
          phone: selectedUser.phone,
          role: selectedUser.role,
        },
      });
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating admin:", error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteAdmin(selectedUser._id || selectedUser.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    try {
      await resetPassword(selectedUser._id || selectedUser.id);
      setShowResetPasswordModal(false);
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  const handleToggleStatus = (user) => {
    toggleStatus(user._id || user.id);
    setActiveMenu(null);
  };

  const resetNewUserForm = () => {
    setNewUser({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "admin",
      password: "",
    });
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
          <h3 className="text-lg font-semibold text-slate-800">Loading users...</h3>
          <p className="text-slate-500 mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <Header stats={stats} onAddUser={() => setShowAddModal(true)} />
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 text-lg">Failed to load users</h3>
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
      <Header stats={stats} onAddUser={() => setShowAddModal(true)} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Users"
          value={stats.total}
          icon={UsersIcon}
          gradient="from-violet-500 to-purple-600"
          shadow="shadow-violet-500/20"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={UserCheck}
          gradient="from-emerald-500 to-teal-600"
          shadow="shadow-emerald-500/20"
        />
        <StatCard
          label="Inactive"
          value={stats.inactive}
          icon={UserX}
          gradient="from-slate-500 to-slate-700"
          shadow="shadow-slate-500/20"
        />
        <StatCard
          label="Super Admins"
          value={stats.superadmins}
          icon={Shield}
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
              placeholder="Search users by name or email..."
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
            {["all", "active", "inactive"].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                  statusFilter === filter
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter === "all" ? "All Users" : filter}
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
            {["all", "active", "inactive"].map((filter) => (
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

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">User</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Role</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Last Login</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Created</th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user, index) => {
                    const statusConfig = getStatusConfig(user.status);
                    const roleConfig = getRoleConfig(user.role);
                    const RoleIcon = roleConfig.icon;

                    return (
                      <tr
                        key={user._id || user.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.firstName}
                                  className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                                  <span className="text-white font-semibold">
                                    {getInitials(user.firstName, user.lastName)}
                                  </span>
                                </div>
                              )}
                              <span
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                  user.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                                }`}
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-slate-800">
                                {user.firstName} {user.lastName}
                              </h4>
                              <div className="flex items-center gap-1 text-sm text-slate-500 mt-0.5">
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[180px]">{user.email}</span>
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                  <Phone className="w-3 h-3" />
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${roleConfig.bg} ${roleConfig.textColor} ${roleConfig.ring}`}
                          >
                            <RoleIcon className="w-3.5 h-3.5" />
                            {roleConfig.text}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${statusConfig.bg} ${statusConfig.textColor} ${statusConfig.ring}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                            {statusConfig.text}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDateShort(user.lastLogin)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDateShort(user.createdAt)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditModal(true);
                              }}
                              className="p-2 rounded-lg hover:bg-violet-100 text-slate-400 hover:text-violet-600 transition-all"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowResetPasswordModal(true);
                              }}
                              className="p-2 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition-all"
                              title="Reset Password"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`p-2 rounded-lg transition-all ${
                                user.status === "active"
                                  ? "hover:bg-amber-100 text-slate-400 hover:text-amber-600"
                                  : "hover:bg-emerald-100 text-slate-400 hover:text-emerald-600"
                              }`}
                              title={user.status === "active" ? "Deactivate" : "Activate"}
                            >
                              {user.status === "active" ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
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
              {filteredUsers.map((user, index) => {
                const statusConfig = getStatusConfig(user.status);
                const roleConfig = getRoleConfig(user.role);
                const RoleIcon = roleConfig.icon;

                return (
                  <div
                    key={user._id || user.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.firstName}
                            className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <span className="text-white font-semibold text-lg">
                              {getInitials(user.firstName, user.lastName)}
                            </span>
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            user.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-slate-800">
                              {user.firstName} {user.lastName}
                            </h4>
                            <p className="text-sm text-slate-500 truncate">{user.email}</p>
                          </div>
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveMenu(activeMenu === user._id ? null : user._id)
                              }
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>

                            {activeMenu === user._id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setActiveMenu(null)}
                                />
                                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20">
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowEditModal(true);
                                      setActiveMenu(null);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 w-full"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit User
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowResetPasswordModal(true);
                                      setActiveMenu(null);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 w-full"
                                  >
                                    <Key className="w-4 h-4" />
                                    Reset Password
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleToggleStatus(user);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 w-full"
                                  >
                                    {user.status === "active" ? (
                                      <>
                                        <EyeOff className="w-4 h-4" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="w-4 h-4" />
                                        Activate
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowDeleteModal(true);
                                      setActiveMenu(null);
                                    }}
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

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${roleConfig.bg} ${roleConfig.textColor} ${roleConfig.ring}`}
                          >
                            <RoleIcon className="w-3 h-3" />
                            {roleConfig.text}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${statusConfig.bg} ${statusConfig.textColor} ${statusConfig.ring}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                            {statusConfig.text}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            Last login: {formatDateShort(user.lastLogin)}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState
            searchQuery={searchQuery}
            onClear={() => setSearchQuery("")}
            onAddUser={() => setShowAddModal(true)}
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-700">{filteredUsers.length}</span> of{" "}
          <span className="font-medium text-slate-700">{users.length}</span> users
          {searchQuery && (
            <span>
              {" "}
              matching "<span className="font-medium text-violet-600">{searchQuery}</span>"
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

      {/* Add User Modal */}
      {showAddModal && (
        <Modal
          title="Add New User"
          subtitle="Create a new admin account"
          icon={Plus}
          iconGradient="from-violet-500 to-purple-600"
          onClose={() => {
            setShowAddModal(false);
            resetNewUserForm();
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="First Name"
                value={newUser.firstName}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                placeholder="First name"
                icon={User}
                required
              />
              <InputField
                label="Last Name"
                value={newUser.lastName}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                placeholder="Last name"
                icon={User}
              />
            </div>
            <InputField
              label="Email Address"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="user@example.com"
              icon={Mail}
              required
            />
            <InputField
              label="Phone Number"
              type="tel"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              placeholder="+91 9876543210"
              icon={Phone}
            />
            <SelectField
              label="Role"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              options={roleOptions}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Key className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Create a strong password"
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={() => {
                setShowAddModal(false);
                resetNewUserForm();
              }}
              className="flex-1 px-5 py-3 text-slate-700 bg-slate-100 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddUser}
              disabled={isActionsLoading || !newUser.firstName || !newUser.email || !newUser.password}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isActionsLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create User"
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <Modal
          title="Edit User"
          subtitle="Update user details"
          icon={Edit}
          iconGradient="from-blue-500 to-indigo-600"
          onClose={() => setShowEditModal(false)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="First Name"
                value={selectedUser.firstName}
                onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                placeholder="First name"
                icon={User}
              />
              <InputField
                label="Last Name"
                value={selectedUser.lastName}
                onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                placeholder="Last name"
                icon={User}
              />
            </div>
            <InputField
              label="Email Address"
              type="email"
              value={selectedUser.email}
              onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
              placeholder="user@example.com"
              icon={Mail}
            />
            <InputField
              label="Phone Number"
              type="tel"
              value={selectedUser.phone || ""}
              onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
              placeholder="+91 9876543210"
              icon={Phone}
            />
            <SelectField
              label="Role"
              value={selectedUser.role}
              onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
              options={roleOptions}
            />
          </div>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={() => setShowEditModal(false)}
              className="flex-1 px-5 py-3 text-slate-700 bg-slate-100 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateUser}
              disabled={isActionsLoading}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isActionsLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <ConfirmModal
          title="Delete User"
          message={`Are you sure you want to delete "${selectedUser.firstName} ${selectedUser.lastName}"? This action cannot be undone.`}
          icon={Trash2}
          iconBg="bg-red-100"
          iconColor="text-red-600"
          confirmText="Delete User"
          confirmGradient="from-red-500 to-rose-600"
          isLoading={isActionsLoading}
          onConfirm={handleDeleteUser}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <ConfirmModal
          title="Reset Password"
          message={`Send a password reset email to ${selectedUser.email}?`}
          icon={Key}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          confirmText="Send Reset Link"
          confirmGradient="from-blue-500 to-indigo-600"
          isLoading={isActionsLoading}
          onConfirm={handleResetPassword}
          onCancel={() => setShowResetPasswordModal(false)}
        />
      )}

      {/* Click outside to close menu */}
      {activeMenu && <div className="fixed inset-0 z-0" onClick={() => setActiveMenu(null)} />}
    </div>
  );
};

// Header Component
const Header = ({ stats, onAddUser }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">User Management</h1>
      <p className="text-slate-500 mt-1">
        Manage admin accounts and permissions
      </p>
    </div>
    <button
      onClick={onAddUser}
      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98]"
    >
      <Plus className="w-5 h-5" />
      <span>Add User</span>
    </button>
  </div>
);

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, gradient, shadow }) => (
  <div
    className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-2xl p-4 text-white ${shadow} shadow-lg`}
  >
    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div className="relative flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-white/80 text-xs font-medium truncate">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ searchQuery, onClear, onAddUser }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12">
    <div className="text-center max-w-md mx-auto">
      <div className="relative inline-block">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto">
          <UsersIcon className="w-10 h-10 text-violet-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mt-6">
        {searchQuery ? "No users found" : "No users yet"}
      </h3>
      <p className="text-slate-500 mt-2">
        {searchQuery
          ? "Try adjusting your search terms"
          : "Add your first admin user to get started"}
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
          <button
            onClick={onAddUser}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25"
          >
            <Plus className="w-5 h-5" />
            Add First User
          </button>
        )}
      </div>
    </div>
  </div>
);

// Modal Component
const Modal = ({ title, subtitle, icon: Icon, iconGradient, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">{children}</div>
    </div>
  </div>
);

// Confirm Modal Component
const ConfirmModal = ({
  title,
  message,
  icon: Icon,
  iconBg,
  iconColor,
  confirmText,
  confirmGradient,
  isLoading,
  onConfirm,
  onCancel,
}) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
      <div
        className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center mx-auto mb-4`}
      >
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 text-center mb-2">{title}</h3>
      <p className="text-slate-500 text-center mb-6">{message}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-5 py-3 text-slate-700 bg-slate-100 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`flex-1 px-5 py-3 bg-gradient-to-r ${confirmGradient} text-white rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            confirmText
          )}
        </button>
      </div>
    </div>
  </div>
);

// Input Field Component
const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  required,
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${Icon ? "pl-12" : "pl-4"} pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400`}
      />
    </div>
  </div>
);

// Select Field Component
const SelectField = ({ label, value, onChange, options, required }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-slate-800 appearance-none cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: "right 0.75rem center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "1.5em 1.5em",
        paddingRight: "2.5rem",
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default Users;