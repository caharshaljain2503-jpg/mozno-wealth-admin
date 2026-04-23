import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  User,
  Lock,
  Palette,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  Shield,
  Camera,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  RefreshCw,
  Settings as SettingsIcon,
  Mail,
  KeyRound,
} from 'lucide-react';

const Settings = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerificationPassword, setShowVerificationPassword] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [verificationPassword, setVerificationPassword] = useState('');
  const avatarInputRef = useRef(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockProfile = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'admin@mozno.in',
        avatar: '',
      };

      setProfile(mockProfile);
      setAvatarPreview(mockProfile.avatar);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Avatar size must be less than 2MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const triggerAvatarInput = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  const getInitials = () => {
    const first = profile.firstName?.charAt(0) || '';
    const last = profile.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'AD';
  };

  const handleSaveProfile = async () => {
    if (!verificationPassword) {
      alert('Please enter your current password to save changes');
      return;
    }

    try {
      setSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('Profile saved:', {
        ...profile,
        avatar: avatarFile ? 'New avatar uploaded' : 'No avatar change',
        verificationPassword: '***',
      });

      alert('Profile updated successfully');
      setVerificationPassword('');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }

    try {
      setChangingPassword(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('Password changed successfully');
      alert('Password changed successfully');

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      if (verificationPassword === passwordData.currentPassword) {
        setVerificationPassword('');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('An error occurred while changing password');
    } finally {
      setChangingPassword(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Medium', color: 'bg-amber-500' };
    return { strength, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full animate-bounce" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Loading settings...</h3>
          <p className="text-slate-500 mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        type="file"
        ref={avatarInputRef}
        className="hidden"
        accept=".jpg,.jpeg,.png,.gif,.webp"
        onChange={handleAvatarChange}
      />

      {/* Header */}
      <Header />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <QuickStatCard
          label="Profile"
          value="Active"
          icon={User}
          gradient="from-violet-500 to-purple-600"
          shadow="shadow-violet-500/20"
        />
        <QuickStatCard
          label="Security"
          value="Strong"
          icon={Shield}
          gradient="from-emerald-500 to-teal-600"
          shadow="shadow-emerald-500/20"
        />
        <QuickStatCard
          label="Theme"
          value={theme.charAt(0).toUpperCase() + theme.slice(1)}
          icon={Palette}
          gradient="from-amber-500 to-orange-600"
          shadow="shadow-amber-500/20"
        />
        <QuickStatCard
          label="Status"
          value="Online"
          icon={CheckCircle}
          gradient="from-blue-500 to-indigo-600"
          shadow="shadow-blue-500/20"
        />
      </div>

      {/* Section Navigation - Mobile */}
      <div className="lg:hidden bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
        <div className="flex gap-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'appearance', label: 'Theme', icon: Palette },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <section.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile */}
        <div className={`lg:col-span-2 space-y-6 ${activeSection !== 'profile' && activeSection !== 'security' ? 'hidden lg:block' : ''}`}>
          {/* Profile Settings */}
          <div className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm ${activeSection !== 'profile' ? 'hidden lg:block' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Profile Information</h3>
                <p className="text-sm text-slate-500">Update your personal details</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl">
                <div className="relative group">
                  {avatarPreview ? (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                      <span className="text-white text-2xl font-bold">{getInitials()}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={triggerAvatarInput}
                    className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="font-semibold text-slate-800">Profile Photo</h4>
                  <p className="text-sm text-slate-500 mt-1">JPG, PNG, GIF or WebP. Max 2MB</p>
                  <button
                    onClick={triggerAvatarInput}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </button>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleProfileChange}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                      placeholder="Enter first name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={profile.lastName || ''}
                      onChange={handleProfileChange}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {/* Verification Password */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-800">Password Verification</h4>
                    <p className="text-sm text-amber-600">Enter your current password to save changes</p>
                  </div>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showVerificationPassword ? 'text' : 'password'}
                    value={verificationPassword}
                    onChange={(e) => setVerificationPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-slate-800 placeholder:text-slate-400"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVerificationPassword(!showVerificationPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showVerificationPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !verificationPassword}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm ${activeSection !== 'security' ? 'hidden lg:block' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Security Settings</h3>
                <p className="text-sm text-slate-500">Manage your password and security</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {passwordData.newPassword && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">Password Strength</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.label === 'Weak' ? 'text-red-600' :
                        passwordStrength.label === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pl-12 pr-12 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 ${
                      passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword
                        ? 'border-red-300 focus:ring-red-500/30 focus:border-red-500'
                        : passwordData.confirmPassword && passwordData.confirmPassword === passwordData.newPassword
                        ? 'border-emerald-300 focus:ring-emerald-500/30 focus:border-emerald-500'
                        : 'border-slate-200 focus:ring-violet-500/30 focus:border-violet-500'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Passwords do not match
                  </p>
                )}
                {passwordData.confirmPassword && passwordData.confirmPassword === passwordData.newPassword && (
                  <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Update Password Button */}
              <div className="pt-2">
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Appearance */}
        <div className={`space-y-6 ${activeSection !== 'appearance' ? 'hidden lg:block' : ''}`}>
          {/* Appearance Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Appearance</h3>
                <p className="text-sm text-slate-500">Customize your interface</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700 mb-4">Select Theme</label>

              {/* Theme Options */}
              <div className="space-y-3">
                <ThemeOption
                  id="light"
                  label="Light Mode"
                  description="Clean and bright interface"
                  icon={Sun}
                  isSelected={theme === 'light'}
                  onClick={() => setTheme('light')}
                  gradient="from-amber-400 to-yellow-500"
                />

                <ThemeOption
                  id="dark"
                  label="Dark Mode"
                  description="Easy on the eyes"
                  icon={Moon}
                  isSelected={theme === 'dark'}
                  onClick={() => setTheme('dark')}
                  gradient="from-slate-700 to-slate-900"
                />

                <ThemeOption
                  id="system"
                  label="System Default"
                  description="Match your device settings"
                  icon={Monitor}
                  isSelected={theme === 'system'}
                  onClick={() => setTheme('system')}
                  gradient="from-violet-500 to-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Account Info Card */}
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-violet-500/25">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold">Admin Account</h4>
                <p className="text-white/70 text-sm">Full access privileges</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-t border-white/20">
                <span className="text-white/70">Account Type</span>
                <span className="font-medium">Administrator</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-white/20">
                <span className="text-white/70">Status</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-white/20">
                <span className="text-white/70">Last Login</span>
                <span className="font-medium">Today</span>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Need Help?</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Contact support if you need assistance with your account settings.
                </p>
                <button className="mt-3 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors">
                  Contact Support →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Header Component
const Header = () => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Settings</h1>
      <p className="text-slate-500 mt-1">Manage your account and preferences</p>
    </div>
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium ring-1 ring-emerald-200">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        All systems operational
      </span>
    </div>
  </div>
);

// Quick Stat Card Component
const QuickStatCard = ({ label, value, icon: Icon, gradient, shadow }) => (
  <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-2xl p-4 text-white ${shadow} shadow-lg`}>
    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div className="relative flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-white/80 text-xs font-medium truncate">{label}</p>
        <p className="text-lg font-bold truncate">{value}</p>
      </div>
    </div>
  </div>
);

// Theme Option Component
const ThemeOption = ({ id, label, description, icon: Icon, isSelected, onClick, gradient }) => (
  <button
    onClick={onClick}
    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
      isSelected
        ? 'border-violet-500 bg-violet-50 ring-4 ring-violet-500/10'
        : 'border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/50'
    }`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${
        isSelected ? 'shadow-violet-500/30' : 'shadow-slate-200'
      }`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-800">{label}</h4>
          {isSelected && (
            <span className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
  </button>
);

export default Settings;