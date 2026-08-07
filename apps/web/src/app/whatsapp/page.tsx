'use client';

import { useState } from 'react';
import { MessageSquare, Loader2, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { SectionTitle, PortalCard, Badge } from '@/components/ui/portal-card';

type Msg = {
  sender: string;
  message: string;
  urls: string[];
  risk_score: number;
  risk_level: string;
  threats: string[];
  reasons: string[];
  explanation: string;
};

type Result = {
  total_messages: number;
  analyzed: number;
  flagged: number;
  max_risk: number;
  messages: Msg[];
};

const SAMPLE = `[23/06/26, 10:15:42 AM] Ram Sharma: Hi please reply
[23/06/26, 10:16:03 AM] StockBreeze Support: Sir your account has been flagged due to unusual activity. Reply with your 4-digit PIN and OTP to unlock it urgently to avoid a debit freeze.
[23/06/26, 10:17:40 AM] StockBreeze Support: Urgent: Verify now at http://stockbreeze-verify.example/login or your profits will be suspended within 24 hours.`;

const riskTone = (s: string): 'danger' | 'warning' | 'info' | 'success' => {
  if (s === 'Critical' || s === 'High') return 'danger';
  if (s === 'Medium') return 'warning';
  return 'success';
};

export default function WhatsAppAnalyzerPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/proxy/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || `Request failed (${res.status})`);
      setResult(json.data as Result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="WhatsApp Scam Analyzer"
        subtitle="Paste a WhatsApp chat export or past conversation — every message is risk-scored for scams, phishing, and fraud"
      />

      <PortalCard>
        <label className="mb-2 block text-sm font-medium">Paste conversation or export</label>
        <textarea
          className="min-h-[160px] w-full rounded-xl border border-input bg-background p-3 font-mono text-sm"
          placeholder="[23/06/26, 10:16:03 AM] Sender: message ..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={analyze}
            disabled={loading || !text.trim()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 px-5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
            {loading ? 'Analyzing...' : 'Analyze Messages'}
          </button>
          <button
            onClick={() => setText(SAMPLE)}
            className="inline-flex h-10 items-center rounded-xl border border-input px-4 text-sm text-muted-foreground hover:text-foreground"
          >
            Load sample
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </PortalCard>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Messages', value: result.analyzed },
              { label: 'Total in chat', value: result.total_messages },
              { label: 'Flagged', value: result.flagged },
              { label: 'Max risk', value: `${result.max_risk}` },
            ].map((s) => (
              <PortalCard key={s.label} className="!p-4 text-center">
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </PortalCard>
            ))}
          </div>

          {result.messages.length === 0 ? (
            <PortalCard className="text-center text-sm text-muted-foreground">
              No messages matched the WhatsApp export format. Export a chat via WhatsApp → Chat → Export chat.
            </PortalCard>
          ) : (
            result.messages.slice(0, 50).map((m, i) => (
              <PortalCard key={i}>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{m.sender}</span>
                  <Badge tone={riskTone(m.risk_level)}>{m.risk_level}</Badge>
                  <Badge tone="neutral">Score {m.risk_score}</Badge>
                  {m.threats.slice(0, 2).map((t) => (
                    <Badge key={t} tone="neutral">{t}</Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{m.message}</p>
                {m.explanation && (
                  <div className="mt-2 flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs">
                    {m.risk_score >= 30 ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-600" />
                    ) : (
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                    )}
                    <span>{m.explanation}</span>
                  </div>
                )}
              </PortalCard>
            ))
          )}
        </div>
      )}
    </div>
  );
}