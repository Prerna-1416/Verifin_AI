'use client';

import { useEffect, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { PortalCard, EmptyState, SectionTitle } from '@/components/ui/portal-card';
import { apiGet } from '@/lib/portal-api';
import { formatDate } from '@/lib/utils';

type Scan = {
  id: string;
  inputType: string;
  inputContent: string;
  riskScore: number;
  riskLevel: string;
  createdAt: string;
};

export default function InstitutionReportsPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Scan[]>('/api/scans')
      .then(setScans)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Reports" subtitle="Detection activity available for review" />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {scans.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No scans yet"
          description="Detection reports appear here once scans are performed."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Input</th>
                <th className="px-4 py-3 font-medium">Risk</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => (
                <tr key={scan.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{scan.inputType}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                    {scan.inputContent}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {scan.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3">{Math.round(scan.riskScore)}%</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(scan.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
