import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[a-z]/, 'Password must contain at least one lowercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  role: z.enum(['INVESTOR', 'INSTITUTION']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[a-z]/, 'Password must contain at least one lowercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const scanTextSchema = z.object({
  inputType: z.literal('TEXT'),
  inputContent: z.string().min(10, 'Text must be at least 10 characters').max(50000, 'Text too long'),
});

export const scanUrlSchema = z.object({
  inputType: z.literal('URL'),
  inputContent: z.string().url('Invalid URL format'),
});

export const scanFileSchema = z.object({
  inputType: z.enum(['IMAGE', 'AUDIO', 'FILE']),
  file: z.instanceof(File).refine((file) => file.size <= 50 * 1024 * 1024, 'File size must be less than 50MB'),
});

export const scanSchema = z.discriminatedUnion('inputType', [
  scanTextSchema,
  scanUrlSchema,
  scanFileSchema,
]);

export type ScanInput = z.infer<typeof scanSchema>;

export const institutionRegisterSchema = z.object({
  name: z.string().min(2, 'Institution name must be at least 2 characters').max(200),
  registrationNo: z.string().min(5, 'Registration number must be at least 5 characters').max(50),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')),
});

export type InstitutionRegisterInput = z.infer<typeof institutionRegisterSchema>;

export const noticeCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  type: z.enum(['ADVISORY', 'CIRCULAR', 'ALERT', 'OTHER']),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  documentUrl: z.string().url('Invalid document URL').optional().or(z.literal('')),
  expiresAt: z.string().datetime().optional().nullable(),
});

export type NoticeCreateInput = z.infer<typeof noticeCreateSchema>;

export const noticeUpdateSchema = noticeCreateSchema.partial();

export type NoticeUpdateInput = z.infer<typeof noticeUpdateSchema>;

export const threatCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  type: z.enum(['PHISHING', 'MALWARE', 'SCAM', 'FRAUD', 'IMPERSONATION', 'DATA_LEAK', 'OTHER']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  indicators: z.object({
    domains: z.array(z.string()).optional(),
    ips: z.array(z.string()).optional(),
    hashes: z.array(z.string()).optional(),
    patterns: z.array(z.string()).optional(),
    urls: z.array(z.string()).optional(),
  }),
  source: z.string().min(2, 'Source must be at least 2 characters'),
  sourceUrl: z.string().url('Invalid source URL').optional().or(z.literal('')),
});

export type ThreatCreateInput = z.infer<typeof threatCreateSchema>;

export const threatUpdateSchema = threatCreateSchema.partial();

export type ThreatUpdateInput = z.infer<typeof threatUpdateSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const scanFilterSchema = paginationSchema.extend({
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
  inputType: z.enum(['TEXT', 'URL', 'IMAGE', 'AUDIO', 'FILE']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
});

export type ScanFilterInput = z.infer<typeof scanFilterSchema>;

export const institutionFilterSchema = paginationSchema.extend({
  isVerified: z.boolean().optional(),
  search: z.string().optional(),
});

export type InstitutionFilterInput = z.infer<typeof institutionFilterSchema>;

export const threatFilterSchema = paginationSchema.extend({
  type: z.enum(['PHISHING', 'MALWARE', 'SCAM', 'FRAUD', 'IMPERSONATION', 'DATA_LEAK', 'OTHER']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

export type ThreatFilterInput = z.infer<typeof threatFilterSchema>;