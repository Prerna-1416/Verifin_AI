'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Building2,
  FilePlus2,
  QrCode,
  BadgeCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/card';
import { Label } from '@/components/ui/card';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type Institution = {
  id: string;
  name: string;
  registrationNo: string;
  website?: string | null;
  isVerified: boolean;
};

export default function InstitutionDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', registrationNo: '', website: '', logoUrl: '' });

  useEffect(() => {
    fetch('/api/institutions')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setInstitution(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function createInstitution(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to create institution');
        return;
      }
      setInstitution(json.data);
      router.refresh();
    } catch {
      setError('Failed to create institution');
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Building2 className="h-6 w-6" />
            </div>
            <CardTitle>Register your institution</CardTitle>
            <CardDescription>
              Welcome{session?.user?.name ? `, ${session.user.name}` : ''}! Create your institution
              profile to start publishing digitally signed notices.
            </CardDescription>
          </CardHeader>
          <div>
            <form onSubmit={createInstitution} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Institution name</Label>
                <Input
                  id="name"
                  required
                  minLength={2}
                  placeholder="e.g. National Securities Board"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg">Registration number</Label>
                <Input
                  id="reg"
                  required
                  minLength={5}
                  placeholder="e.g. NSB-2024-00123"
                  value={form.registrationNo}
                  onChange={(e) => setForm({ ...form, registrationNo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.gov.in"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  'Create institution'
                )}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{institution.name}</h2>
          <p className="text-sm text-muted-foreground">
            Reg. No. {institution.registrationNo}
            {institution.website ? ` · ${institution.website}` : ''}
          </p>
        </div>
        {institution.isVerified ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            <Clock className="h-3.5 w-3.5" /> Pending verification
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="max-w-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FilePlus2 className="h-4 w-4 text-emerald-600" /> Register a Notice
            </CardTitle>
          </CardHeader>
          <div>
            <p className="text-sm text-muted-foreground">
              Publish a digitally signed advisory, circular, or alert for investors.
            </p>
            <Button className="mt-4 w-full" onClick={() => router.push('/institution/register-notice')}>
              Create notice <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
        <Card className="max-w-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-4 w-4 text-emerald-600" /> Generate QR Codes
            </CardTitle>
          </CardHeader>
          <div>
            <p className="text-sm text-muted-foreground">
              Generate verifiable QR codes that link to your signed notices.
            </p>
            <Button className="mt-4 w-full" variant="outline" onClick={() => router.push('/institution/qr-generator')}>
              Open QR generator <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
        <Card className="max-w-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-emerald-600" /> Trusted Content
            </CardTitle>
          </CardHeader>
          <div>
            <p className="text-sm text-muted-foreground">
              Investor-facing notices you publish appear in the public registry once verified.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
