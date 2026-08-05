'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  QrCode,
  Megaphone,
  FileText,
  Users,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Download,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/data-display/stats-card';
import { QRCodeSVG } from 'qrcode.react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { toast } from 'sonner';

const recentNotices = [
  { id: 'NTC-2026-089', title: 'Regulatory Advisory on Account Security', status: 'ACTIVE', views: 1243, qrScans: 856, date: 'Aug 5, 2026' },
  { id: 'NTC-2026-088', title: 'Update on KYC Compliance Requirements', status: 'ACTIVE', views: 987, qrScans: 654, date: 'Aug 4, 2026' },
  { id: 'NTC-2026-087', title: 'Suspension of Trading for Certain Scrips', status: 'ACTIVE', views: 2104, qrScans: 1432, date: 'Aug 3, 2026' },
  { id: 'NTC-2026-086', title: 'Important: Revised Fee Structure', status: 'EXPIRED', views: 1567, qrScans: 1102, date: 'Jul 28, 2026' },
];

export default function InstitutionDashboard() {
  const handleDownload = (id: string) => {
    toast.success(`QR code for ${id} downloaded`);
  };

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
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl lg:text-3xl font-display font-bold">
                HDFC Securities Limited
              </h1>
              <Badge variant="success">Verified</Badge>
            </div>
            <p className="text-white/80">
              You have <span className="font-semibold text-white">4 active notices</span> with{' '}
              <span className="font-semibold text-white">3,542 total QR scans</span> this month.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/institution/register-notice">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-white/90">
                <Megaphone className="w-5 h-5 mr-2" />
                Register Notice
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Active Notices"
          value="4"
          change={1}
          changeLabel="this week"
          icon={<Megaphone className="w-5 h-5" />}
          color="primary"
          delay={0}
        />
        <StatsCard
          title="QR Scans"
          value="3,542"
          change={24.8}
          changeLabel="vs last month"
          icon={<QrCode className="w-5 h-5" />}
          color="success"
          delay={0.1}
        />
        <StatsCard
          title="Registry Views"
          value="12,847"
          change={18.2}
          changeLabel="vs last month"
          icon={<Building2 className="w-5 h-5" />}
          color="accent"
          delay={0.2}
        />
        <StatsCard
          title="Verifications Passed"
          value="98.7%"
          change={0.5}
          changeLabel="vs last month"
          icon={<ShieldCheck className="w-5 h-5" />}
          color="warning"
          delay={0.3}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Notices */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Notices</CardTitle>
              <CardDescription>Your latest registered communications</CardDescription>
            </div>
            <Link href="/institution/registry">
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
                  <TableHead>Notice ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>QR Scans</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentNotices.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell className="font-mono text-xs">{notice.id}</TableCell>
                    <TableCell className="max-w-[180px] truncate">{notice.title}</TableCell>
                    <TableCell>
                      <Badge variant={notice.status === 'ACTIVE' ? 'success' : 'warning'}>
                        {notice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{notice.views.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{notice.qrScans.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(notice.id)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toast.success(`QR for ${notice.id} copied to clipboard`)}>
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Latest QR */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Latest QR Code</CardTitle>
              <CardDescription>NTC-2026-089</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="p-4 rounded-2xl bg-white shadow-elegant">
                <QRCodeSVG value="https://verifin.ai/verify/ntc-2026-089" size={180} />
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm text-success-600 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Cryptographically signed
              </div>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => handleDownload('NTC-2026-089')}>
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-success-500/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">98.7% Verification Success</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Your institution&apos;s QR codes are being verified successfully by investors.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}