'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ScanSearch,
  ShieldCheck,
  FileText,
  RadioTower,
  ArrowRight,
  Activity,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/data-display/stats-card';
import { RiskScore } from '@/components/data-display/risk-score';
import { EmptyState } from '@/components/data-display/empty-state';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { getRiskVariant } from '@/lib/utils';

const recentScans = [
  { id: 'SC-2026-001', type: 'URL', content: 'https://secure-invest-bonus.com', score: 94, level: 'CRITICAL', date: '2 hours ago', status: 'COMPLETED' },
  { id: 'SC-2026-002', type: 'TEXT', content: 'Urgent: Your trading account has been flagged...', score: 87, level: 'HIGH', date: '5 hours ago', status: 'COMPLETED' },
  { id: 'SC-2026-003', type: 'IMAGE', content: 'logo_scan.png', score: 12, level: 'LOW', date: 'Yesterday', status: 'COMPLETED' },
  { id: 'SC-2026-004', type: 'URL', content: 'https://hdfc-securities.in.net', score: 91, level: 'CRITICAL', date: 'Yesterday', status: 'COMPLETED' },
  { id: 'SC-2026-005', type: 'AUDIO', content: 'investment_call.mp3', score: 45, level: 'MEDIUM', date: '2 days ago', status: 'COMPLETED' },
];

export default function InvestorDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl p-8 lg:p-10 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold mb-2">
              Welcome back, Investor
            </h1>
            <p className="text-white/80">
              You&apos;ve scanned <span className="font-semibold text-white">18 items</span> this month.
              Stay alert, stay protected.
            </p>
          </div>
          <Link href="/investor/scanner">
            <Button size="lg" className="bg-white text-primary-700 hover:bg-white/90">
              <ScanSearch className="w-5 h-5 mr-2" />
              New Scan
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Scans"
          value="128"
          change={12.5}
          changeLabel="vs last month"
          icon={<Activity className="w-5 h-5" />}
          color="primary"
          delay={0}
        />
        <StatsCard
          title="Threats Detected"
          value="23"
          change={-8.2}
          changeLabel="vs last month"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="destructive"
          delay={0.1}
        />
        <StatsCard
          title="Verified Items"
          value="42"
          change={18.4}
          changeLabel="vs last month"
          icon={<ShieldCheck className="w-5 h-5" />}
          color="success"
          delay={0.2}
        />
        <StatsCard
          title="Reports Downloaded"
          value="9"
          change={5.6}
          changeLabel="vs last month"
          icon={<FileText className="w-5 h-5" />}
          color="accent"
          delay={0.3}
        />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Scans */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>Your latest scan activity</CardDescription>
            </div>
            <Link href="/investor/history">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scan ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentScans.map((scan, index) => (
                  <TableRow key={scan.id}>
                    <TableCell className="font-mono text-xs">{scan.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{scan.type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {scan.content}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{scan.score}</span>
                        <Badge variant={getRiskVariant(scan.level)}>{scan.level}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{scan.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* Risk overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Overview</CardTitle>
              <CardDescription>Average risk this month</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <RiskScore score={62} level="HIGH" size="lg" />
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Average risk score is higher than last month. Consider scanning more
                communications before acting.
              </div>
            </CardContent>
          </Card>

          {/* Threat alert */}
          <Card className="border-warning-500/30 bg-warning-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-warning-500/10 flex items-center justify-center shrink-0">
                  <RadioTower className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Active Threat Alert</h3>
                  <p className="text-sm text-muted-foreground">
                    New phishing wave targeting demat account holders. Verify all
                    communication before sharing OTPs.
                  </p>
                  <Link href="/threats" className="inline-flex items-center gap-1 text-sm font-medium text-warning-600 mt-2">
                    View threat feed
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}