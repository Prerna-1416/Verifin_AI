'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  analyze,
  detectAudio,
  detectImage,
  detectText,
  detectUrl,
  getHistory,
} from '@/api/detection';
import { mapAudioResult, mapImageResult, mapTextResult, mapUrlResult } from '@/api/mappers';
import type { ScanResultSummary } from '@/api/mappers';
import type { AnalyzeResult } from '@/api/types';

function errorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: string; message?: string } } }).response;
    return response?.data?.detail ?? response?.data?.message ?? 'Backend request failed';
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}

export function useDetectText() {
  return useMutation({
    mutationFn: detectText,
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useDetectUrl() {
  return useMutation({
    mutationFn: detectUrl,
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useDetectImage() {
  return useMutation({
    mutationFn: detectImage,
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useDetectAudio() {
  return useMutation({
    mutationFn: detectAudio,
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useAnalyze() {
  return useMutation({
    mutationFn: analyze,
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useHistory() {
  return useQuery({
    queryKey: ['history'],
    queryFn: getHistory,
  });
}

export function toSummary(
  inputType: 'text' | 'url' | 'image' | 'audio',
  result: AnalyzeResult | unknown
): ScanResultSummary | null {
  if (!result) return null;

  if (inputType === 'text' && 'risk_score' in (result as Record<string, unknown>)) {
    return mapTextResult(result as Parameters<typeof mapTextResult>[0]);
  }
  if (inputType === 'url' && 'risk_score' in (result as Record<string, unknown>)) {
    return mapUrlResult(result as Parameters<typeof mapUrlResult>[0]);
  }
  if (inputType === 'image' && 'risk_score' in (result as Record<string, unknown>)) {
    return mapImageResult(result as Parameters<typeof mapImageResult>[0]);
  }
  if (inputType === 'audio' && 'risk_score' in (result as Record<string, unknown>)) {
    return mapAudioResult(result as Parameters<typeof mapAudioResult>[0]);
  }
  return null;
}
