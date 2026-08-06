import type {
  AudioDetectionResult,
  ImageDetectionResult,
  TextDetectionResult,
  UrlDetectionResult,
} from '@/api/types';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ScanResultSummary {
  prediction: 'Safe' | 'Malicious';
  riskScore: number;
  riskLevel: RiskLevel;
  confidence?: number;
  reasons: string[];
  transcription?: string;
  textPreview?: string;
}

export function mapThreatLevel(level: string | undefined): RiskLevel {
  switch ((level ?? '').toLowerCase()) {
    case 'critical':
      return 'CRITICAL';
    case 'high':
      return 'HIGH';
    case 'medium':
      return 'MEDIUM';
    default:
      return 'LOW';
  }
}

export function mapRiskScore(score: number): RiskLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}

export function mapTextResult(result: TextDetectionResult): ScanResultSummary {
  return {
    prediction: result.prediction,
    riskScore: result.risk_score,
    riskLevel: mapThreatLevel(result.threat_level),
    confidence: result.confidence,
    reasons: result.reasons ?? [],
  };
}

export function mapUrlResult(result: UrlDetectionResult): ScanResultSummary {
  return {
    prediction: result.prediction,
    riskScore: result.risk_score,
    riskLevel: mapRiskScore(result.risk_score),
    reasons: result.reasons ?? [],
  };
}

export function mapImageResult(result: ImageDetectionResult): ScanResultSummary {
  return {
    prediction: result.prediction,
    riskScore: result.risk_score,
    riskLevel: mapThreatLevel(result.threat_level),
    reasons: result.reasons ?? [],
    textPreview: result.text_preview,
  };
}

export function mapAudioResult(result: AudioDetectionResult): ScanResultSummary {
  return {
    prediction: result.prediction,
    riskScore: result.risk_score,
    riskLevel: mapThreatLevel(result.threat_level),
    confidence: result.confidence,
    reasons: result.reasons ?? [],
    transcription: result.transcription,
  };
}
