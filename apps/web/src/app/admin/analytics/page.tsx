'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { StatCard, PortalCard, SectionTitle, EmptyState } from '@/components/ui/portal-card';
import { apiGet } from '@/lib/portal-api';
import { formatNumber } from '@/lib/utils';

type Scan = {
  id: string;
  inputType: string;
  riskLevel: string;
  riskScore: number;
  isVerified: boolean;
  createdAt: string;
};

export default function AdminAnalyticsPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Scan[]>('/api/scans')
      .then(setScans)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
      </div>
    );
  }

  const totals = {
    text: scans.filter((s) => s.inputType === 'TEXT').length,
    url: scans.filter((s) => s.inputType === 'URL').length,
    image: scans.filter((s) => s.inputType === 'IMAGE').length,
    audio: scans.filter((s) => s.inputType === 'AUDIO').length,
    highRisk: scans.filter((s) => ['HIGH', 'CRITICAL'].includes(s.riskLevel)).length,
    avgRisk: scans.length ? Math.round(scans.reduce((a, s) => a + s.riskScore, 0) / scans.length) : 0,
  };

  const byLevel = {
    LOW: scans.filter((s) => s.riskLevel === 'LOW').length,
    MEDIUM: scans.filter((s) => s.riskLevel === 'MEDIUM').length,
    HIGH: scans.filter((s) => s.riskLevel === 'HIGH').length,
    CRITICAL: scans.filter((s) => s.riskLevel === 'CRITICAL').length,
  };

  const maxLevel = Math.max(1, ...Object.values(byLevel));

  return (
    <div className="space-y-6">
      <SectionTitle title="Analytics" subtitle="Detection statistics" />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total scans" value={formatNumber(scans.length)} icon={<BarChart3 className="h-5 w-5" />} />
        <StatCard label="High / critical" value={totals.highRisk} />
        <StatCard label="Average risk" value={`${totals.avgRisk}%`} />
        <StatCard label="Text scans" value={totals.text} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PortalCard>
          <SectionTitle title="By input type" />
          {scans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Text', value: totals.text, color: 'bg-sky-500' },
                { label: 'URL', value: totals.url, color: 'bg-emerald-500' },
                { label: 'Image', value: totals.image, color: 'bg-violet-500' },
                { label: 'Audio', value: totals.audio, color: 'bg-amber-500' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{row.label}</span>
                    <span className="text-muted-foreground">{row.value}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted">
                    <div
                      className={`h-2.5 rounded-full ${row.color}`}
                      style={{ width: `${scans.length ? (row.value / scans.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </PortalCard>

        <PortalCard>
          <SectionTitle title="By risk level" />
          {scans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((level) => (
                <div key={level}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{level}</span>
                    <span className="text-muted-foreground">{byLevel[level]}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted">
                    <div
                      className={`h-2.5 rounded-full ${
                        level === 'LOW'
                          ? 'bg-emerald-500'
                          : level === 'MEDIUM'
                          ? 'bg-amber-500'
                          : level === 'HIGH'
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${(byLevel[level] / maxLevel) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </PortalCard>
      </div>

      {scans.length === 0 && (
        <EmptyState
          icon={<BarChart3 className="h-6 w-6" />}
          title="No scan data"
          description="Run scans from the investor portal to see analytics here."
        />
      )}
    </div>
  );
}
