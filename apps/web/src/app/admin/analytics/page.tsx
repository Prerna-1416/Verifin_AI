'use client';

import { motion } from 'framer-motion';
import { Activity, ShieldCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatsCard } from '@/components/data-display/stats-card';
import { ScansAreaChart, RiskDonutChart, ThreatsBarChart, VerificationsLineChart } from '@/components/charts';

const scansData = [
  { month: 'Jan', scans: 3200, threats: 420 },
  { month: 'Feb', scans: 4100, threats: 510 },
  { month: 'Mar', scans: 3800, threats: 460 },
  { month: 'Apr', scans: 5200, threats: 680 },
  { month: 'May', scans: 4800, threats: 590 },
  { month: 'Jun', scans: 6100, threats: 720 },
  { month: 'Jul', scans: 5800, threats: 640 },
  { month: 'Aug', scans: 7200, threats: 890 },
];

const riskData = [
  { name: 'Low', value: 4200, color: '#22c55e' },
  { name: 'Medium', value: 2800, color: '#f59e0b' },
  { name: 'High', value: 1500, color: '#f97316' },
  { name: 'Critical', value: 800, color: '#ef4444' },
];

const threatTypeData = [
  { type: 'Phishing', count: 1240 },
  { type: 'Malware', count: 620 },
  { type: 'Scam', count: 890 },
  { type: 'Fraud', count: 540 },
  { type: 'Impersonation', count: 780 },
  { type: 'Data Leak', count: 320 },
];

const verificationsData = [
  { month: 'Jan', verifications: 1800 },
  { month: 'Feb', verifications: 2400 },
  { month: 'Mar', verifications: 2100 },
  { month: 'Apr', verifications: 3200 },
  { month: 'May', verifications: 2900 },
  { month: 'Jun', verifications: 3800 },
  { month: 'Jul', verifications: 4100 },
  { month: 'Aug', verifications: 4800 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comprehensive platform analytics and insights.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard title="Detection Accuracy" value="99.2%" change={0.4} changeLabel="vs last month" icon={<TrendingUp className="w-5 h-5" />} color="success" delay={0} />
        <StatsCard title="Avg. Scan Time" value="1.8s" change={-12.5} changeLabel="vs last month" icon={<Activity className="w-5 h-5" />} color="primary" delay={0.1} />
        <StatsCard title="Verification Rate" value="87.3%" change={3.2} changeLabel="vs last month" icon={<ShieldCheck className="w-5 h-5" />} color="accent" delay={0.2} />
        <StatsCard title="False Positives" value="2.1%" change={-0.3} changeLabel="vs last month" icon={<AlertTriangle className="w-5 h-5" />} color="warning" delay={0.3} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Scan Volume Trend</CardTitle>
            <CardDescription>Monthly scan activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ScansAreaChart data={scansData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Trend</CardTitle>
            <CardDescription>Monthly QR verifications</CardDescription>
          </CardHeader>
          <CardContent>
            <VerificationsLineChart data={verificationsData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>All scans by risk level</CardDescription>
          </CardHeader>
          <CardContent>
            <RiskDonutChart data={riskData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Threat Categories</CardTitle>
            <CardDescription>Threats by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ThreatsBarChart data={threatTypeData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}