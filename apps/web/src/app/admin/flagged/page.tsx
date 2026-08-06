'use client';

import { useEffect, useState } from 'react';
import { Flag, Loader2, Check, X, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalCard, EmptyState, Badge, SectionTitle } from '@/components/ui/portal-card';
import { apiGet, apiPost } from '@/lib/portal-api';
import { formatDate } from '@/lib/utils';

type Flagged = {
  id: string;
  reason: string;
  action: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  scan: {
    id: string;
    inputType: string;
    inputContent: string;
    riskLevel: string;
    riskScore: number;
    user: { name: string | null; email: string } | null;
  };
};

export default function AdminFlaggedPage() {
  const [items, setItems] = useState<Flagged[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await apiGet<Flagged[]>('/api/admin/flagged');
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flagged content');
    } finally {
      setLoading(false);
    }
  }

  async function review(id: string, action: string) {
    setActing(id);
    try {
      await apiPost(`/api/admin/flagged/${id}`, { action });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update flag');
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
      </div>
    );
  }

  const actionTone = (a: string): 'danger' | 'success' | 'warning' | 'neutral' | 'info' => {
    if (a === 'CONFIRMED_THREAT') return 'danger';
    if (a === 'FALSE_POSITIVE') return 'success';
    if (a === 'ESCALATED') return 'warning';
    if (a === 'PENDING') return 'info';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Flagged Content" subtitle="Review content flagged by automated detection" />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {items.length === 0 ? (
        <EmptyState
          icon={<Flag className="h-6 w-6" />}
          title="Nothing flagged"
          description="No flagged content requires review."
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <PortalCard key={item.id}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge tone={actionTone(item.action)}>{item.action}</Badge>
                  <Badge tone="neutral">{item.scan.inputType}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                {item.action === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={acting === item.id}
                      onClick={() => review(item.id, 'FALSE_POSITIVE')}
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" /> False positive
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={acting === item.id}
                      onClick={() => review(item.id, 'CONFIRMED_THREAT')}
                    >
                      <Check className="mr-1.5 h-3.5 w-3.5" /> Confirm threat
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-sm font-medium">{item.reason}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {item.scan.inputContent}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>User: {item.scan.user ? item.scan.user.name || item.scan.user.email : 'Anonymous'}</span>
                <span>·</span>
                <span>
                  Risk: {item.scan.riskLevel} · {Math.round(item.scan.riskScore)}%
                </span>
                {item.reviewedAt && (
                  <>
                    <span>·</span>
                    <span>Reviewed {formatDate(item.reviewedAt)}</span>
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
