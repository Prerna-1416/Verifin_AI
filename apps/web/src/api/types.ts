export type ThreatLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type Prediction = 'Safe' | 'Malicious';

export interface PrivacyReport {
  pii_redacted: Record<string, number>;
  pii_types_found: string[];
  pii_count: number;
  processed_locally: boolean;
  data_retention: string;
  dpdp_compliant: boolean;
}

export interface EnsembleResult {
  score: number;
  risk_level: string;
  confidence: number;
  rule_verdict: string;
  ml_verdict: string;
  consensus: string;
  contributions: {
    rule_engine: { score: number; weight: number };
    ml_classifier: { score: number; weight: number; probability_scam: number };
  };
  explanation: string;
}

export interface TextDetectionResult {
  prediction: Prediction;
  confidence: number;
  risk_score: number;
  threat_level: ThreatLevel;
  reasons: string[];
  privacy?: PrivacyReport;
  ensemble?: EnsembleResult;
  input_redacted?: string;
}

export interface UrlDetectionResult {
  prediction: Prediction;
  risk_score: number;
  reasons: string[];
}

export interface ImageDetectionResult {
  prediction: Prediction;
  risk_score: number;
  threat_level: ThreatLevel;
  text_preview: string;
  reasons: string[];
}

export interface AudioDetectionResult extends TextDetectionResult {
  transcription: string;
}

export interface OverallRisk {
  risk_score: number;
  threat_level: ThreatLevel;
  recommendation: string;
}

export interface AnalyzeResult {
  text?: TextDetectionResult;
  url?: UrlDetectionResult;
  overall: OverallRisk;
  report: string;
  history: string;
}

export interface HistoryEntry {
  total_scans: number;
  files: string[];
}
