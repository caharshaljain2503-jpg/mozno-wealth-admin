import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminClient from "../axios.instance";

// Query Keys
export const seoKeys = {
  all: ["seo"],
  settings: () => [...seoKeys.all, "settings"],
  preview: () => [...seoKeys.all, "preview"],
};

// ============= GET HOOKS =============

// Get SEO settings
export const useSeoSettings = (options = {}) => {
  return useQuery({
    queryKey: seoKeys.settings(),
    queryFn: async () => {
      const res = await adminClient.get("/seo");
      return res.data.settings;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Get SEO preview
export const useSeoPreview = (options = {}) => {
  return useQuery({
    queryKey: seoKeys.preview(),
    queryFn: async () => {
      const res = await adminClient.get("/seo/preview");
      return res.data.preview;
    },
    enabled: false, // Only fetch when needed
    ...options,
  });
};

// ============= UPDATE HOOKS =============

// Update SEO settings
export const useUpdateSeoSettings = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const res = await adminClient.put("/seo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seoKeys.settings() });
      queryClient.invalidateQueries({ queryKey: seoKeys.preview() });
    },
    ...options,
  });
};

// ============= HELPERS =============

// Prepare form data for SEO settings
export const prepareSeoFormData = (settings, files = {}) => {
  const formData = new FormData();

  // General
  formData.append("siteTitle", settings.siteTitle || "");
  formData.append("siteDescription", settings.siteDescription || "");
  formData.append("siteKeywords", JSON.stringify(settings.siteKeywords || []));
  formData.append("logoAlt", settings.logoAlt || "");

  // Analytics
  formData.append("googleAnalyticsId", settings.googleAnalyticsId || "");
  formData.append("googleTagManagerId", settings.googleTagManagerId || "");
  formData.append("facebookPixelId", settings.facebookPixelId || "");
  formData.append("microsoftClarityId", settings.microsoftClarityId || "");

  // Social Links
  formData.append("socialLinks", JSON.stringify(settings.socialLinks || {}));

  // Open Graph
  formData.append("ogTitle", settings.ogTitle || "");
  formData.append("ogDescription", settings.ogDescription || "");
  formData.append("ogImageAlt", settings.ogImageAlt || "");
  formData.append("ogType", settings.ogType || "website");

  // Twitter
  formData.append("twitterCard", settings.twitterCard || "summary_large_image");
  formData.append("twitterSite", settings.twitterSite || "");
  formData.append("twitterCreator", settings.twitterCreator || "");
  formData.append("twitterTitle", settings.twitterTitle || "");
  formData.append("twitterDescription", settings.twitterDescription || "");
  formData.append("twitterImageAlt", settings.twitterImageAlt || "");

  // Robots & Indexing
  formData.append("robotsTxt", settings.robotsTxt || "");
  formData.append("metaRobots", settings.metaRobots || "index,follow");

  // Sitemap
  formData.append("sitemapEnabled", settings.sitemapEnabled ?? true);
  formData.append("sitemapPriority", settings.sitemapPriority || 0.5);
  formData.append("sitemapChangefreq", settings.sitemapChangefreq || "weekly");

  // Schema
  formData.append("organizationSchema", JSON.stringify(settings.organizationSchema || {}));
  formData.append("localBusinessSchema", JSON.stringify(settings.localBusinessSchema || {}));

  // Custom HTML
  formData.append("customHeadHtml", settings.customHeadHtml || "");
  formData.append("customFooterHtml", settings.customFooterHtml || "");

  // Performance
  formData.append("enableCdn", settings.enableCdn ?? true);
  formData.append("enableMinification", settings.enableMinification ?? true);
  formData.append("enableLazyLoading", settings.enableLazyLoading ?? true);

  // Security
  formData.append("enableHttpsRedirect", settings.enableHttpsRedirect ?? true);
  formData.append("enableWwwRedirect", settings.enableWwwRedirect ?? false);
  formData.append("enableTrailingSlash", settings.enableTrailingSlash ?? false);

  // Contact
  formData.append("contactEmail", settings.contactEmail || "");
  formData.append("contactPhone", settings.contactPhone || "");
  formData.append("contactAddress", settings.contactAddress || "");

  // Files
  if (files.logo) formData.append("logo", files.logo);
  if (files.favicon) formData.append("favicon", files.favicon);
  if (files.ogImage) formData.append("ogImage", files.ogImage);
  if (files.twitterImage) formData.append("twitterImage", files.twitterImage);

  return formData;
};

// ============= DEFAULT SETTINGS =============

export const defaultSeoSettings = {
  siteTitle: "Mozno Advisory - Financial Advisory Services",
  siteDescription: "Comprehensive wealth management and financial advisory services by Chartered Accountant & CFA Harshal Jain in Mumbai.",
  siteKeywords: ["financial advisory", "wealth management", "investment planning", "tax planning"],
  
  googleAnalyticsId: "",
  googleTagManagerId: "",
  facebookPixelId: "",
  microsoftClarityId: "",
  
  socialLinks: {
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    pinterest: "",
    github: "",
    whatsapp: "",
    telegram: "",
  },
  
  ogType: "website",
  twitterCard: "summary_large_image",
  
  robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /private\nSitemap: https://mozno.in/sitemap.xml",
  metaRobots: "index,follow",
  
  sitemapEnabled: true,
  sitemapPriority: 0.5,
  sitemapChangefreq: "weekly",
  
  enableCdn: true,
  enableMinification: true,
  enableLazyLoading: true,
  
  enableHttpsRedirect: true,
  enableWwwRedirect: false,
  enableTrailingSlash: false,
  
  logoAlt: "Mozno Advisory Logo",
};