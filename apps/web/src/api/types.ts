export type ThreatLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type Prediction = 'Safe' | 'Malicious';

export interface TextDetectionResult {
  prediction: Prediction;
  confidence: number;
  risk_score: number;
  threat_level: ThreatLevel;
  reasons: string[];
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
