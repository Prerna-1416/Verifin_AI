import { aiApi, api } from '@/lib/api';
import type {
  AnalyzeResult,
  AudioDetectionResult,
  HistoryEntry,
  ImageDetectionResult,
  TextDetectionResult,
  ThreatLevel,
  UrlDetectionResult,
} from './types';

export interface DetectTextParams {
  text: string;
}

export interface DetectUrlParams {
  url: string;
}

export interface AnalyzeParams {
  text?: string;
  url?: string;
}

interface AiDetector {
  name: string;
  status: string;
  detail: string;
}

interface AiRawResult {
  score?: number;
  domain?: string;
  detectors?: AiDetector[];
  threats?: string[];
  explanations?: {
    transcript_preview?: string;
    rule_traces?: string[];
    feature_importance?: Record<string, number>;
  };
  qr_payload?: string | null;
  privacy?: import('@/api/types').PrivacyReport;
  ensemble?: import('@/api/types').EnsembleResult;
  input_redacted?: string;
}

function toThreatLevel(score: number): ThreatLevel {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
}

function toPrediction(raw: AiRawResult): 'Safe' | 'Malicious' {
  return raw.threats && raw.threats.length > 0 ? 'Malicious' : 'Safe';
}

function toConfidence(score: number): number {
  return Math.max(1, Math.min(99, Math.round(50 + Math.abs(score - 50) * 0.98)));
}

function toReasons(raw: AiRawResult): string[] {
  const out: string[] = [...(raw.threats ?? [])];
  for (const d of raw.detectors ?? []) {
    if (d.status === 'flagged' && d.detail) out.push(d.detail);
  }
  return out;
}

function mapText(raw: AiRawResult): TextDetectionResult {
  const score = raw.score ?? 0;
  return {
    prediction: toPrediction(raw),
    confidence: toConfidence(score),
    risk_score: score,
    threat_level: toThreatLevel(score),
    reasons: toReasons(raw),
    privacy: raw.privacy,
    ensemble: raw.ensemble,
    input_redacted: raw.input_redacted,
  };
}

function mapUrl(raw: AiRawResult): UrlDetectionResult {
  const score = raw.score ?? 0;
  return {
    prediction: toPrediction(raw),
    risk_score: score,
    reasons: toReasons(raw),
  };
}

function mapImage(raw: AiRawResult): ImageDetectionResult {
  const score = raw.score ?? 0;
  return {
    prediction: toPrediction(raw),
    risk_score: score,
    threat_level: toThreatLevel(score),
    text_preview: raw.qr_payload ?? '',
    reasons: toReasons(raw),
  };
}

function mapAudio(raw: AiRawResult): AudioDetectionResult {
  const score = raw.score ?? 0;
  return {
    prediction: toPrediction(raw),
    confidence: toConfidence(score),
    risk_score: score,
    threat_level: toThreatLevel(score),
    transcription: raw.explanations?.transcript_preview ?? '',
    reasons: toReasons(raw),
  };
}

export async function detectText({ text }: DetectTextParams): Promise<TextDetectionResult> {
  const raw = await aiApi.post<AiRawResult>('/detect/text', { text });
  return mapText(raw);
}

export async function detectUrl({ url }: DetectUrlParams): Promise<UrlDetectionResult> {
  const raw = await aiApi.post<AiRawResult>('/detect/url', { url });
  return mapUrl(raw);
}

export async function detectImage(file: File): Promise<ImageDetectionResult> {
  const formData = new FormData();
  formData.append('file', file);
  const raw = await aiApi.upload<AiRawResult>('/detect/image', formData);
  return mapImage(raw);
}

export async function detectAudio(file: File): Promise<AudioDetectionResult> {
  const formData = new FormData();
  formData.append('file', file);
  const raw = await aiApi.upload<AiRawResult>('/detect/audio', formData);
  return mapAudio(raw);
}

export async function analyze({ text, url }: AnalyzeParams): Promise<AnalyzeResult> {
  const textResult = text ? await detectText({ text }) : undefined;
  const urlResult = url ? await detectUrl({ url }) : undefined;
  const risk_score = Math.max(textResult?.risk_score ?? 0, urlResult?.risk_score ?? 0);
  const threat_level = toThreatLevel(risk_score);
  const recommendation =
    risk_score >= 60
      ? 'Do not proceed. This content shows strong indicators of fraud.'
      : risk_score >= 30
      ? 'Exercise caution. Several suspicious indicators were found.'
      : 'Appears safe based on heuristic analysis.';
  return {
    text: textResult,
    url: urlResult,
    overall: { risk_score, threat_level, recommendation },
    report: '',
    history: '',
  };
}

export async function getHistory(): Promise<HistoryEntry> {
  return api.get<HistoryEntry>('/history/');
}

export function getReportUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || '/api/backend';
  return `${base}/report?path=${encodeURIComponent(path)}`;
}
