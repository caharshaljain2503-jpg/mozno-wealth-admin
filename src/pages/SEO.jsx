import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Upload,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Trash2,
  ImageIcon,
  Youtube,
  BarChart3,
  Github,
  Phone,
  Mail,
  MapPin,
  Shield,
  Zap,
  Eye,
  Settings,
  ChevronDown,
  ChevronUp,
  Code,
  FileText,
  Share2,
  Search,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle,
  X,
  RefreshCw,
  ExternalLink,
  Info,
  Camera,
  Type,
  Hash,
  Link as LinkIcon,
} from 'lucide-react';
import { useSeoSettings, useUpdateSeoSettings, prepareSeoFormData, defaultSeoSettings } from '../api/hooks/useSEO';

const SEO = () => {
  const [settings, setSettings] = useState(defaultSeoSettings);
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({
    logo: '',
    favicon: '',
    ogImage: '',
    twitterImage: '',
  });
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    branding: true,
    analytics: false,
    social: false,
    openGraph: false,
    twitter: false,
    robots: false,
    sitemap: false,
    contact: false,
    performance: false,
    security: false,
    custom: false,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('google');

  const fileInputs = {
    logo: useRef(null),
    favicon: useRef(null),
    ogImage: useRef(null),
    twitterImage: useRef(null),
  };

  const { 
    data: savedSettings, 
    isLoading, 
    error,
    refetch 
  } = useSeoSettings();

  const updateSeo = useUpdateSeoSettings({
    onSuccess: () => {
      alert('SEO settings saved successfully!');
      setFiles({});
    },
    onError: (error) => {
      alert(error?.message || 'Failed to save settings');
    },
  });

  useEffect(() => {
    if (savedSettings) {
      setSettings(prev => ({
        ...prev,
        ...savedSettings,
      }));
      
      if (savedSettings.logo) {
        setPreviews(prev => ({ ...prev, logo: savedSettings.logo }));
      }
      if (savedSettings.favicon) {
        setPreviews(prev => ({ ...prev, favicon: savedSettings.favicon }));
      }
      if (savedSettings.ogImage) {
        setPreviews(prev => ({ ...prev, ogImage: savedSettings.ogImage }));
      }
      if (savedSettings.twitterImage) {
        setPreviews(prev => ({ ...prev, twitterImage: savedSettings.twitterImage }));
      }
    }
  }, [savedSettings]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleArrayChange = (e) => {
    const { name, value } = e.target;
    const keywords = value.split(',').map(k => k.trim()).filter(Boolean);
    setSettings(prev => ({ ...prev, [name]: keywords }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/x-icon', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, SVG, WEBP, ICO)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setFiles(prev => ({ ...prev, [type]: file }));
    setPreviews(prev => ({ ...prev, [type]: previewUrl }));
  };

  const handleRemoveImage = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }));
    setPreviews(prev => ({ ...prev, [type]: '' }));
    if (fileInputs[type]?.current) {
      fileInputs[type].current.value = '';
    }
  };

  const handleSave = () => {
    const formData = prepareSeoFormData(settings, files);
    updateSeo.mutate(formData);
  };

  const characterCount = settings.siteDescription?.length || 0;
  const maxDescriptionLength = 200;
  const titleLength = settings.siteTitle?.length || 0;

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
          <h3 className="text-lg font-semibold text-slate-800">Loading SEO settings...</h3>
          <p className="text-slate-500 mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="space-y-6">
        <Header onSave={handleSave} isSaving={updateSeo.isPending} onPreview={() => setShowPreview(true)} />
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 text-lg">Failed to load SEO settings</h3>
              <p className="text-red-600 mt-1">{error?.message || 'Something went wrong'}</p>
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
    <div className="space-y-6 pb-8">
      {/* Hidden file inputs */}
      {Object.entries(fileInputs).map(([key, ref]) => (
        <input
          key={key}
          type="file"
          ref={ref}
          className="hidden"
          accept=".jpg,.jpeg,.png,.svg,.ico,.webp"
          onChange={(e) => handleFileChange(e, key)}
        />
      ))}

      {/* Header */}
      <Header onSave={handleSave} isSaving={updateSeo.isPending} onPreview={() => setShowPreview(true)} />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <QuickStatCard
          label="Title Length"
          value={`${titleLength}/60`}
          icon={Type}
          gradient={titleLength > 60 ? "from-red-500 to-rose-600" : "from-emerald-500 to-teal-600"}
          shadow={titleLength > 60 ? "shadow-red-500/20" : "shadow-emerald-500/20"}
        />
        <QuickStatCard
          label="Description"
          value={`${characterCount}/200`}
          icon={FileText}
          gradient={characterCount > 200 ? "from-red-500 to-rose-600" : "from-violet-500 to-purple-600"}
          shadow={characterCount > 200 ? "shadow-red-500/20" : "shadow-violet-500/20"}
        />
        <QuickStatCard
          label="Keywords"
          value={settings.siteKeywords?.length || 0}
          icon={Hash}
          gradient="from-amber-500 to-orange-600"
          shadow="shadow-amber-500/20"
        />
        <QuickStatCard
          label="Social Links"
          value={Object.values(settings.socialLinks || {}).filter(Boolean).length}
          icon={Share2}
          gradient="from-blue-500 to-indigo-600"
          shadow="shadow-blue-500/20"
        />
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* General Settings */}
        <Section
          title="General Settings"
          description="Basic SEO configuration"
          icon={Settings}
          section="general"
          expanded={expandedSections.general}
          onToggle={() => toggleSection('general')}
          gradient="from-violet-500 to-purple-600"
        >
          <div className="space-y-5">
            <InputField
              label="Site Title"
              name="siteTitle"
              value={settings.siteTitle || ''}
              onChange={handleChange}
              placeholder="Enter your site title"
              maxLength={100}
              icon={Type}
              required
              hint={`${settings.siteTitle?.length || 0}/100 characters (50-60 recommended for SEO)`}
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Site Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="w-5 h-5 absolute left-4 top-3 text-slate-400" />
                <textarea
                  name="siteDescription"
                  value={settings.siteDescription || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 resize-none"
                  placeholder="Enter your site description for SEO"
                  maxLength={maxDescriptionLength}
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs text-slate-500">
                  {characterCount}/{maxDescriptionLength} characters (150-160 recommended)
                </p>
                {characterCount > maxDescriptionLength && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Description is too long
                  </p>
                )}
              </div>
            </div>

            <InputField
              label="Site Keywords"
              name="siteKeywords"
              value={settings.siteKeywords?.join(', ') || ''}
              onChange={handleArrayChange}
              placeholder="financial advisory, wealth management, investment planning"
              icon={Hash}
              hint="Separate keywords with commas"
            />
          </div>
        </Section>

        {/* Branding */}
        <Section
          title="Branding"
          description="Logo and favicon settings"
          icon={ImageIcon}
          section="branding"
          expanded={expandedSections.branding}
          onToggle={() => toggleSection('branding')}
          gradient="from-pink-500 to-rose-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploadCard
              label="Site Logo"
              preview={previews.logo}
              onUpload={() => fileInputs.logo.current?.click()}
              onRemove={() => handleRemoveImage('logo')}
              hint="PNG, SVG, WEBP (recommended: 200x50px)"
              aspectRatio="wide"
            />
            <ImageUploadCard
              label="Favicon"
              preview={previews.favicon}
              onUpload={() => fileInputs.favicon.current?.click()}
              onRemove={() => handleRemoveImage('favicon')}
              hint="ICO, PNG, SVG (32x32px)"
              aspectRatio="square"
            />
          </div>
          
          <div className="mt-5">
            <InputField
              label="Logo Alt Text"
              name="logoAlt"
              value={settings.logoAlt || ''}
              onChange={handleChange}
              placeholder="Company Logo"
              icon={Type}
              hint="Describe your logo for accessibility"
            />
          </div>
        </Section>

        {/* Analytics */}
        <Section
          title="Analytics & Tracking"
          description="Connect your analytics platforms"
          icon={BarChart3}
          section="analytics"
          expanded={expandedSections.analytics}
          onToggle={() => toggleSection('analytics')}
          gradient="from-emerald-500 to-teal-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Google Analytics ID"
              name="googleAnalyticsId"
              value={settings.googleAnalyticsId || ''}
              onChange={handleChange}
              placeholder="G-XXXXXXXXXX"
              icon={BarChart3}
            />
            <InputField
              label="Google Tag Manager ID"
              name="googleTagManagerId"
              value={settings.googleTagManagerId || ''}
              onChange={handleChange}
              placeholder="GTM-XXXXXXX"
              icon={Code}
            />
            <InputField
              label="Facebook Pixel ID"
              name="facebookPixelId"
              value={settings.facebookPixelId || ''}
              onChange={handleChange}
              placeholder="123456789012345"
              icon={Facebook}
            />
            <InputField
              label="Microsoft Clarity ID"
              name="microsoftClarityId"
              value={settings.microsoftClarityId || ''}
              onChange={handleChange}
              placeholder="clarity-project-id"
              icon={Search}
            />
          </div>
        </Section>

        {/* Social Media Links */}
        <Section
          title="Social Media Links"
          description="Connect your social profiles"
          icon={Share2}
          section="social"
          expanded={expandedSections.social}
          onToggle={() => toggleSection('social')}
          gradient="from-blue-500 to-indigo-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Facebook"
              name="socialLinks.facebook"
              value={settings.socialLinks?.facebook || ''}
              onChange={handleChange}
              placeholder="https://facebook.com/yourpage"
              icon={Facebook}
            />
            <InputField
              label="Twitter / X"
              name="socialLinks.twitter"
              value={settings.socialLinks?.twitter || ''}
              onChange={handleChange}
              placeholder="https://twitter.com/yourhandle"
              icon={Twitter}
            />
            <InputField
              label="Instagram"
              name="socialLinks.instagram"
              value={settings.socialLinks?.instagram || ''}
              onChange={handleChange}
              placeholder="https://instagram.com/yourprofile"
              icon={Instagram}
            />
            <InputField
              label="LinkedIn"
              name="socialLinks.linkedin"
              value={settings.socialLinks?.linkedin || ''}
              onChange={handleChange}
              placeholder="https://linkedin.com/company/yourcompany"
              icon={Linkedin}
            />
            <InputField
              label="YouTube"
              name="socialLinks.youtube"
              value={settings.socialLinks?.youtube || ''}
              onChange={handleChange}
              placeholder="https://youtube.com/@yourchannel"
              icon={Youtube}
            />
            <InputField
              label="GitHub"
              name="socialLinks.github"
              value={settings.socialLinks?.github || ''}
              onChange={handleChange}
              placeholder="https://github.com/yourorg"
              icon={Github}
            />
          </div>
        </Section>

        {/* Open Graph */}
        <Section
          title="Open Graph (Facebook & LinkedIn)"
          description="Control how your site appears when shared"
          icon={Facebook}
          section="openGraph"
          expanded={expandedSections.openGraph}
          onToggle={() => toggleSection('openGraph')}
          gradient="from-blue-600 to-blue-800"
        >
          <div className="space-y-5">
            <InputField
              label="OG Title"
              name="ogTitle"
              value={settings.ogTitle || ''}
              onChange={handleChange}
              placeholder={settings.siteTitle || "Leave empty to use site title"}
              icon={Type}
              maxLength={95}
              hint="Leave empty to use site title"
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">OG Description</label>
              <div className="relative">
                <FileText className="w-5 h-5 absolute left-4 top-3 text-slate-400" />
                <textarea
                  name="ogDescription"
                  value={settings.ogDescription || ''}
                  onChange={handleChange}
                  rows={2}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 resize-none"
                  placeholder={settings.siteDescription || "Leave empty to use site description"}
                  maxLength={200}
                />
              </div>
            </div>

            <ImageUploadCard
              label="OG Image"
              preview={previews.ogImage}
              onUpload={() => fileInputs.ogImage.current?.click()}
              onRemove={() => handleRemoveImage('ogImage')}
              hint="1200x630px recommended for best results"
              aspectRatio="og"
            />

            <SelectField
              label="OG Type"
              name="ogType"
              value={settings.ogType || 'website'}
              onChange={handleChange}
              options={[
                { value: 'website', label: 'Website' },
                { value: 'article', label: 'Article' },
                { value: 'profile', label: 'Profile' },
                { value: 'book', label: 'Book' },
                { value: 'music', label: 'Music' },
                { value: 'video', label: 'Video' },
              ]}
            />
          </div>
        </Section>

        {/* Twitter Cards */}
        <Section
          title="Twitter Cards"
          description="Customize Twitter/X share previews"
          icon={Twitter}
          section="twitter"
          expanded={expandedSections.twitter}
          onToggle={() => toggleSection('twitter')}
          gradient="from-sky-500 to-blue-600"
        >
          <div className="space-y-5">
            <SelectField
              label="Twitter Card Type"
              name="twitterCard"
              value={settings.twitterCard || 'summary_large_image'}
              onChange={handleChange}
              options={[
                { value: 'summary', label: 'Summary Card' },
                { value: 'summary_large_image', label: 'Summary Card with Large Image' },
                { value: 'app', label: 'App Card' },
                { value: 'player', label: 'Player Card' },
              ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Twitter Site"
                name="twitterSite"
                value={settings.twitterSite || ''}
                onChange={handleChange}
                placeholder="@yourhandle"
                icon={Twitter}
              />
              <InputField
                label="Twitter Creator"
                name="twitterCreator"
                value={settings.twitterCreator || ''}
                onChange={handleChange}
                placeholder="@creator"
                icon={Twitter}
              />
            </div>

            <ImageUploadCard
              label="Twitter Image"
              preview={previews.twitterImage}
              onUpload={() => fileInputs.twitterImage.current?.click()}
              onRemove={() => handleRemoveImage('twitterImage')}
              hint="Minimum 300x157px (2:1 ratio recommended)"
              aspectRatio="twitter"
            />
          </div>
        </Section>

        {/* Robots & Indexing */}
        <Section
          title="Robots & Indexing"
          description="Control search engine crawling"
          icon={Search}
          section="robots"
          expanded={expandedSections.robots}
          onToggle={() => toggleSection('robots')}
          gradient="from-slate-600 to-slate-800"
        >
          <div className="space-y-5">
            <SelectField
              label="Meta Robots"
              name="metaRobots"
              value={settings.metaRobots || 'index,follow'}
              onChange={handleChange}
              options={[
                { value: 'index,follow', label: 'Index, Follow (Default)' },
                { value: 'noindex,follow', label: 'No Index, Follow' },
                { value: 'index,nofollow', label: 'Index, No Follow' },
                { value: 'noindex,nofollow', label: 'No Index, No Follow' },
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">robots.txt</label>
              <textarea
                name="robotsTxt"
                value={settings.robotsTxt || ''}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all text-emerald-400 placeholder:text-slate-500 font-mono text-sm resize-none"
                placeholder="User-agent: *&#10;Allow: /"
              />
            </div>
          </div>
        </Section>

        {/* Sitemap */}
        <Section
          title="Sitemap"
          description="XML sitemap configuration"
          icon={FileText}
          section="sitemap"
          expanded={expandedSections.sitemap}
          onToggle={() => toggleSection('sitemap')}
          gradient="from-orange-500 to-red-600"
        >
          <div className="space-y-5">
            <ToggleSwitch
              label="Enable Sitemap"
              description="Generate XML sitemap automatically"
              checked={settings.sitemapEnabled}
              onChange={() => handleChange({ target: { name: 'sitemapEnabled', type: 'checkbox', checked: !settings.sitemapEnabled } })}
            />

            {settings.sitemapEnabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sitemap Priority: {settings.sitemapPriority || 0.5}
                  </label>
                  <input
                    type="range"
                    name="sitemapPriority"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.sitemapPriority || 0.5}
                    onChange={handleChange}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0.0 (Low)</span>
                    <span>1.0 (High)</span>
                  </div>
                </div>

                <SelectField
                  label="Change Frequency"
                  name="sitemapChangefreq"
                  value={settings.sitemapChangefreq || 'weekly'}
                  onChange={handleChange}
                  options={[
                    { value: 'always', label: 'Always' },
                    { value: 'hourly', label: 'Hourly' },
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'yearly', label: 'Yearly' },
                    { value: 'never', label: 'Never' },
                  ]}
                />
              </>
            )}
          </div>
        </Section>

        {/* Contact Information */}
        <Section
          title="Contact Information"
          description="Business contact details for schema"
          icon={Mail}
          section="contact"
          expanded={expandedSections.contact}
          onToggle={() => toggleSection('contact')}
          gradient="from-cyan-500 to-teal-600"
        >
          <div className="space-y-4">
            <InputField
              label="Contact Email"
              name="contactEmail"
              value={settings.contactEmail || ''}
              onChange={handleChange}
              placeholder="contact@yoursite.com"
              icon={Mail}
            />
            <InputField
              label="Contact Phone"
              name="contactPhone"
              value={settings.contactPhone || ''}
              onChange={handleChange}
              placeholder="+91 12345 67890"
              icon={Phone}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contact Address</label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-4 top-3 text-slate-400" />
                <textarea
                  name="contactAddress"
                  value={settings.contactAddress || ''}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Your business address"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Performance */}
        <Section
          title="Performance"
          description="Optimize your site speed"
          icon={Zap}
          section="performance"
          expanded={expandedSections.performance}
          onToggle={() => toggleSection('performance')}
          gradient="from-yellow-500 to-amber-600"
        >
          <div className="space-y-4">
            <ToggleSwitch
              label="Enable CDN"
              description="Serve assets from Content Delivery Network"
              checked={settings.enableCdn}
              onChange={() => handleChange({ target: { name: 'enableCdn', type: 'checkbox', checked: !settings.enableCdn } })}
            />
            <ToggleSwitch
              label="Enable Minification"
              description="Minify HTML, CSS, and JavaScript"
              checked={settings.enableMinification}
              onChange={() => handleChange({ target: { name: 'enableMinification', type: 'checkbox', checked: !settings.enableMinification } })}
            />
            <ToggleSwitch
              label="Enable Lazy Loading"
              description="Lazy load images and iframes"
              checked={settings.enableLazyLoading}
              onChange={() => handleChange({ target: { name: 'enableLazyLoading', type: 'checkbox', checked: !settings.enableLazyLoading } })}
            />
          </div>
        </Section>

        {/* Security */}
        <Section
          title="Security"
          description="Security and redirect settings"
          icon={Shield}
          section="security"
          expanded={expandedSections.security}
          onToggle={() => toggleSection('security')}
          gradient="from-red-500 to-rose-600"
        >
          <div className="space-y-4">
            <ToggleSwitch
              label="Force HTTPS Redirect"
              description="Redirect all HTTP traffic to HTTPS"
              checked={settings.enableHttpsRedirect}
              onChange={() => handleChange({ target: { name: 'enableHttpsRedirect', type: 'checkbox', checked: !settings.enableHttpsRedirect } })}
            />
            <ToggleSwitch
              label="WWW Redirect"
              description="Redirect non-www to www (or vice versa)"
              checked={settings.enableWwwRedirect}
              onChange={() => handleChange({ target: { name: 'enableWwwRedirect', type: 'checkbox', checked: !settings.enableWwwRedirect } })}
            />
          </div>
        </Section>

        {/* Custom HTML */}
        <Section
          title="Custom HTML"
          description="Add custom code to your site"
          icon={Code}
          section="custom"
          expanded={expandedSections.custom}
          onToggle={() => toggleSection('custom')}
          gradient="from-indigo-500 to-purple-600"
        >
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Custom Head HTML
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Add custom meta tags, styles, or scripts to &lt;head&gt;
              </p>
              <textarea
                name="customHeadHtml"
                value={settings.customHeadHtml || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all text-emerald-400 placeholder:text-slate-500 font-mono text-sm resize-none"
                placeholder="<!-- Add custom meta tags or scripts -->"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Custom Footer HTML
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Add custom HTML before closing &lt;/body&gt; tag
              </p>
              <textarea
                name="customFooterHtml"
                value={settings.customFooterHtml || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all text-emerald-400 placeholder:text-slate-500 font-mono text-sm resize-none"
                placeholder="<!-- Add custom footer scripts -->"
              />
            </div>
          </div>
        </Section>
      </div>

      {/* Floating Save Button - Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden z-40">
        <button
          onClick={handleSave}
          disabled={updateSeo.isPending}
          className="w-14 h-14 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-violet-500/40 flex items-center justify-center hover:from-violet-600 hover:to-purple-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {updateSeo.isPending ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Save className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          settings={settings}
          previews={previews}
          activeTab={activePreviewTab}
          onTabChange={setActivePreviewTab}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

// Header Component
const Header = ({ onSave, isSaving, onPreview }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
        SEO & Site Settings
      </h1>
      <p className="text-slate-500 mt-1">
        Optimize your website for search engines
      </p>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onPreview}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
      >
        <Eye className="w-4 h-4" />
        <span className="hidden sm:inline">Preview</span>
      </button>
      <button
        onClick={onSave}
        disabled={isSaving}
        className="hidden lg:inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Changes
          </>
        )}
      </button>
    </div>
  </div>
);

// Quick Stat Card
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

// Section Component
const Section = ({ title, description, icon: Icon, section, expanded, onToggle, gradient, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
    <button
      onClick={onToggle}
      className="w-full px-5 sm:px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500 hidden sm:block">{description}</p>
        </div>
      </div>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${expanded ? 'bg-violet-100' : 'bg-slate-100'}`}>
        {expanded ? (
          <ChevronUp className={`w-5 h-5 ${expanded ? 'text-violet-600' : 'text-slate-500'}`} />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-500" />
        )}
      </div>
    </button>
    {expanded && (
      <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100">
        {children}
      </div>
    )}
  </div>
);

// Input Field Component
const InputField = ({ label, name, value, onChange, placeholder, icon: Icon, maxLength, required, hint }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400`}
      />
    </div>
    {hint && <p className="text-xs text-slate-500 mt-1.5">{hint}</p>}
  </div>
);

// Select Field Component
const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-slate-800 appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

// Toggle Switch Component
const ToggleSwitch = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-violet-600' : 'bg-slate-300'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  </div>
);

// Image Upload Card Component
const ImageUploadCard = ({ label, preview, onUpload, onRemove, hint, aspectRatio }) => {
  const aspectClasses = {
    square: 'h-24 w-24',
    wide: 'h-20 w-full max-w-[200px]',
    og: 'h-32 w-full',
    twitter: 'h-32 w-full',
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div
        className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center transition-all hover:border-violet-400 hover:bg-violet-50/30 cursor-pointer group"
        onClick={onUpload}
      >
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt={`${label} preview`}
              className={`${aspectRatio === 'square' ? 'h-20 w-20' : 'max-h-24 max-w-full'} mx-auto rounded-lg object-contain`}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="py-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-violet-100 transition-colors">
              <Camera className="w-6 h-6 text-slate-400 group-hover:text-violet-500 transition-colors" />
            </div>
            <p className="text-sm font-medium text-slate-600 group-hover:text-violet-600 transition-colors">
              Click to upload
            </p>
            <p className="text-xs text-slate-400 mt-1">{hint}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Preview Modal Component
const PreviewModal = ({ settings, previews, activeTab, onTabChange, onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
      {/* Modal Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">SEO Preview</h3>
            <p className="text-sm text-slate-500">See how your site appears</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 flex gap-2 border-b border-slate-200">
        {[
          { id: 'google', label: 'Google', icon: Search },
          { id: 'facebook', label: 'Facebook', icon: Facebook },
          { id: 'twitter', label: 'Twitter', icon: Twitter },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all border-b-2 -mb-[2px] ${
              activeTab === tab.id
                ? 'bg-violet-50 text-violet-700 border-violet-500'
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Preview Content */}
      <div className="p-6 overflow-y-auto max-h-[60vh]">
        {activeTab === 'google' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Google Search Result</h4>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-800">Your Site</p>
                  <p className="text-xs text-emerald-700">https://yoursite.com</p>
                </div>
              </div>
              <p className="text-xl text-blue-700 font-medium hover:underline cursor-pointer mt-2">
                {settings.siteTitle || 'Your Site Title'}
              </p>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                {settings.siteDescription || 'Your site description will appear here...'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'facebook' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Facebook / LinkedIn Preview</h4>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {previews.ogImage ? (
                <img src={previews.ogImage} alt="OG Preview" className="w-full h-52 object-cover" />
              ) : (
                <div className="w-full h-52 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-slate-300" />
                </div>
              )}
              <div className="p-4 bg-slate-50">
                <p className="text-xs text-slate-500 uppercase tracking-wide">yoursite.com</p>
                <p className="text-base font-semibold text-slate-900 mt-1 line-clamp-2">
                  {settings.ogTitle || settings.siteTitle || 'Your Site Title'}
                </p>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                  {settings.ogDescription || settings.siteDescription || 'Your description...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'twitter' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Twitter Card Preview</h4>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {previews.twitterImage || previews.ogImage ? (
                <img src={previews.twitterImage || previews.ogImage} alt="Twitter Preview" className="w-full h-52 object-cover" />
              ) : (
                <div className="w-full h-52 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-slate-300" />
                </div>
              )}
              <div className="p-4">
                <p className="text-base font-semibold text-slate-900 line-clamp-2">
                  {settings.ogTitle || settings.siteTitle || 'Your Site Title'}
                </p>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                  {settings.ogDescription || settings.siteDescription || 'Your description...'}
                </p>
                <p className="text-sm text-slate-400 mt-2 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  yoursite.com
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Footer */}
      <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
        >
          Close Preview
        </button>
      </div>
    </div>
  </div>
);

export default SEO;