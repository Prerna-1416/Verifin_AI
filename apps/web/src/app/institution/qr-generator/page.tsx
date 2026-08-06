'use client';

import { useEffect, useState } from 'react';
import { QrCode, Loader2, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalCard, EmptyState, Badge } from '@/components/ui/portal-card';
import { apiGet, apiPost } from '@/lib/portal-api';
import { formatDate } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

type Notice = {
  id: string;
  title: string;
  status: string;
  signedAt: string;
  qrCodes: Array<{ id: string; payload: string; qrImageUrl: string }>;
};

export default function QrGeneratorPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadNotices();
  }, []);

  async function loadNotices() {
    setLoading(true);
    try {
      const data = await apiGet<Notice[]>('/api/notices');
      setNotices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  }

  async function generateQr(noticeId: string) {
    setGenerating(noticeId);
    setError(null);
    try {
      await apiPost(`/api/notices/${noticeId}/qr`);
      await loadNotices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR');
    } finally {
      setGenerating(null);
    }
  }

  async function copyPayload(payload: string, id: string) {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  }

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
        icon={<QrCode className="h-6 w-6" />}
        title="Could not load notices"
        description={error}
        action={<Button variant="outline" onClick={loadNotices}>Retry</Button>}
      />
    );
  }

  if (notices.length === 0) {
    return (
      <EmptyState
        icon={<QrCode className="h-6 w-6" />}
        title="No notices yet"
        description="Register a notice first, then generate its QR code."
        action={
          <Button onClick={() => (window.location.href = '/institution/register-notice')}>
            Register a notice
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">QR Code Generator</h2>
        <p className="text-sm text-muted-foreground">
          Generate a verifiable QR code for each signed notice.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notices.map((notice) => {
          const qr = notice.qrCodes[0];
          return (
            <PortalCard key={notice.id} className="flex flex-col">
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-sm font-semibold">{notice.title}</h3>
                <Badge tone={notice.status === 'ACTIVE' ? 'success' : 'neutral'}>
                  {notice.status}
                </Badge>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                Signed {formatDate(notice.signedAt)}
              </p>

              {qr ? (
                <div className="flex flex-col items-center">
                  <div className="rounded-xl border border-border bg-white p-3">
                    <QRCodeSVG value={qr.payload} size={160} />
                  </div>
                  <div className="mt-3 flex w-full gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => copyPayload(qr.payload, qr.id)}
                    >
                      {copied === qr.id ? (
                        <Check className="mr-1.5 h-4 w-4" />
                      ) : (
                        <Copy className="mr-1.5 h-4 w-4" />
                      )}
                      Copy payload
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={generateQr.bind(null, notice.id)}
                      disabled={generating === notice.id}
                    >
                      <RefreshCw
                        className={generating === notice.id ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
                      />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border py-8">
                  <Button
                    variant="outline"
                    onClick={() => generateQr(notice.id)}
                    disabled={generating === notice.id}
                  >
                    {generating === notice.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <QrCode className="mr-2 h-4 w-4" />
                    )}
                    Generate QR
                  </Button>
                </div>
              )}
            </PortalCard>
          );
        })}
      </div>
    </div>
  );
}
