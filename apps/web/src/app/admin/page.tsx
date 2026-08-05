'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Building2,
  Users,
  RadioTower,
  ArrowUpRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/data-display/stats-card';
import { ScansAreaChart, RiskDonutChart, ThreatsBarChart } from '@/components/charts';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { toast } from 'sonner';

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

const flaggedContent = [
  { id: 'FC-001', scanId: 'SC-2026-001', content: 'https://secure-invest-bonus.com', risk: 'CRITICAL', reason: 'Domain matches threat feed indicator', action: 'PENDING', date: '2 hours ago' },
  { id: 'FC-002', scanId: 'SC-2026-004', content: 'https://hdfc-securities.in.net', risk: 'CRITICAL', reason: 'Typo-squatting detected', action: 'PENDING', date: '5 hours ago' },
  { id: 'FC-003', scanId: 'SC-2026-002', content: 'Trading account suspension notice', risk: 'HIGH', reason: 'Urgency pattern + impersonation', action: 'CONFIRMED', date: 'Yesterday' },
];

const pendingInstitutions = [
  { id: 'INST-001', name: 'Axis Capital Ltd', regNo: 'SEBI-INZ000245678', date: 'Today', status: 'PENDING' },
  { id: 'INST-002', name: 'ICICI Prudential AMC', regNo: 'SEBI-INZ000312987', date: 'Yesterday', status: 'PENDING' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Platform overview, threat intelligence, and moderation queue.
          </p>
        </div>
        <Button variant="gradient" onClick={() => toast.success('New threat advisory draft created')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Threat
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard title="Total Scans" value="42,510" change={18.2} changeLabel="vs last month" icon={<Activity className="w-5 h-5" />} color="primary" delay={0} />
        <StatsCard title="Threats Detected" value="5,730" change={12.4} changeLabel="vs last month" icon={<AlertTriangle className="w-5 h-5" />} color="destructive" delay={0.1} />
        <StatsCard title="Institutions" value="1,284" change={6.8} changeLabel="vs last month" icon={<Building2 className="w-5 h-5" />} color="accent" delay={0.2} />
        <StatsCard title="Registered Users" value="48,392" change={22.6} changeLabel="vs last month" icon={<Users className="w-5 h-5" />} color="success" delay={0.3} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Scan & Threat Activity</CardTitle>
            <CardDescription>Monthly platform activity overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ScansAreaChart data={scansData} />
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
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Flagged content */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Flagged Content</CardTitle>
              <CardDescription>Content requiring review</CardDescription>
            </div>
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="w-3 h-3" />
              3 pending
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flaggedContent.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[180px] truncate font-mono text-xs">{item.content}</TableCell>
                    <TableCell>
                      <Badge variant={item.risk === 'CRITICAL' ? 'destructive' : 'warning'}>{item.risk}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{item.reason}</TableCell>
                    <TableCell>
                      <Badge variant={item.action === 'CONFIRMED' ? 'success' : 'secondary'}>{item.action}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Threat types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Threat Types</CardTitle>
              <CardDescription>Distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ThreatsBarChart data={threatTypeData} />
            </CardContent>
          </Card>

          {/* Pending institutions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Verifications</CardTitle>
              <CardDescription>Institutions awaiting approval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingInstitutions.map((inst) => (
                <div key={inst.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div>
                    <div className="text-sm font-medium text-foreground">{inst.name}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{inst.regNo}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => toast.success(`${inst.name} verified`)}>
                      <ShieldCheck className="w-4 h-4 text-success-500" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toast.error(`${inst.name} rejected`)}>
                      <ArrowUpRight className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}