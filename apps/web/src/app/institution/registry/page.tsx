'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Library, Loader2, FileSignature, Clock, Ban, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalCard, EmptyState, Badge, SectionTitle } from '@/components/ui/portal-card';
import { apiGet } from '@/lib/portal-api';
import { formatDate, truncate } from '@/lib/utils';

type Notice = {
  id: string;
  title: string;
  content: string;
  status: string;
  signedBy: string;
  signedAt: string;
  expiresAt: string | null;
  qrCodes: Array<{ id: string }>;
};

export default function InstitutionRegistryPage() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Notice[]>('/api/notices')
      .then(setNotices)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load notices'))
      .finally(() => setLoading(false));
  }, []);

  const statusTone = (status: string): 'success' | 'warning' | 'danger' | 'neutral' => {
    if (status === 'ACTIVE') return 'success';
    if (status === 'EXPIRED') return 'warning';
    if (status === 'REVOKED') return 'danger';
    return 'neutral';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
      </div>
    );
  }

  if (error && notices.length === 0) {
    return (
      <EmptyState
        icon={<Library className="h-6 w-6" />}
        title="Could not load notices"
        description={error}
        action={<Button variant="outline" onClick={() => router.refresh()}>Retry</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Registered Notices"
        subtitle={`${notices.length} notice${notices.length === 1 ? '' : 's'} on file`}
      />

      {notices.length === 0 ? (
        <EmptyState
          icon={<Library className="h-6 w-6" />}
          title="No notices yet"
          description="Register your first notice to start publishing verified content."
          action={
            <Button onClick={() => router.push('/institution/register-notice')}>
              Register a notice
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {notices.map((notice) => (
            <PortalCard key={notice.id}>
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold">{notice.title}</h3>
                <Badge tone={statusTone(notice.status)}>{notice.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{truncate(notice.content, 200)}</p>

              <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <FileSignature className="h-3.5 w-3.5" />
                  Signed by {notice.signedBy} on {formatDate(notice.signedAt)}
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {notice.expiresAt
                    ? `Expires ${formatDate(notice.expiresAt)}`
                    : 'No expiration'}
                </p>
                <p className="flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5" />
                  {notice.qrCodes.length
                    ? `${notice.qrCodes.length} QR code(s) generated`
                    : 'No QR code yet'}
                </p>
                {notice.status === 'ACTIVE' && !notice.qrCodes.length && (
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push('/institution/qr-generator')}
                    >
                      Generate QR
                    </Button>
                  </div>
                )}
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </div>
  );
}
