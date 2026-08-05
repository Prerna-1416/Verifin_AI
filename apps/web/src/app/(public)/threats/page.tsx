'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { RadioTower, AlertTriangle, ShieldCheck, Globe, Hash, Bell, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';

interface Threat {
  id: string;
  title: string;
  type: string;
  severity: string;
  description: string;
  indicators: string[];
  source: string;
  published: string;
}

const threats: Threat[] = [
  {
    id: 'THR-2041',
    title: 'Phishing wave targeting demat account holders',
    type: 'PHISHING',
    severity: 'CRITICAL',
    description: 'Fraudsters are sending SMS and email messages claiming to be from brokers, asking users to verify demat accounts via fake links. Never share OTP or login credentials.',
    indicators: ['secure-invest-bonus.com', 'hdfc-securities.in.net', 'demat-verify.net'],
    source: 'SEBI Advisory',
    published: 'Aug 5, 2026',
  },
  {
    id: 'THR-2040',
    title: 'Fake mutual fund guaranteed returns scam',
    type: 'SCAM',
    severity: 'HIGH',
    description: 'Scammers promise 20-30% guaranteed monthly returns on mutual fund investments. Mutual funds do not guarantee returns. Verify with SEBI-registered distributors only.',
    indicators: ['guaranteed-funds.co', 'invest-wealth-pro.com'],
    source: 'CERT-In',
    published: 'Aug 4, 2026',
  },
  {
    id: 'THR-2039',
    title: 'Impersonation of broker WhatsApp groups',
    type: 'IMPERSONATION',
    severity: 'HIGH',
    description: 'Fraudsters create WhatsApp groups impersonating legitimate brokers and stock advisers. They share tips and ask for money for "premium recommendations".',
    indicators: ['HDFC-Trading-Group-42', 'Zerodha-Pro-Tips'],
    source: 'Community Report',
    published: 'Aug 3, 2026',
  },
  {
    id: 'THR-2038',
    title: 'Malware-laced trading app download links',
    type: 'MALWARE',
    severity: 'CRITICAL',
    description: 'Fake versions of popular trading apps are being distributed via SMS and social media. These apps steal credentials and screen recordings. Only download from official app stores.',
    indicators: ['trading-pro-apk.com', 'groww-app-download.net'],
    source: 'VirusTotal',
    published: 'Aug 2, 2026',
  },
  {
    id: 'THR-2037',
    title: 'KYC document collection fraud',
    type: 'FRAUD',
    severity: 'MEDIUM',
    description: 'Callers posing as bank/KYC officers request PAN card, Aadhaar, and bank statements via WhatsApp. Legitimate institutions never request documents via unofficial channels.',
    indicators: ['kyc-update-form.com'],
    source: 'RBI Alert',
    published: 'Jul 28, 2026',
  },
];

const severityBadge: Record<string, 'destructive' | 'warning' | 'success'> = {
  CRITICAL: 'destructive',
  HIGH: 'warning',
  MEDIUM: 'success',
};

const severityColor: Record<string, string> = {
  CRITICAL: 'text-destructive',
  HIGH: 'text-warning-600',
  MEDIUM: 'text-success-600',
};

export default function PublicThreatsPage() {
  const [severityFilter, setSeverityFilter] = React.useState('');

  const filtered = threats.filter((t) => !severityFilter || t.severity === severityFilter);

  return (
    <div className="pt-16">
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-destructive/20 bg-destructive/5 text-sm text-destructive mb-6">
                <RadioTower className="w-4 h-4" />
                Live Threat Intelligence
              </div>
              <h1 className="text-display-md font-display font-bold text-foreground mb-4">
                Threat <span className="gradient-text">Feed</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Stay informed about the latest scams and fraudulent schemes targeting
                investors. Updated continuously from global intelligence sources.
              </p>
            </motion.div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-success-500 animate-pulse" />
              Live monitoring active
            </div>
            <div className="w-48">
              <Select
                placeholder="Filter by severity"
                value={severityFilter}
                onChange={setSeverityFilter}
                options={[
                  { value: 'CRITICAL', label: 'Critical' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'MEDIUM', label: 'Medium' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-6">
            {filtered.map((threat, index) => (
              <motion.div
                key={threat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-2xl p-6 lg:p-8 hover:shadow-elegant-hover transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <Badge variant={severityBadge[threat.severity]}>{threat.severity}</Badge>
                      <Badge variant="outline">{threat.type}</Badge>
                      <span className="text-xs text-muted-foreground font-mono">{threat.id}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{threat.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{threat.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {threat.indicators.map((indicator) => (
                        <span
                          key={indicator}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-destructive/5 border border-destructive/20 text-xs font-mono text-destructive"
                        >
                          <Globe className="w-3 h-3" />
                          {indicator}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-success-500" />
                        Source: {threat.source}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {threat.published}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => toast.success('Threat alert subscribed')}
                  >
                    <Bell className="w-4 h-4 mr-1.5" />
                    Get Alerts
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-warning-500/5 border border-warning-500/20 p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-warning-600 font-medium mb-2">
              <AlertTriangle className="w-5 h-5" />
              Stay Protected
            </div>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Always verify financial communications before acting. Use VeriFin AI to scan
              suspicious messages, URLs, images, and audio for free.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}