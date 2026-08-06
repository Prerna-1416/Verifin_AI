import { Role, RiskLevel, ScanStatus, InputType, NoticeStatus, ThreatType, FlagAction } from '@prisma/client';

export type { Role, RiskLevel, ScanStatus, InputType, NoticeStatus, ThreatType, FlagAction };

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface Institution {
  id: string;
  name: string;
  registrationNo: string;
  logoUrl: string | null;
  website: string | null;
  publicKey: string;
  privateKeyHash: string;
  isVerified: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notice {
  id: string;
  institutionId: string;
  title: string;
  content: string;
  documentUrl: string | null;
  signature: string;
  signedBy: string;
  signedAt: Date;
  status: NoticeStatus;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface QRCode {
  id: string;
  noticeId: string;
  institutionId: string;
  payload: string;
  qrImageUrl: string;
  scanCount: number;
  lastScannedAt: Date | null;
  createdAt: Date;
}

export interface Scan {
  id: string;
  userId: string;
  qrCodeId: string | null;
  inputType: InputType;
  inputContent: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  riskScore: number;
  riskLevel: RiskLevel;
  detectors: DetectorResult[];
  explanations: ExplanationData | null;
  threats: string[];
  isVerified: boolean;
  verifiedAt: Date | null;
  matchedNoticeId: string | null;
  status: ScanStatus;
  completedAt: Date | null;
  createdAt: Date;
}

export interface DetectorResult {
  type: 'text' | 'url' | 'image' | 'audio';
  score: number;
  details: Record<string, unknown>;
  threats: string[];
}

export interface ExplanationData {
  shapValues?: Record<string, number>;
  featureImportance?: Record<string, number>;
  ruleTraces?: string[];
}

export interface Report {
  id: string;
  scanId: string;
  userId: string;
  pdfUrl: string;
  generatedAt: Date;
}

export interface ThreatFeed {
  id: string;
  title: string;
  description: string;
  type: ThreatType;
  severity: RiskLevel;
  indicators: ThreatIndicators;
  source: string;
  sourceUrl: string | null;
  isActive: boolean;
  publishedAt: Date;
  createdAt: Date;
}

export interface ThreatIndicators {
  domains?: string[];
  ips?: string[];
  hashes?: string[];
  patterns?: string[];
  urls?: string[];
}

export interface FlaggedContent {
  id: string;
  scanId: string;
  reason: string;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  action: FlagAction;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ScanCreateInput {
  inputType: InputType;
  inputContent: string;
  file?: File;
}

export interface ScanResult {
  scan: Scan;
  reportUrl?: string;
}

export interface QRVerificationResult {
  isValid: boolean;
  notice?: Notice;
  institution?: Institution;
  message: string;
}

export interface RiskScoreBreakdown {
  overall: number;
  level: RiskLevel;
  detectors: {
    type: string;
    score: number;
    weight: number;
    details: Record<string, unknown>;
  }[];
  threats: string[];
}