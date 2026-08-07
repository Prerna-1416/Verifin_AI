'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  FileText,
  Link2,
  Image as ImageIcon,
  AudioLines,
  ShieldCheck,
  ShieldAlert,
  Download,
  Loader2,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Cpu,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  useDetectAudio,
  useDetectImage,
  useDetectText,
  useDetectUrl,
  useAnalyze,
} from '@/hooks/use-scan';
import type { ScanResultSummary } from '@/api/mappers';
import { getRiskColor } from '@/lib/utils';
import { toast } from 'sonner';

type InputMode = 'text' | 'url' | 'image' | 'audio';

const tabs: { mode: InputMode; label: string; icon: typeof FileText }[] = [
  { mode: 'text', label: 'Text', icon: FileText },
  { mode: 'url', label: 'URL', icon: Link2 },
  { mode: 'image', label: 'Image', icon: ImageIcon },
  { mode: 'audio', label: 'Audio', icon: AudioLines },
];

export default function ScannerPage() {
  const { data: session } = useSession();
  const [mode, setMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ScanResultSummary | null>(null);
  const [reportPath, setReportPath] = useState<string | null>(null);

  const detectText = useDetectText();
  const detectUrl = useDetectUrl();
  const detectImage = useDetectImage();
  const detectAudio = useDetectAudio();
  const analyze = useAnalyze();

  const isScanning =
    detectText.isPending || detectUrl.isPending || detectImage.isPending || detectAudio.isPending || analyze.isPending;

  function reset() {
    setResult(null);
    setReportPath(null);
  }

  async function handleScan() {
    reset();
    let data: ScanResultSummary | null = null;
    let analyzed: Awaited<ReturnType<typeof analyze.mutateAsync>> | null = null;

    try {
      if (mode === 'text') {
        if (text.trim().length < 10) {
          toast.error('Enter at least 10 characters of text');
          return;
        }
        const r = await detectText.mutateAsync({ text: text.trim() });
        data = {
          prediction: r.prediction,
          riskScore: r.risk_score,
          riskLevel: mapLevel(r.threat_level),
          confidence: r.confidence,
          reasons: r.reasons ?? [],
          privacy: r.privacy,
          ensemble: r.ensemble,
          inputRedacted: r.input_redacted,
        };
        analyzed = await analyze.mutateAsync({ text: text.trim() });
      } else if (mode === 'url') {
        if (!/^https?:\/\//i.test(url.trim())) {
          toast.error('Enter a valid URL starting with http:// or https://');
          return;
        }
        const r = await detectUrl.mutateAsync({ url: url.trim() });
        data = {
          prediction: r.prediction,
          riskScore: r.risk_score,
          riskLevel: mapLevel(mapFromScore(r.risk_score)),
          reasons: r.reasons ?? [],
        };
        analyzed = await analyze.mutateAsync({ url: url.trim() });
      } else if (mode === 'image') {
        if (!file) {
          toast.error('Choose an image to scan');
          return;
        }
        const r = await detectImage.mutateAsync(file);
        data = {
          prediction: r.prediction,
          riskScore: r.risk_score,
          riskLevel: mapLevel(r.threat_level),
          reasons: r.reasons ?? [],
          textPreview: r.text_preview,
        };
      } else if (mode === 'audio') {
        if (!file) {
          toast.error('Choose an audio file to scan');
          return;
        }
        const r = await detectAudio.mutateAsync(file);
        data = {
          prediction: r.prediction,
          riskScore: r.risk_score,
          riskLevel: mapLevel(r.threat_level),
          confidence: r.confidence,
          reasons: r.reasons ?? [],
          transcription: r.transcription,
        };
      }

      if (data) setResult(data);
      if (analyzed?.report) setReportPath(analyzed.report);

      if (data) {
        saveScan(mode, data, text || url || file?.name || null, isFlagged(data));
      }
    } catch {
      // error toast handled in mutation onError
    }
  }

  async function saveScan(
    kind: string,
    data: ScanResultSummary,
    input: string | null,
    isFlagged: boolean
  ) {
    try {
      await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          input,
          prediction: data.prediction,
          confidence: typeof data.confidence === 'number' ? data.confidence : null,
          riskScore: data.riskScore,
          threatLevel: data.riskLevel,
          reasons: data.reasons,
          isFlagged,
          transcript: data.transcription || data.textPreview || null,
        }),
      });
    } catch {
      // non-fatal: scan result already shown
    }
  }

  function isFlagged(data: ScanResultSummary): boolean {
    return data.riskLevel === 'HIGH' || data.riskLevel === 'CRITICAL';
  }

  function mapLevel(level: string): ScanResultSummary['riskLevel'] {
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

  function mapFromScore(score: number): string {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 30) return 'Medium';
    return 'Low';
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-elegant">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-heading-lg font-bold tracking-tight text-foreground">AI Scanner</h2>
          <p className="text-sm text-muted-foreground">
            Signed in as {session?.user?.email} — analyze anything suspicious.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-glass">
        <div className="mb-6 grid grid-cols-4 gap-2 rounded-xl bg-muted p-1">
          {tabs.map((tab) => (
            <button
              key={tab.mode}
              onClick={() => {
                setMode(tab.mode);
                reset();
              }}
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors',
                mode === tab.mode
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {mode === 'text' && (
            <div>
              <Label htmlFor="text-input">Message to analyze</Label>
              <textarea
                id="text-input"
                rows={6}
                className="w-full rounded-xl border border-input bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Paste a suspicious SMS, email, or chat message here…"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">{text.length} / 50000 characters</p>
            </div>
          )}

          {mode === 'url' && (
            <div>
              <Label htmlFor="url-input">Link to analyze</Label>
              <Input
                id="url-input"
                placeholder="https://example.com/suspicious-link"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          )}

          {(mode === 'image' || mode === 'audio') && (
            <div>
              <Label>{mode === 'image' ? 'Image to analyze' : 'Audio file to analyze'}</Label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-input bg-muted/40 px-6 py-10 text-center transition-colors hover:border-primary hover:bg-primary-50/40">
                <UploadCloud className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  {file ? file.name : mode === 'image' ? 'Click to choose an image' : 'Click to choose an audio file'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : 'PNG, JPG, WEBP up to 50MB'}
                </p>
                <input
                  type="file"
                  accept={mode === 'image' ? 'image/*' : 'audio/*'}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            loading={isScanning}
            disabled={isScanning}
            onClick={handleScan}
          >
            {isScanning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isScanning ? 'Analyzing with AI…' : 'Scan now'}
          </Button>
        </div>
      </div>

      {result && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-glass animate-slide-up">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Risk score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-display-sm font-bold tracking-tight">{result.riskScore}</span>
                <span className="text-lg text-muted-foreground">/ 100</span>
              </div>
              <div className="mt-1 h-2.5 w-56 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    result.riskLevel === 'LOW' && 'bg-success-500',
                    result.riskLevel === 'MEDIUM' && 'bg-warning-500',
                    result.riskLevel === 'HIGH' && 'bg-orange-500',
                    result.riskLevel === 'CRITICAL' && 'bg-destructive'
                  )}
                  style={{ width: `${result.riskScore}%` }}
                />
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm font-medium text-muted-foreground">Threat level</p>
              <span
                className={cn(
                  'mt-1 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold',
                  getRiskColor(result.riskLevel)
                )}
              >
                {result.riskLevel === 'LOW' ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                {result.riskLevel}
              </span>
              <p className="mt-2 flex items-center justify-start gap-1.5 text-sm font-medium sm:justify-end">
                {result.prediction === 'Malicious' ? (
                  <XCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-success-600" />
                )}
                {result.prediction}
              </p>
              {typeof result.confidence === 'number' && (
                <p className="mt-1 text-xs text-muted-foreground">Model confidence: {result.confidence}%</p>
              )}
            </div>
          </div>

          {result.transcription && (
            <div className="mt-6 rounded-xl bg-muted p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Transcription</p>
              <p className="text-sm text-foreground">{result.transcription}</p>
            </div>
          )}

          {result.textPreview && (
            <div className="mt-6 rounded-xl bg-muted p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Detected text in image</p>
              <p className="text-sm text-foreground">{result.textPreview}</p>
            </div>
          )}

          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-foreground">Why this verdict</p>
            {result.reasons.length > 0 ? (
              <ul className="space-y-1.5">
                {result.reasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {reason}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No suspicious indicators detected.</p>
            )}
          </div>

          {result.ensemble && (
            <div className="mt-6 rounded-xl border border-border p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Cpu className="h-3.5 w-3.5" />
                </span>
                Ensemble AI breakdown
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Rule engines', value: `${result.ensemble.contributions.rule_engine.score}/100`, weight: `${Math.round(result.ensemble.contributions.rule_engine.weight * 100)}% weight`, verdict: result.ensemble.rule_verdict },
                  { label: 'ML classifier', value: `${result.ensemble.contributions.ml_classifier.score}/100`, weight: `${Math.round(result.ensemble.contributions.ml_classifier.weight * 100)}% weight`, verdict: result.ensemble.ml_verdict },
                  { label: 'Ensemble confidence', value: `${Math.round(result.ensemble.confidence * 100)}%`, weight: `consensus: ${result.ensemble.consensus}`, verdict: result.ensemble.consensus === 'agree' ? 'Agreeing signals' : 'Differing signals' },
                ].map((c) => (
                  <div key={c.label} className="rounded-xl bg-muted/40 p-3">
                    <div className="text-xs text-muted-foreground">{c.label}</div>
                    <div className="text-sm font-semibold">{c.value}</div>
                    <div className="text-xs text-muted-foreground">{c.weight}</div>
                    <div className="text-xs capitalize text-primary">{c.verdict}</div>
                  </div>
                ))}
              </div>
              {result.ensemble.explanation && (
                <p className="mt-3 text-sm text-muted-foreground">{result.ensemble.explanation}</p>
              )}
            </div>
          )}

          {result.privacy && result.privacy.pii_count > 0 && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="mb-1 flex items-center gap-2 font-semibold">
                <Lock className="h-4 w-4" /> Privacy Shield active — {result.privacy.pii_count} PII items redacted locally
              </p>
              <p className="text-emerald-700">
                {result.privacy.pii_types_found.join(', ')} removed before analysis.
                {result.inputRedacted && (
                  <span className="mt-1 block font-mono text-xs opacity-80">Analyzed as: {result.inputRedacted}</span>
                )}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {reportPath && (
              <a href={`/api/backend/report?path=${encodeURIComponent(reportPath)}`} target="_blank" rel="noreferrer">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF report
                </Button>
              </a>
            )}
            <Link href="/investor/history">
              <Button variant="ghost">View history</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
