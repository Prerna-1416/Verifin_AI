'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, Loader2, ExternalLink } from 'lucide-react';
import { PortalCard, EmptyState, Badge, SectionTitle } from '@/components/ui/portal-card';
import { apiGet } from '@/lib/portal-api';
import { formatDate, truncate } from '@/lib/utils';

type Threat = {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  source: string;
  sourceUrl: string | null;
  publishedAt: string;
};

export default function PublicThreatsPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Threat[]>('/api/threats')
      .then(setThreats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load threats'))
      .finally(() => setLoading(false));
  }, []);

  const severityTone = (s: string): 'danger' | 'warning' | 'info' => {
    if (s === 'CRITICAL' || s === 'HIGH') return 'danger';
    if (s === 'MEDIUM') return 'warning';
    return 'info';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Threat Feed"
        subtitle="Public threat intelligence relevant to investors"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {threats.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert className="h-6 w-6" />}
          title="No active threats"
          description="There are no published threats at this time."
        />
      ) : (
        <div className="space-y-4">
          {threats.map((threat) => (
            <PortalCard key={threat.id}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold">{threat.title}</h3>
                <Badge tone={severityTone(threat.severity)}>{threat.severity}</Badge>
                <Badge tone="neutral">{threat.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{truncate(threat.description, 260)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Source: {threat.source}
                </span>
                <span>·</span>
                <span>Published {formatDate(threat.publishedAt)}</span>
                {threat.sourceUrl && (
                  <>
                    <span>·</span>
                    <a
                      href={threat.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-foreground hover:underline"
                    >
                      Read more <ExternalLink className="h-3 w-3" />
                    </a>
                  </>
                )}
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </div>
  );
}
