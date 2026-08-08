'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  BadgeCheck,
  XCircle,
  Loader2,
  FileSignature,
  Building2,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { PortalCard, Badge } from '@/components/ui/portal-card';
import { formatDate } from '@/lib/utils';

type VerifyData = {
  status: 'valid' | 'revoked';
  data: {
    notice: {
      id: string;
      title: string;
      content: string;
      signedBy: string;
      signedAt: string;
      documentUrl: string | null;
      expiresAt: string | null;
      signature: string;
    };
    institution: {
      id: string;
      name: string;
      registrationNo: string;
      website: string | null;
      isVerified: boolean;
    };
  } | null;
};

export default function VerifyPage() {
  const params = useParams<{ qrId: string }>();
  const [result, setResult] = useState<VerifyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.qrId) {
      setError('Missing verification code');
      setLoading(false);
      return;
    }
    // The verify API returns `{ success, status, data }` — read it raw so the
    // wrapper's `status` and `data` remain intact (apiGet unwraps them).
    fetch(`/api/verify/${params.qrId}`, { cache: 'no-store' })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || `Request failed (${res.status})`);
        const result: VerifyData = {
          status: json.status as VerifyData['status'],
          data: json.data ?? null,
        };
        setResult(result);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Verification failed'))
      .finally(() => setLoading(false));
  }, [params?.qrId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold">Verification failed</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {error || 'This code could not be verified.'}
        </p>
      </div>
    );
  }

  if (result.status === 'revoked' || !result.data) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <XCircle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
        <h2 className="text-xl font-bold">Notice is no longer active</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This notice has expired or been revoked.
        </p>
      </div>
    );
  }

  const { notice, institution } = result.data;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      <div className="flex flex-col items-center text-center">
        <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <BadgeCheck className="h-7 w-7" />
        </span>
        <h2 className="text-2xl font-bold">Notice Verified</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This notice is authentic and issued by a registered institution.
        </p>
      </div>

      <PortalCard>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              {institution.name}
              {institution.isVerified ? (
                <Badge tone="success">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </Badge>
              ) : (
                <Badge tone="warning">Unverified</Badge>
              )}
            </p>
            <h3 className="mt-2 text-lg font-semibold">{notice.title}</h3>
          </div>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {notice.content}
        </p>

        <div className="mt-5 space-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <FileSignature className="h-3.5 w-3.5" />
            Signed by {notice.signedBy} on {formatDate(notice.signedAt)}
          </p>
          <p className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {notice.expiresAt ? `Valid until ${formatDate(notice.expiresAt)}` : 'No expiration'}
          </p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Signature: <span className="font-mono">{notice.signature.slice(0, 16)}...</span>
          </p>
        </div>
      </PortalCard>
    </div>
  );
}
