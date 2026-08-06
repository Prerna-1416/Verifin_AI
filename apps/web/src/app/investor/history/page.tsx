'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { History as HistoryIcon, FileJson, ScanSearch, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';
import { apiGet } from '@/lib/portal-api';

interface SavedScan {
  id: string;
  inputType: string;
  inputContent: string | null;
  riskScore: number;
  riskLevel: string;
  isVerified: boolean;
  createdAt: string;
}

export default function HistoryPage() {
  const [scans, setScans] = useState<SavedScan[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<SavedScan[]>('/api/scans')
      .then(setScans)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  const riskColor = (level: string) =>
    cn(
      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
      level === 'LOW' && 'bg-success-50 text-success-600',
      level === 'MEDIUM' && 'bg-warning-50 text-warning-600',
      level === 'HIGH' && 'bg-orange-50 text-orange-600',
      level === 'CRITICAL' && 'bg-destructive/10 text-destructive'
    );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-elegant">
            <HistoryIcon className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-heading-lg font-bold tracking-tight text-foreground">Scan history</h2>
            <p className="text-sm text-muted-foreground">
              {scans ? `${scans.length} scan${scans.length === 1 ? '' : 's'} recorded` : 'Your past verifications'}
            </p>
          </div>
        </div>
        <Link href="/investor/scanner">
          <Button size="sm">
            <ScanSearch className="mr-2 h-4 w-4" />
            New scan
          </Button>
        </Link>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-16 shadow-glass">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your scan history…</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-glass">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && scans && scans.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 shadow-glass">
          <FileJson className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No scans yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Run a scan in the AI Scanner to see it here.</p>
          <Link href="/investor/scanner" className="mt-4">
            <Button size="sm">Start your first scan</Button>
          </Link>
        </div>
      )}

      {!loading && !error && scans && scans.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-glass">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Input</th>
                <th className="px-5 py-3 font-semibold">Risk</th>
                <th className="px-5 py-3 font-semibold">Score</th>
                <th className="px-5 py-3 font-semibold">When</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => (
                <tr key={scan.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium text-foreground">{scan.inputType}</td>
                  <td className="max-w-[240px] truncate px-5 py-3 text-muted-foreground">
                    {scan.inputContent || '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={riskColor(scan.riskLevel)}>{scan.riskLevel}</span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{Math.round(scan.riskScore)}%</td>
                  <td className="px-5 py-3 text-muted-foreground" title={formatDate(scan.createdAt)}>
                    {formatRelativeTime(scan.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
