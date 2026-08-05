export const APP_NAME = 'VeriFin AI';
export const APP_DESCRIPTION = 'AI-powered financial fraud detection for investors';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  INVESTOR: {
    DASHBOARD: '/investor',
    SCANNER: '/investor/scanner',
    SCAN_RESULT: '/investor/scans/[id]',
    HISTORY: '/investor/history',
    REPORTS: '/investor/reports',
    VERIFICATION: '/investor/verify',
    SETTINGS: '/investor/settings',
  },
  INSTITUTION: {
    DASHBOARD: '/institution',
    REGISTER_NOTICE: '/institution/register-notice',
    QR_GENERATOR: '/institution/qr-generator',
    REGISTRY: '/institution/registry',
    REPORTS: '/institution/reports',
    SETTINGS: '/institution/settings',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    THREAT_FEED: '/admin/threats',
    ANALYTICS: '/admin/analytics',
    FLAGGED: '/admin/flagged',
    INSTITUTIONS: '/admin/institutions',
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
  },
  PUBLIC: {
    VERIFY: '/verify/[qrId]',
    REGISTRY: '/registry',
    THREATS: '/threats',
  },
  API: {
    SCANS: '/api/scans',
    INSTITUTIONS: '/api/institutions',
    THREATS: '/api/threats',
    ADMIN: '/api/admin',
    AUTH: '/api/auth',
  },
} as const;

export const RISK_LEVELS = {
  LOW: { label: 'Low', color: 'success', score: { min: 0, max: 25 } },
  MEDIUM: { label: 'Medium', color: 'warning', score: { min: 26, max: 50 } },
  HIGH: { label: 'High', color: 'orange', score: { min: 51, max: 75 } },
  CRITICAL: { label: 'Critical', color: 'destructive', score: { min: 76, max: 100 } },
} as const;

export const RISK_COLORS = {
  LOW: 'bg-success-500',
  MEDIUM: 'bg-warning-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-destructive',
} as const;

export const INPUT_TYPES = {
  TEXT: { label: 'Text', icon: 'FileText', accept: '.txt,.md,.csv' },
  URL: { label: 'URL', icon: 'Link', accept: '' },
  IMAGE: { label: 'Image', icon: 'Image', accept: 'image/*' },
  AUDIO: { label: 'Audio', icon: 'Music', accept: 'audio/*' },
  FILE: { label: 'File', icon: 'File', accept: '.pdf,.doc,.docx' },
} as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export const THREAT_TYPES = [
  { value: 'PHISHING', label: 'Phishing', color: 'destructive' },
  { value: 'MALWARE', label: 'Malware', color: 'destructive' },
  { value: 'SCAM', label: 'Scam', color: 'orange' },
  { value: 'FRAUD', label: 'Fraud', color: 'destructive' },
  { value: 'IMPERSONATION', label: 'Impersonation', color: 'warning' },
  { value: 'DATA_LEAK', label: 'Data Leak', color: 'destructive' },
  { value: 'OTHER', label: 'Other', color: 'secondary' },
] as const;

export const NOTICE_TYPES = [
  { value: 'ADVISORY', label: 'Advisory' },
  { value: 'CIRCULAR', label: 'Circular' },
  { value: 'ALERT', label: 'Alert' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const NOTICE_STATUSES = [
  { value: 'ACTIVE', label: 'Active', color: 'success' },
  { value: 'EXPIRED', label: 'Expired', color: 'warning' },
  { value: 'REVOKED', label: 'Revoked', color: 'destructive' },
] as const;

export const SCAN_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'secondary' },
  { value: 'PROCESSING', label: 'Processing', color: 'primary' },
  { value: 'COMPLETED', label: 'Completed', color: 'success' },
  { value: 'FAILED', label: 'Failed', color: 'destructive' },
] as const;

export const PAGINATION_LIMITS = [10, 20, 50, 100] as const;

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const QR_CODE_SIZES = {
  small: 128,
  medium: 256,
  large: 512,
} as const;

export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  phone: /^\+?[\d\s-]{10,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
} as const;