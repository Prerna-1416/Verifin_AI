'use client';

import { useEffect, useState } from 'react';
import { Building2, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalCard, EmptyState, Badge, SectionTitle } from '@/components/ui/portal-card';
import { apiGet, apiPost } from '@/lib/portal-api';
import { formatDate } from '@/lib/utils';

type Institution = {
  id: string;
  name: string;
  registrationNo: string;
  website: string | null;
  isVerified: boolean;
  createdAt: string;
  owner: { name: string | null; email: string } | null;
  _count: { notices: number };
};

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await apiGet<Institution[]>('/api/admin/institutions');
      setInstitutions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load institutions');
    } finally {
      setLoading(false);
    }
  }

  async function setVerified(id: string, isVerified: boolean) {
    setActing(id);
    try {
      await apiPost(`/api/admin/institutions/${id}/verify`, { isVerified });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update verification status');
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

  return (
    <div className="space-y-6">
      <SectionTitle title="Institutions" subtitle="Verify registered institutions" />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {institutions.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="No institutions yet"
          description="Institutions register from the institution portal."
        />
      ) : (
        <div className="space-y-4">
          {institutions.map((inst) => (
            <PortalCard key={inst.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold">{inst.name}</h3>
                    {inst.isVerified ? (
                      <Badge tone="success"><Check className="h-3 w-3" /> Verified</Badge>
                    ) : (
                      <Badge tone="warning">Pending</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reg. No. {inst.registrationNo}
                    {inst.website ? ` · ${inst.website}` : ''}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Owner: {inst.owner ? inst.owner.name || inst.owner.email : 'Unknown'} · Registered{' '}
                    {formatDate(inst.createdAt)} · {inst._count.notices} notice(s)
                  </p>
                </div>
                {inst.isVerified ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={acting === inst.id}
                    onClick={() => setVerified(inst.id, false)}
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" /> Unverify
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={acting === inst.id}
                    onClick={() => setVerified(inst.id, true)}
                  >
                    <Check className="mr-1.5 h-3.5 w-3.5" /> Verify
                  </Button>
                )}
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </div>
  );
}
