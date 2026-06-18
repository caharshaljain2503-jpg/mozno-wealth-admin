import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import apiClient from '../axios.instance';

// Query keys
export const settingsKeys = {
  all: ['settings'],
  settings: () => [...settingsKeys.all, 'settings'],
};

const DEFAULT_MAP_LINK = 'https://maps.app.goo.gl/STjHCGiRPECf3hJR6?g_st=ac';
const LEGACY_DEFAULT_MAP_LINK = 'https://maps.app.goo.gl/VQSp7vAJ3kTvGcW47';

const normalizeSettings = (settings) => {
  if (!settings) return settings;

  const mapLink = settings.contactInfo?.mapLink;
  if (mapLink && mapLink !== LEGACY_DEFAULT_MAP_LINK) return settings;

  return {
    ...settings,
    contactInfo: {
      ...settings.contactInfo,
      mapLink: DEFAULT_MAP_LINK,
    },
  };
};

// Get settings
export const useSettings = () => {
  return useQuery({
    queryKey: settingsKeys.settings(),
    queryFn: async () => {
      const response = await apiClient.get('/settings');
      return normalizeSettings(response.data.settings);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update settings
export const useUpdateSettings = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settingsData) => {
      const response = await apiClient.put('/settings', settingsData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success(data.message || 'Settings updated successfully');
      options.onSuccess?.(data);
    },
    onError: (error) => {
      console.error('Update settings error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to update settings';
      toast.error(message);
      options.onError?.(error);
    },
  });
};

// Default settings structure
export const defaultSettings = {
  siteTitle: 'Mozno Wealth - Your Personal CFO',
  siteDescription: 'Comprehensive wealth management solutions tailored for you. Expert financial planning, investment advisory, and wealth optimization services.',
  logo: '',
  favicon: '',
  contactInfo: {
    phone: '+91 98205 07696',
    email: 'contact@mozno.in',
    whatsapp: 'https://wa.me/919820507696',
    address: '106, Shyamkamal \'C\' Building, Agarwal Market, Vile Parle East, Mumbai - 400 057',
    mapLink: DEFAULT_MAP_LINK,
    mapEmbedUrl: '',
  },
  googleAnalyticsId: '',
  socialLinks: {
    facebook: '',
    twitter: '',
    instagram: 'https://www.instagram.com/the_awareness_initiative',
    linkedin: 'https://www.linkedin.com/in/harshalvjain/',
    youtube: 'https://www.youtube.com/@awareness_initiative',
  },
};
