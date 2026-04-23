import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
  Sparkles,
  Command,
  Shield,
  ExternalLink,
  Clock,
  XCircle,
  Check,
} from 'lucide-react';
import { useLogout } from "../../hooks/useLogout";
import { useAdminProfile } from "../../api/hooks/useAdmin";

const Navbar = ({ title, onMenuClick }) => {
  const navigate = useNavigate();
  const logout = useLogout();
  
  const { 
    data: admin, 
    isLoading: profileLoading,
  } = useAdminProfile();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchInputRef = useRef(null);

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      // Simulated notifications for demo
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    // Keyboard shortcut for search
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleLogout = () => {
    logout({
      redirectTo: "/login",
      preserveTheme: true,
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getUserInitials = () => {
    if (admin?.fullName) {
      return admin.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (admin?.name) {
      return admin.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (admin?.email) {
      return admin.email[0].toUpperCase();
    }
    return 'A';
  };

  const getDisplayName = () => {
    if (admin?.fullName) return admin.fullName;
    if (admin?.name) return admin.name;
    if (admin?.email) return admin.email.split('@')[0];
    return 'Admin';
  };

  const getDisplayEmail = () => {
    return admin?.email || 'admin@mozno.com';
  };

  const getFirstName = () => {
    return getDisplayName().split(' ')[0];
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getNotificationConfig = (type) => {
    switch (type) {
      case 'success': 
        return { 
          icon: CheckCircle, 
          bg: 'bg-emerald-100', 
          iconColor: 'text-emerald-600',
          border: 'border-emerald-200'
        };
      case 'error': 
        return { 
          icon: XCircle, 
          bg: 'bg-red-100', 
          iconColor: 'text-red-600',
          border: 'border-red-200'
        };
      case 'warning': 
        return { 
          icon: AlertCircle, 
          bg: 'bg-amber-100', 
          iconColor: 'text-amber-600',
          border: 'border-amber-200'
        };
      default: 
        return { 
          icon: Info, 
          bg: 'bg-blue-100', 
          iconColor: 'text-blue-600',
          border: 'border-blue-200'
        };
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Left Section */}
            <div className="flex items-center gap-4 min-w-0">
              {/* Mobile Menu Button */}
              {onMenuClick && (
                <button
                  onClick={onMenuClick}
                  className="lg:hidden p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5 text-slate-700" />
                </button>
              )}
              
              {/* Page Title & Greeting */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
                    {title || 'Dashboard'}
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Pro
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 hidden sm:flex items-center gap-1">
                  {profileLoading ? (
                    <span className="inline-block w-32 h-4 bg-slate-100 rounded-lg animate-pulse" />
                  ) : (
                    <>
                      {getGreeting()}, <span className="font-medium text-slate-700">{getFirstName()}</span>
                      <span className="text-slate-300 mx-1">•</span>
                      <span className="text-slate-400">Let's make today productive</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Search - Desktop */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`
                  hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl
                  bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300
                  transition-all duration-200 group
                `}
              >
                <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                <span className="text-sm text-slate-500">Search...</span>
                <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <Command className="w-3 h-3" />
                  K
                </kbd>
              </button>

              {/* Search - Mobile */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all active:scale-95"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-slate-600" />
              </button>

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`
                    relative p-2.5 rounded-xl transition-all active:scale-95
                    ${showNotifications 
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25' 
                      : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600'
                    }
                  `}
                  aria-label="Notifications"
                >
                  {notificationsLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                    {/* Header */}
                    <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                          <Bell className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">Notifications</h3>
                          <p className="text-xs text-slate-500">{unreadCount} unread</p>
                        </div>
                      </div>
                      {notifications.length > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="max-h-80 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="py-12 text-center">
                          <Loader2 className="w-8 h-8 text-violet-500 mx-auto animate-spin" />
                          <p className="text-sm text-slate-500 mt-2">Loading notifications...</p>
                        </div>
                      ) : notifications.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {notifications.map((notif) => {
                            const config = getNotificationConfig(notif.type);
                            const IconComponent = config.icon;
                            
                            return (
                              <div
                                key={notif.id}
                                className={`
                                  px-5 py-4 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer
                                  ${!notif.read ? 'bg-violet-50/30' : ''}
                                `}
                              >
                                <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                                  <IconComponent className={`w-4 h-4 ${config.iconColor}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-slate-700 line-clamp-2 font-medium">{notif.message}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span className="text-xs text-slate-400">{formatTime(notif.createdAt)}</span>
                                  </div>
                                </div>
                                {!notif.read && (
                                  <span className="w-2.5 h-2.5 bg-violet-500 rounded-full mt-1.5 animate-pulse" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-12 text-center px-6">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-slate-400" />
                          </div>
                          <h4 className="text-sm font-semibold text-slate-700">All caught up!</h4>
                          <p className="text-xs text-slate-500 mt-1">No new notifications at the moment</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Footer */}
                    <div className="p-3 border-t border-slate-200 bg-slate-50">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/notifications');
                        }}
                        className="w-full py-2.5 text-sm font-medium text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        View all notifications
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-8 bg-slate-200" />

              {/* Profile */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  disabled={profileLoading}
                  className={`
                    flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl
                    hover:bg-slate-100 transition-all duration-200 group
                    ${showDropdown ? 'bg-slate-100' : ''}
                  `}
                >
                  {/* Avatar */}
                  <div className="relative">
                    {profileLoading ? (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-200 animate-pulse" />
                    ) : (
                      <>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
                          <span className="text-white font-semibold text-sm">
                            {getUserInitials()}
                          </span>
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* User Info - Desktop */}
                  <div className="hidden lg:block text-left">
                    {profileLoading ? (
                      <div className="space-y-1.5">
                        <div className="w-20 h-4 bg-slate-200 rounded-lg animate-pulse" />
                        <div className="w-16 h-3 bg-slate-100 rounded-lg animate-pulse" />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-[120px] capitalize">
                          {admin?.role || 'Administrator'}
                        </p>
                      </>
                    )}
                  </div>
                  
                  <ChevronDown className={`
                    w-4 h-4 text-slate-400 hidden sm:block transition-transform duration-200
                    ${showDropdown ? 'rotate-180' : ''}
                  `} />
                </button>

                {/* Profile Dropdown */}
                {showDropdown && !profileLoading && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                    {/* User Info Header */}
                    <div className="p-5 bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                          <span className="text-white font-bold text-lg">
                            {getUserInitials()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate">
                            {getDisplayName()}
                          </p>
                          <p className="text-xs text-white/70 truncate">
                            {getDisplayEmail()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Role Badge */}
                      {admin?.role && (
                        <div className="flex items-center gap-2 mt-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white/20 backdrop-blur-sm rounded-lg capitalize">
                            <Shield className="w-3 h-3" />
                            {admin.role}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-emerald-400/20 text-emerald-100 rounded-md">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            Online
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate('/settings');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 rounded-xl hover:bg-slate-100 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="text-left">
                          <span className="font-medium block">My Profile</span>
                          <span className="text-xs text-slate-500">View and edit your profile</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate('/settings');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 rounded-xl hover:bg-slate-100 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
                          <Settings className="w-4 h-4 text-slate-500 group-hover:rotate-90 transition-transform duration-300" />
                        </div>
                        <div className="text-left">
                          <span className="font-medium block">Settings</span>
                          <span className="text-xs text-slate-500">Manage your preferences</span>
                        </div>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                          <LogOut className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="text-left">
                          <span className="font-medium block">Sign out</span>
                          <span className="text-xs text-red-400">Log out of your account</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          />
          
          {/* Search Container */}
          <div className="relative max-w-2xl mx-auto mt-20 sm:mt-32 px-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                <Search className="w-5 h-5 text-violet-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search anything..."
                  className="flex-1 text-lg text-slate-800 placeholder:text-slate-400 outline-none"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
                  Quick Actions
                </p>
                <div className="space-y-1">
                  {[
                    { icon: User, label: 'Go to Users', shortcut: 'U' },
                    { icon: Settings, label: 'Open Settings', shortcut: 'S' },
                    { icon: Bell, label: 'View Notifications', shortcut: 'N' },
                  ].map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setIsSearchOpen(false);
                        // Navigate based on action
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                          <action.icon className="w-4 h-4 text-slate-500 group-hover:text-violet-600" />
                        </div>
                        <span className="text-sm text-slate-700">{action.label}</span>
                      </div>
                      <kbd className="px-2 py-1 text-[10px] font-medium text-slate-400 bg-slate-100 rounded-md">
                        {action.shortcut}
                      </kbd>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200">↵</kbd>
                    to select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200">esc</kbd>
                    to close
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Powered by <span className="font-semibold text-violet-600">Mozno</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;