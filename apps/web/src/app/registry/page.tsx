'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Loader2, BadgeCheck, FileText, ExternalLink } from 'lucide-react';
import { PortalCard, EmptyState, Badge, SectionTitle } from '@/components/ui/portal-card';
import { apiGet } from '@/lib/portal-api';
import { formatDate } from '@/lib/utils';

type RegistryEntry = {
  id: string;
  name: string;
  registrationNo: string;
  website: string | null;
  _count: { notices: number };
  notices: Array<{ id: string; title: string; signedAt: string }>;
};

export default function PublicRegistryPage() {
  const [entries, setEntries] = useState<RegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<RegistryEntry[]>('/api/registry')
      .then(setEntries)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load registry'))
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
      <SectionTitle
        title="Verified Institutions Registry"
        subtitle="Public directory of verified institutions and their active notices"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {entries.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="No verified institutions yet"
          description="Once institutions are verified by admins, they appear here."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {entries.map((entry) => (
            <PortalCard key={entry.id}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-base font-semibold">
                    {entry.name}
                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Reg. No. {entry.registrationNo}
                    {entry.website ? ` · ${entry.website}` : ''}
                  </p>
                </div>
                <Badge tone="neutral">{entry._count.notices} notice(s)</Badge>
              </div>

              {entry.notices.length > 0 && (
                <ul className="space-y-1.5 border-t border-border pt-3">
                  {entry.notices.map((notice) => (
                    <li key={notice.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <Link
                          href={`/verify/${notice.id}`}
                          className="truncate text-foreground hover:underline"
                        >
                          {notice.title}
                        </Link>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(notice.signedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </PortalCard>
          ))}
        </div>
      )}
    </div>
  );
}
