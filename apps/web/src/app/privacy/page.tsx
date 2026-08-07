'use client';

import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Cpu,
  Database,
  EyeOff,
  Loader2,
  FileWarning,
  CheckCircle2,
  Radar,
} from 'lucide-react';
import { SectionTitle, PortalCard, Badge } from '@/components/ui/portal-card';

const SAMPLE_TEXT =
  'URGENT: Your HDFC account is frozen. Verify now at http://verify-hdfc-secure.example/login. Send your PAN ABCDE1234F and OTP 482913 to unlock. Contact +91 98765 43210';

const PII_TYPES = ['PAN', 'Aadhaar', 'UPI ID', 'OTP', 'Mobile', 'Email', 'Bank Account', 'Card', 'DOB'];

export default function PrivacyPage() {
  const [policy, setPolicy] = useState<{ principles: Record<string, string> } | null>(null);
  const [model, setModel] = useState<Record<string, unknown> | null>(null);
  const [text, setText] = useState(SAMPLE_TEXT);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState<{ redacted: string; found: Record<string, number> } | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  async function loadStatic() {
    setLoading(true);
    try {
      const [pRes, mRes] = await Promise.all([
        fetch('/api/proxy/privacy/policy', { cache: 'no-store' }),
        fetch('/api/proxy/model/info', { cache: 'no-store' }),
      ]);
      const pJson = await pRes.json();
      const mJson = await mRes.json();
      setPolicy(pJson.data || null);
      setModel(mJson.data || null);
    } finally {
      setLoading(false);
    }
  }

  async function runDemo() {
    setDemoLoading(true);
    try {
      const res = await fetch('/api/proxy/privacy/redact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (json.success) setDemo({ redacted: json.data.redacted_text, found: json.data.found || {} });
    } finally {
      setDemoLoading(false);
    }
  }

  useEffect(() => {
    loadStatic();
  }, []);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Privacy Shield — DPDP Compliant"
        subtitle="Personal data is redacted before any analysis. Detection and ML run locally — nothing is stored or sent to public cloud models."
      />

      {/* Compliance banner */}
      <div className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Digital Personal Data Protection (DPDP) Act, 2023 — aligned by design.</p>
          <p className="mt-1 text-emerald-700">
            Input is analyzed only for fraud detection (purpose limitation). PII is stripped before model inference,
            processing is local, and scan inputs are never persisted.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading policy &amp; model card...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Redaction demo */}
          <PortalCard>
            <h3 className="mb-1 flex items-center gap-2 text-base font-semibold">
              <EyeOff className="h-5 w-5 text-primary" /> Live PII redaction demo
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Type a message with personal data — watch it get redacted before it would ever reach a model.
            </p>
            <textarea
              className="min-h-[100px] w-full rounded-xl border border-input bg-background p-3 font-mono text-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              onClick={runDemo}
              disabled={demoLoading || !text.trim()}
              className="mt-2 inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 px-5 text-sm font-medium text-white disabled:opacity-50"
            >
              {demoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <EyeOff className="h-4 w-4" />}
              Redact &amp; analyze locally
            </button>
            {demo && (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                  <div className="mb-1 text-xs font-semibold text-red-700">Before redaction (never sent to a model)</div>
                  <div className="font-mono text-sm text-red-800">{text}</div>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> After local redaction — this is what gets analyzed
                  </div>
                  <div className="font-mono text-sm text-emerald-800">{demo.redacted}</div>
                </div>
                {Object.keys(demo.found).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(demo.found).map(([k, v]) => (
                      <Badge key={k} tone="danger">{k} × {v as number}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </PortalCard>

          {/* Policy */}
          {policy && (
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(policy.principles || {}).map(([key, value]) => (
                <PortalCard key={key} className="!p-4">
                  <div className="text-sm font-semibold capitalize">{key.replace('_', ' ')}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{value}</p>
                </PortalCard>
              ))}
            </div>
          )}

          {/* Model card */}
          {model && (
            <PortalCard>
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                <Radar className="h-5 w-5 text-primary" /> Ensemble AI model card
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: 'Algorithm', value: String(model.algorithm) },
                  { label: 'Trained on', value: String(model.trained_on) },
                  { label: 'Training samples', value: String(model.training_samples) },
                  { label: 'Accuracy', value: String((model.metrics as Record<string, number>)?.accuracy) },
                  { label: 'Precision (scam)', value: String((model.metrics as Record<string, number>)?.precision_scam) },
                  { label: 'Recall (scam)', value: String((model.metrics as Record<string, number>)?.recall_scam) },
                  { label: 'F1 (scam)', value: String((model.metrics as Record<string, number>)?.f1_scam) },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border p-3">
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="text-sm font-semibold">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="success">Synthetic, zero real PII</Badge>
                <Badge tone="info">Local inference only</Badge>
                <Badge tone="neutral">Deterministic seed</Badge>
              </div>
            </PortalCard>
          )}
        </div>
      )}

      {/* PII coverage */}
      <PortalCard>
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <Database className="h-5 w-5 text-primary" /> Redacted PII categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {PII_TYPES.map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-primary" /> {t}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          <Cpu className="mr-1 inline h-4 w-4" /> All detection runs in-process. <FileWarning className="mx-1 inline h-4 w-4" />
          The regulator-alert email is the only network call, and it is opt-in via env vars — never the scan input itself.
        </p>
      </PortalCard>
    </div>
  );
}