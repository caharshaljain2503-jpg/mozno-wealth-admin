import React, { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Search,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Bell,
  Users2,
  Stars,
  HelpCircle,
  Loader2,
  GraduationCap,
  Computer,
  Sparkles,
  ChevronRight,
  Shield,
  Handshake,
  Phone,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLogout } from "../../hooks/useLogout";
import { useAdminProfile } from "../../api/hooks/useAdmin";

const Sidebar = ({ isOpen, setIsOpen, isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const logout = useLogout();
  const [hoveredItem, setHoveredItem] = useState(null);

  const {
    data: admin,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useAdminProfile();

  const getActiveItem = () => {
    const path = location.pathname.split("/")[1];
    if (path === "") return "dashboard";
    return path;
  };

  const handleLogout = () => {
    logout({
      redirectTo: "/login",
      preserveTheme: true,
    });
  };

  const getUserInitials = () => {
    if (admin?.fullName) {
      return admin.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (admin?.name) {
      return admin.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (admin?.email) {
      return admin.email[0].toUpperCase();
    }
    return "A";
  };

  const getDisplayName = () => {
    if (admin?.fullName) return admin.fullName;
    if (admin?.name) return admin.name;
    if (admin?.email) return admin.email.split("@")[0];
    return "Admin User";
  };

  const getDisplayEmail = () => {
    return admin?.email || "admin@mozno.com";
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      gradient: "from-violet-500 to-purple-600",
    },
    {
      id: "blogs",
      label: "Blogs",
      icon: FileText,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      gradient: "from-emerald-500 to-teal-600",
    },
    // {
    //   id: "seo",
    //   label: "SEO",
    //   icon: Search,
    //   gradient: "from-amber-500 to-orange-600",
    // },
    {
      id: "users",
      label: "Users",
      icon: Users,
      gradient: "from-pink-500 to-rose-600",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      id: "leads",
      label: "Leads",
      icon: Users2,
      gradient: "from-lime-500 to-green-600",
    },
    {
      id: "testimonials",
      label: "Testimonials",
      icon: Stars,
      gradient: "from-yellow-500 to-amber-600",
    },
    {
      id: "faqs",
      label: "FAQs",
      icon: HelpCircle,
      gradient: "from-fuchsia-500 to-pink-600",
    },
    {
      id: "about-content",
      label: "About Content",
      icon: Settings,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      id: "contact-settings",
      label: "Contact Settings",
      icon: Phone,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      id: "social-media",
      label: "Social Media",
      icon: Sparkles,
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      id: "partner-logos",
      label: "Partner logos",
      icon: Handshake,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      id: "jobs",
      label: "Jobs",
      icon: GraduationCap,
      gradient: "from-indigo-500 to-violet-600",
    },
    {
      id: "application",
      label: "Applications",
      icon: Computer,
      gradient: "from-slate-500 to-slate-700",
    },
  ];

  const NavItem = ({ item, isActive }) => {
    const Icon = item.icon;
    const isHovered = hoveredItem === item.id;

    return (
      <Link
        to={`/${item.id === "dashboard" ? "" : item.id}`}
        onClick={() => setIsMobileOpen(false)}
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
        className={`
          group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300
          ${
            isActive
              ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }
          ${!isOpen && "justify-center px-2"}
        `}
        style={
          isActive
            ? { boxShadow: `0 4px 15px -3px rgba(139, 92, 246, 0.3)` }
            : {}
        }
      >
        <div
          className={`
          flex-shrink-0 transition-all duration-300
          ${isActive ? "" : "group-hover:scale-110"}
        `}
        >
          <Icon
            size={20}
            strokeWidth={isActive ? 2 : 1.5}
            className={`transition-all ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"}`}
          />
        </div>

        {isOpen && (
          <span
            className={`text-sm transition-all ${isActive ? "font-semibold" : "font-medium"}`}
          >
            {item.label}
          </span>
        )}

        {/* Tooltip for collapsed state */}
        {!isOpen && (
          <div
            className={`
            absolute left-full ml-3 px-3 py-2
            bg-gradient-to-r ${item.gradient} text-white text-sm font-medium rounded-xl
            opacity-0 invisible group-hover:opacity-100 group-hover:visible
            transition-all duration-200 whitespace-nowrap z-50
            shadow-xl
            flex items-center gap-2
          `}
          >
            {item.label}
            <div
              className={`absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-violet-500`}
            />
          </div>
        )}

        {/* Active indicator dot */}
        {isActive && isOpen && (
          <div className="absolute right-3 w-2 h-2 bg-white/80 rounded-full animate-pulse" />
        )}

        {/* Hover effect */}
        {!isActive && isHovered && isOpen && (
          <div className="absolute right-3">
            <ChevronRight size={14} className="text-slate-400" />
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isOpen ? "w-72" : "w-20"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          fixed lg:relative h-screen
          bg-white border-r border-slate-200
          transition-all duration-300 ease-out z-50
          flex flex-col
          shadow-xl lg:shadow-none
        `}
      >
        {/* Header */}
        <div
          className={`
          h-16 flex items-center justify-between
          border-b border-slate-100
          ${isOpen ? "px-5" : "px-3 justify-center"}
        `}
        >
          <Link
            to="/"
            className={`flex items-center gap-3 ${!isOpen && "justify-center"}`}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30">
                <img
                  src="/logo.png"
                  alt="Mozno"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            {isOpen && (
              <div>
                <span className="text-lg font-bold text-slate-800 block leading-tight">
                  Mozno
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Admin Panel
                </span>
              </div>
            )}
          </Link>

          {/* Close Button - Mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} className="text-slate-500" />
          </button>

          {/* Toggle Button - Desktop */}
          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="hidden lg:flex p-2 rounded-xl hover:bg-slate-100 transition-colors group"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft
                size={18}
                className="text-slate-400 group-hover:text-slate-600 transition-colors"
              />
            </button>
          )}
        </div>

        {/* Expand Button - Collapsed State */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="hidden lg:flex mx-auto mt-4 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all group"
            aria-label="Expand sidebar"
          >
            <Menu
              size={18}
              className="text-slate-500 group-hover:text-slate-700 transition-colors"
            />
          </button>
        )}

        {/* Navigation */}
        <nav
          className={`
          flex-1 overflow-y-auto overflow-x-hidden
          ${isOpen ? "p-4" : "p-2"}
          space-y-1
          scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent
        `}
        >
          {/* Section Label */}
          {isOpen && (
            <div className="flex items-center gap-2 px-3 py-2 mb-2">
              <div className="w-5 h-px bg-slate-200 flex-1" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Navigation
              </p>
              <div className="w-5 h-px bg-slate-200 flex-1" />
            </div>
          )}

          {menuItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={getActiveItem() === item.id}
            />
          ))}
        </nav>

        {/* Bottom Section */}
        <div className={`border-t border-slate-100 ${isOpen ? "p-4" : "p-2"}`}>
          {/* Section Label */}
          {isOpen && (
            <div className="flex items-center gap-2 px-3 py-2 mb-2">
              <div className="w-5 h-px bg-slate-200 flex-1" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                System
              </p>
              <div className="w-5 h-px bg-slate-200 flex-1" />
            </div>
          )}

          {/* Settings */}
          <Link
            to="/settings"
            onClick={() => setIsMobileOpen(false)}
            className={`
              group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-slate-600 hover:bg-slate-100 hover:text-slate-900
              transition-all duration-200
              ${!isOpen && "justify-center px-2"}
            `}
          >
            <Settings
              size={20}
              strokeWidth={1.5}
              className="text-slate-400 group-hover:text-slate-700 group-hover:rotate-90 transition-all duration-300"
            />
            {isOpen && <span className="text-sm font-medium">Settings</span>}

            {!isOpen && (
              <div
                className="
                absolute left-full ml-3 px-3 py-2
                bg-slate-800 text-white text-sm font-medium rounded-xl
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-200 whitespace-nowrap z-50
                shadow-xl
              "
              >
                Settings
              </div>
            )}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`
              group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-slate-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:text-red-600
              transition-all duration-200
              ${!isOpen && "justify-center px-2"}
            `}
          >
            <LogOut
              size={20}
              strokeWidth={1.5}
              className="text-slate-400 group-hover:text-red-500 transition-colors"
            />
            {isOpen && <span className="text-sm font-medium">Logout</span>}

            {!isOpen && (
              <div
                className="
                absolute left-full ml-3 px-3 py-2
                bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-medium rounded-xl
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-200 whitespace-nowrap z-50
                shadow-xl
              "
              >
                Logout
              </div>
            )}
          </button>

          {/* User Profile Card */}
          <div
            className={`
            mt-4 pt-4 border-t border-slate-100
            ${!isOpen && "flex justify-center"}
          `}
          >
            <Link
              to="/settings"
              className={`
                block p-3 rounded-2xl transition-all duration-200
                ${
                  isOpen
                    ? "bg-gradient-to-br from-slate-50 to-slate-100 hover:from-violet-50 hover:to-purple-50 border border-slate-200 hover:border-violet-200"
                    : ""
                }
              `}
            >
              <div
                className={`flex items-center gap-3 ${!isOpen && "justify-center"}`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {profileLoading ? (
                    <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center animate-pulse">
                      <Loader2
                        size={18}
                        className="text-slate-400 animate-spin"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                        <span className="text-white font-semibold text-sm">
                          {getUserInitials()}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      </div>
                    </>
                  )}
                </div>

                {/* User Info */}
                {isOpen && (
                  <div className="flex-1 min-w-0">
                    {profileLoading ? (
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-slate-200 rounded-lg animate-pulse" />
                        <div className="h-3 w-32 bg-slate-200 rounded-lg animate-pulse" />
                      </div>
                    ) : profileError ? (
                      <div>
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          Admin
                        </p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            refetchProfile();
                          }}
                          className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                        >
                          Tap to retry
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {getDisplayEmail()}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Collapsed Tooltip */}
                {!isOpen && !profileLoading && (
                  <div
                    className="
                    absolute left-full ml-3 px-3 py-2
                    bg-white text-sm rounded-xl border border-slate-200
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 whitespace-nowrap z-50
                    shadow-xl min-w-[160px]
                  "
                  >
                    <p className="font-semibold text-slate-800">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {getDisplayEmail()}
                    </p>
                  </div>
                )}
              </div>

              {/* Role Badge */}
              {isOpen && admin?.role && !profileLoading && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-700 rounded-lg capitalize ring-1 ring-violet-200">
                    <Shield size={12} />
                    {admin.role}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-emerald-50 text-emerald-600 rounded-md ring-1 ring-emerald-200">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Online
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
