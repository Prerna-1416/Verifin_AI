import { api } from '@/lib/api';
import type {
  AnalyzeResult,
  AudioDetectionResult,
  HistoryEntry,
  ImageDetectionResult,
  TextDetectionResult,
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

export async function detectText({ text }: DetectTextParams): Promise<TextDetectionResult> {
  return api.post<TextDetectionResult>('/text/detect', { text });
}

export async function detectUrl({ url }: DetectUrlParams): Promise<UrlDetectionResult> {
  return api.post<UrlDetectionResult>('/url/detect', { url });
}

export async function detectImage(file: File): Promise<ImageDetectionResult> {
  const formData = new FormData();
  formData.append('file', file);
  return api.upload<ImageDetectionResult>('/image/detect', formData);
}

export async function detectAudio(file: File): Promise<AudioDetectionResult> {
  const formData = new FormData();
  formData.append('file', file);
  return api.upload<AudioDetectionResult>('/audio/detect', formData);
}

export async function analyze({ text, url }: AnalyzeParams): Promise<AnalyzeResult> {
  return api.post<AnalyzeResult>('/analyze/', { text, url });
}

export async function getHistory(): Promise<HistoryEntry> {
  return api.get<HistoryEntry>('/history/');
}

export function getReportUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || '/api/backend';
  return `${base}/report?path=${encodeURIComponent(path)}`;
}
