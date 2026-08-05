'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { StatsCard } from '@/components/data-display/stats-card';
import { toast } from 'sonner';

const reports = [
  { id: 'RPT-INST-001', title: 'Notice Engagement Report', period: 'July 2026', notices: 4, scans: 3542, views: 12847, generatedAt: 'Aug 1, 2026' },
  { id: 'RPT-INST-002', title: 'QR Verification Report', period: 'July 2026', notices: 4, scans: 3120, views: 11084, generatedAt: 'Aug 1, 2026' },
  { id: 'RPT-INST-003', title: 'Registry Activity Report', period: 'June 2026', notices: 3, scans: 2856, views: 9843, generatedAt: 'Jul 1, 2026' },
  { id: 'RPT-INST-004', title: 'Notice Engagement Report', period: 'June 2026', notices: 3, scans: 2450, views: 8712, generatedAt: 'Jul 1, 2026' },
];

export default function InstitutionReportsPage() {
  const [period, setPeriod] = React.useState('');

  const filtered = reports.filter((report) => {
    if (!period) return true;
    return report.period.toLowerCase().includes(period.toLowerCase());
  });

  const handleDownload = (id: string) => {
    toast.success(`Report ${id} downloaded`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track engagement and verification metrics for your registered communications.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total QR Scans"
          value="6,062"
          change={21.4}
          changeLabel="last 2 months"
          icon={<TrendingUp className="w-5 h-5" />}
          color="success"
          delay={0}
        />
        <StatsCard
          title="Registry Views"
          value="22,731"
          change={18.2}
          changeLabel="last 2 months"
          icon={<Eye className="w-5 h-5" />}
          color="primary"
          delay={0.1}
        />
        <StatsCard
          title="Active Notices"
          value="4"
          icon={<FileText className="w-5 h-5" />}
          color="accent"
          delay={0.2}
        />
      </div>

      {/* Filters */}
      <div className="max-w-xs">
        <Select
          placeholder="Filter by period"
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'July 2026', label: 'July 2026' },
            { value: 'June 2026', label: 'June 2026' },
          ]}
        />
      </div>

      {/* Reports */}
      <div className="grid lg:grid-cols-2 gap-4">
        {filtered.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass rounded-2xl p-6 hover:shadow-elegant-hover transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <Badge variant="secondary">{report.period}</Badge>
            </div>
            <h3 className="font-semibold text-foreground mb-2">{report.title}</h3>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {report.notices} notices
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {report.scans.toLocaleString()} scans
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {report.views.toLocaleString()} views
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {report.generatedAt}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.info(`Viewing ${report.id}`)}>
                <Eye className="w-4 h-4 mr-1.5" />
                View
              </Button>
              <Button variant="gradient" size="sm" onClick={() => handleDownload(report.id)}>
                <Download className="w-4 h-4 mr-1.5" />
                Download
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}