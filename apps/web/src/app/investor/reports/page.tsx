'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileText,
  Eye,
  Calendar,
  TrendingUp,
  TrendingDown,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { StatsCard } from '@/components/data-display/stats-card';
import { EmptyState } from '@/components/data-display/empty-state';
import { toast } from 'sonner';

interface ReportItem {
  id: string;
  scanId: string;
  title: string;
  type: string;
  riskScore: number;
  level: string;
  generatedAt: string;
  fileSize: string;
}

const reports: ReportItem[] = [
  { id: 'RPT-001', scanId: 'SC-2026-001', title: 'Security Analysis Report', type: 'URL', riskScore: 94, level: 'CRITICAL', generatedAt: 'Aug 5, 2026', fileSize: '2.4 MB' },
  { id: 'RPT-002', scanId: 'SC-2026-002', title: 'Text Communication Analysis', type: 'TEXT', riskScore: 87, level: 'HIGH', generatedAt: 'Aug 5, 2026', fileSize: '1.8 MB' },
  { id: 'RPT-003', scanId: 'SC-2026-003', title: 'Image Authenticity Report', type: 'IMAGE', riskScore: 12, level: 'LOW', generatedAt: 'Aug 4, 2026', fileSize: '3.1 MB' },
  { id: 'RPT-004', scanId: 'SC-2026-004', title: 'Domain Analysis Report', type: 'URL', riskScore: 91, level: 'CRITICAL', generatedAt: 'Aug 4, 2026', fileSize: '2.2 MB' },
  { id: 'RPT-005', scanId: 'SC-2026-005', title: 'Audio Communication Analysis', type: 'AUDIO', riskScore: 45, level: 'MEDIUM', generatedAt: 'Aug 3, 2026', fileSize: '4.5 MB' },
];

export default function ReportsPage() {
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');

  const filtered = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || report.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDownload = (id: string) => {
    toast.success(`Report ${id} downloaded successfully`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Evidence Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Download court-ready PDF reports for every scan and verification.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Reports"
          value="42"
          change={12.5}
          changeLabel="vs last month"
          icon={<FileText className="w-5 h-5" />}
          color="primary"
          delay={0}
        />
        <StatsCard
          title="Reports Downloaded"
          value="128"
          change={8.2}
          changeLabel="vs last month"
          icon={<Download className="w-5 h-5" />}
          color="success"
          delay={0.1}
        />
        <StatsCard
          title="Avg. Report Size"
          value="2.6 MB"
          icon={<TrendingDown className="w-5 h-5" />}
          color="accent"
          delay={0.2}
        />
      </div>

      {/* Filters */}
      <div className="grid sm:grid-cols-2 gap-3 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          placeholder="Filter by type"
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: 'TEXT', label: 'Text' },
            { value: 'URL', label: 'URL' },
            { value: 'IMAGE', label: 'Image' },
            { value: 'AUDIO', label: 'Audio' },
          ]}
        />
      </div>

      {/* Reports list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-elegant-hover transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground truncate">{report.title}</span>
                  <Badge
                    variant={
                      report.level === 'CRITICAL' || report.level === 'HIGH'
                        ? 'destructive'
                        : report.level === 'MEDIUM'
                        ? 'warning'
                        : 'success'
                    }
                  >
                    {report.level}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="font-mono">{report.id}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {report.generatedAt}
                  </span>
                  <span>{report.fileSize}</span>
                  <span>Risk: {report.riskScore}/100</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
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
      ) : (
        <EmptyState
          title="No reports found"
          description="Reports are generated after each scan. Try a new scan to generate a report."
          action={<Button onClick={() => window.location.href = '/investor/scanner'}>New Scan</Button>}
        />
      )}
    </div>
  );
}