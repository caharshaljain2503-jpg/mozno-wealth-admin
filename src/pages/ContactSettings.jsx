import React, { useState, useEffect } from 'react';
import {
  Save,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
} from 'lucide-react';
import { useSettings, useUpdateSettings, defaultSettings } from '../api/hooks/useSettings';

const ContactSettings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: savedSettings, isLoading, error, refetch } = useSettings();
  const updateSettings = useUpdateSettings({
    onSuccess: () => {
      setHasChanges(false);
    },
  });

  useEffect(() => {
    if (savedSettings) {
      setSettings(prev => ({
        ...prev,
        ...savedSettings,
        contactInfo: {
          ...prev.contactInfo,
          ...savedSettings.contactInfo,
        },
        socialLinks: {
          ...prev.socialLinks,
          ...savedSettings.socialLinks,
        },
      }));
    }
  }, [savedSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHasChanges(true);

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = () => {
    updateSettings.mutate(settings);
  };

  const placeholders = [
    '{{assessmentType}}',
    '{{profileLabel}}',
    '{{totalScore}}',
    '{{name}}',
    '{{email}}',
    '{{phone}}',
    '{{answers}}',
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full animate-bounce" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mt-4">Loading contact settings...</h3>
          <p className="text-slate-500 mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 text-lg">Failed to load contact settings</h3>
            <p className="text-red-600 mt-1">{error?.message || 'Something went wrong'}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Contact Settings</h1>
            <p className="text-slate-500">Manage your business contact information</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-all hover:shadow-xl disabled:opacity-50"
          >
            {updateSettings.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      <div className="space-y-8">
        {/* Contact Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Contact Information</h2>
              <p className="text-sm text-slate-500">Business contact details displayed on your website</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="contactInfo.phone"
                  value={settings.contactInfo?.phone || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="contactInfo.email"
                  value={settings.contactInfo?.email || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all"
                  placeholder="contact@mozno.in"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                WhatsApp Link
              </label>
              <div className="relative">
                <MessageCircle className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  name="contactInfo.whatsapp"
                  value={settings.contactInfo?.whatsapp || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all"
                  placeholder="https://wa.me/919876543210"
                />
              </div>
            </div>

            {/* Map Link */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Google Maps Location Link
              </label>
              <div className="relative">
                <ExternalLink className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  name="contactInfo.mapLink"
                  value={settings.contactInfo?.mapLink || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all"
                  placeholder="https://maps.app.goo.gl/..."
                />
              </div>
            </div>

            {/* Map Embed URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Google Maps Embed URL
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  name="contactInfo.mapEmbedUrl"
                  value={settings.contactInfo?.mapEmbedUrl || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all"
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Optional. If left empty, the website map is generated from the business address.
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Business Address
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
              <textarea
                name="contactInfo.address"
                value={settings.contactInfo?.address || ''}
                onChange={handleChange}
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all resize-none"
                placeholder="Enter your complete business address"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Social Media Links</h2>
              <p className="text-sm text-slate-500">Connect your social media profiles</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                LinkedIn Profile
              </label>
              <div className="relative">
                <Linkedin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  name="socialLinks.linkedin"
                  value={settings.socialLinks?.linkedin || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Instagram Profile
              </label>
              <div className="relative">
                <Instagram className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  name="socialLinks.instagram"
                  value={settings.socialLinks?.instagram || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 focus:bg-white transition-all"
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>
            </div>

            {/* YouTube */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                YouTube Channel
              </label>
              <div className="relative">
                <Youtube className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  name="socialLinks.youtube"
                  value={settings.socialLinks?.youtube || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 focus:bg-white transition-all"
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>
            </div>

            {/* Facebook */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Facebook Page
              </label>
              <div className="relative">
                <Facebook className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  name="socialLinks.facebook"
                  value={settings.socialLinks?.facebook || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 focus:bg-white transition-all"
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
            </div>

            {/* Twitter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Twitter / X Profile
              </label>
              <div className="relative">
                <Twitter className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  name="socialLinks.twitter"
                  value={settings.socialLinks?.twitter || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 focus:bg-white transition-all"
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Email Content */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Assessment Email Content</h2>
              <p className="text-sm text-slate-500">
                Edit the message included in Risk Profiling and Financial Health submission emails
              </p>
            </div>
          </div>

          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email message
          </label>
          <textarea
            name="assessmentEmailContent"
            value={settings.assessmentEmailContent || ''}
            onChange={handleChange}
            rows={16}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all resize-y font-mono text-sm leading-6"
            placeholder="Enter the assessment email content..."
          />

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Available placeholders
            </p>
            <div className="flex flex-wrap gap-2">
              {placeholders.map((placeholder) => (
                <code
                  key={placeholder}
                  className="px-2.5 py-1.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg text-xs"
                >
                  {placeholder}
                </code>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Keep <code className="text-violet-700">{'{{answers}}'}</code> wherever the complete questionnaire answers should appear.
            </p>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Preview</h2>
              <p className="text-sm text-slate-500">How your contact information will appear on the website</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-200">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-slate-700">{settings.contactInfo?.phone || 'Phone not set'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-slate-700">{settings.contactInfo?.email || 'Email not set'}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-slate-700">{settings.contactInfo?.address || 'Address not set'}</span>
              </div>
              <div className="flex items-center gap-3">
                <ExternalLink className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-slate-700 break-all">{settings.contactInfo?.mapLink || 'Google Maps link not set'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSettings;
