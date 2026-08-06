'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/card';
import { PortalCard, EmptyState, Badge, SectionTitle } from '@/components/ui/portal-card';
import { apiGet, apiPost } from '@/lib/portal-api';
import { formatDate, truncate } from '@/lib/utils';

type Threat = {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  source: string;
  sourceUrl: string | null;
  isActive: boolean;
  publishedAt: string;
};

export default function AdminThreatsPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'PHISHING',
    severity: 'HIGH',
    source: '',
    sourceUrl: '',
  });

  useEffect(() => {
    loadThreats();
  }, []);

  async function loadThreats() {
    setLoading(true);
    try {
      const data = await apiGet<Threat[]>('/api/admin/threats');
      setThreats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load threats');
    } finally {
      setLoading(false);
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiPost('/api/admin/threats', {
        ...form,
        indicators: {},
        sourceUrl: form.sourceUrl || undefined,
      });
      setForm({ title: '', description: '', type: 'PHISHING', severity: 'HIGH', source: '', sourceUrl: '' });
      setShowForm(false);
      await loadThreats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create threat');
    } finally {
      setSubmitting(false);
    }
  }

  const severityTone = (s: string): 'danger' | 'warning' | 'info' | 'success' => {
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
      <div className="flex items-center justify-between">
        <SectionTitle title="Threat Feed" subtitle="Published threat intelligence" />
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="mr-1.5 h-4 w-4" /> New threat
        </Button>
      </div>

      {showForm && (
        <PortalCard>
          <form onSubmit={onCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="t-title">Title</Label>
                <Input
                  id="t-title"
                  required
                  minLength={5}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. New phishing campaign"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-source">Source</Label>
                <Input
                  id="t-source"
                  required
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  placeholder="e.g. CERT-IN"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-type">Type</Label>
                <select
                  id="t-type"
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {['PHISHING', 'MALWARE', 'SCAM', 'FRAUD', 'IMPERSONATION', 'DATA_LEAK', 'OTHER'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-sev">Severity</Label>
                <select
                  id="t-sev"
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                >
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="t-desc">Description</Label>
                <textarea
                  id="t-desc"
                  required
                  minLength={20}
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="t-url">Source URL (optional)</Label>
                <Input
                  id="t-url"
                  type="url"
                  value={form.sourceUrl}
                  onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Publish threat
            </Button>
          </form>
        </PortalCard>
      )}

      {error && !showForm && <p className="text-sm text-red-600">{error}</p>}

      {threats.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert className="h-6 w-6" />}
          title="No threats published"
          description="Publish your first threat intelligence item."
        />
      ) : (
        <div className="space-y-4">
          {threats.map((threat) => (
            <PortalCard key={threat.id}>
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold">{threat.title}</h3>
                  <Badge tone={severityTone(threat.severity)}>{threat.severity}</Badge>
                  <Badge tone="neutral">{threat.type}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(threat.publishedAt)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{truncate(threat.description, 220)}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldAlert className="h-3.5 w-3.5" />
                Source: {threat.source}
                {threat.isActive ? ' · Active' : ' · Archived'}
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </div>
  );
}
