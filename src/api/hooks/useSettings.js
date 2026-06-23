import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import apiClient from '../axios.instance';

// Query keys
export const settingsKeys = {
  all: ['settings'],
  settings: () => [...settingsKeys.all, 'settings'],
};

const DEFAULT_MAP_LINK = 'https://share.google/VNKicOtItWUL4lP5P';
const DEFAULT_YOUTUBE_LINK = 'https://www.youtube.com/@theawarenessinitiative';
const LEGACY_YOUTUBE_LINK = 'https://www.youtube.com/@awareness_initiative';
const DEFAULT_ADDRESS = 'C, 106, Shyam Kamal Rd, next to Rajwadi Chai, above IIFL Office, Agarwal Market, Vile Parle East, Vile Parle, Mumbai, Maharashtra 400057';
const LEGACY_DEFAULT_ADDRESS = '106, Shyamkamal \'C\' Building, Agarwal Market, Vile Parle East, Mumbai - 400 057';
const LEGACY_DEFAULT_MAP_LINKS = [
  'https://maps.app.goo.gl/STjHCGiRPECf3hJR6?g_st=ac',
  'https://maps.app.goo.gl/VQSp7vAJ3kTvGcW47',
];

const normalizeSettings = (settings) => {
  if (!settings) return settings;

  const mapLink = settings.contactInfo?.mapLink;
  const address = settings.contactInfo?.address;
  const youtube = settings.socialLinks?.youtube;
  const normalizedMapLink =
    !mapLink || LEGACY_DEFAULT_MAP_LINKS.includes(mapLink)
      ? DEFAULT_MAP_LINK
      : mapLink;
  const normalizedAddress =
    !address || address === LEGACY_DEFAULT_ADDRESS ? DEFAULT_ADDRESS : address;
  const normalizedYoutube =
    !youtube || youtube === LEGACY_YOUTUBE_LINK ? DEFAULT_YOUTUBE_LINK : youtube;

  if (
    mapLink === normalizedMapLink &&
    address === normalizedAddress &&
    youtube === normalizedYoutube
  ) {
    return settings;
  }

  return {
    ...settings,
    contactInfo: {
      ...settings.contactInfo,
      mapLink: normalizedMapLink,
      address: normalizedAddress,
    },
    socialLinks: {
      ...settings.socialLinks,
      youtube: normalizedYoutube,
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
    address: DEFAULT_ADDRESS,
    mapLink: DEFAULT_MAP_LINK,
    mapEmbedUrl: '',
  },
  googleAnalyticsId: '',
  assessmentEmailContent: [
    '{{assessmentType}} Assessment Result',
    '',
    'Result: {{profileLabel}}',
    'Total score: {{totalScore}}',
    'Name: {{name}}',
    'Email: {{email}}',
    'Phone: {{phone}}',
    '',
    'Answers:',
    '{{answers}}',
  ].join('\n'),
  socialLinks: {
    facebook: '',
    twitter: '',
    instagram: 'https://www.instagram.com/the_awareness_initiative',
    linkedin: 'https://www.linkedin.com/in/harshalvjain/',
    youtube: DEFAULT_YOUTUBE_LINK,
  },
};
