'use client';

import { useEffect, useState } from 'react';
import { BellRing, Loader2, RefreshCw, Send, Check, ShieldCheck, Eye, MailWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalCard, EmptyState, Badge, SectionTitle } from '@/components/ui/portal-card';
import { apiPatch, apiPost } from '@/lib/portal-api';
import { formatDate, truncate } from '@/lib/utils';

type Alert = {
  id: string;
  title: string;
  description: string;
  regulator: string;
  threatType: string;
  severity: string;
  agent: string | null;
  confidence: number;
  status: 'NEW' | 'REVIEWED' | 'ESCALATED' | 'CLOSED';
  notifiedAt: string | null;
  createdAt: string;
};

const STATUSES = ['NEW', 'REVIEWED', 'ESCALATED', 'CLOSED'];

const severityTone = (s: string): 'danger' | 'warning' | 'info' => {
  if (s === 'CRITICAL' || s === 'HIGH') return 'danger';
  if (s === 'MEDIUM') return 'warning';
  return 'info';
};

const statusTone: Record<string, 'danger' | 'warning' | 'info' | 'success'> = {
  NEW: 'danger',
  REVIEWED: 'info',
  ESCALATED: 'warning',
  CLOSED: 'success',
};

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [emailConfigured, setEmailConfigured] = useState(true);
  const [regulatorEmail, setRegulatorEmail] = useState('');

  useEffect(() => {
    load();
  }, [filter]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const qs = filter ? `?status=${filter}` : '';
      const res = await fetch(`/api/admin/alerts${qs}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || `Request failed (${res.status})`);
      setAlerts((json.data as Alert[]) || []);
      setEmailConfigured(Boolean(json.meta?.emailConfigured));
      setRegulatorEmail(json.meta?.regulatorEmail || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(id: string, status: string) {
    await apiPatch<Alert>(`/api/admin/alerts/${id}`, { status });
    await load();
  }

  async function resend(id: string) {
    try {
      await apiPost<Alert>(`/api/admin/alerts/${id}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resend failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle
          title="Regulator Alerts"
          subtitle="Threats auto-flagged by the threat-hunter agents for regulatory notification"
        />
        <div className="flex items-center gap-2">
          <select
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Button variant="outline" onClick={load}>
            <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!emailConfigured && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <MailWarning className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Regulator emailing is NOT configured — alerts are being logged, not emailed.</p>
            <p className="mt-1 text-amber-700">
              Set <code className="rounded bg-amber-100 px-1">RESEND_API_KEY</code> in{' '}
              <code className="rounded bg-amber-100 px-1">apps/web/.env</code> to send alerts to{' '}
              <code className="rounded bg-amber-100 px-1">{regulatorEmail || 'notifications@verifin.ai'}</code>.
              No alert is ever silently dropped — an unconfigured key is always surfaced here and in the server logs.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={<BellRing className="h-6 w-6" />}
          title="No regulator alerts"
          description="Threat-hunter agents will create alerts here when they confirm HIGH/CRITICAL impersonation."
        />
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <PortalCard key={alert.id}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold">{alert.title}</h3>
                <Badge tone={severityTone(alert.severity)}>{alert.severity}</Badge>
                <Badge tone="neutral">{alert.threatType}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{truncate(alert.description, 240)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>Regulator: {alert.regulator}</span>
                <span>·</span>
                <span>Agent: {alert.agent || 'manual'}</span>
                <span>·</span>
                <span>Detected {formatDate(alert.createdAt)}</span>
                {alert.notifiedAt && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Check className="h-3.5 w-3.5" /> Notified {formatDate(alert.notifiedAt)}
                    </span>
                  </>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge tone={statusTone[alert.status]}>{alert.status}</Badge>
                <span className="flex-1" />
                <Button size="sm" variant="outline" onClick={() => setStatus(alert.id, 'REVIEWED')}>
                  <Eye className="mr-1.5 h-4 w-4" /> Reviewed
                </Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(alert.id, 'ESCALATED')}>
                  <ShieldCheck className="mr-1.5 h-4 w-4" /> Escalate
                </Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(alert.id, 'CLOSED')}>
                  Close
                </Button>
                <Button size="sm" disabled={!alert.notifiedAt} onClick={() => resend(alert.id)}>
                  <Send className="mr-1.5 h-4 w-4" />
                  {alert.notifiedAt ? 'Resend' : 'Send'}
                </Button>
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </div>
  );
}