'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Download,
  Eye,
  Filter,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Music,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { toast } from 'sonner';

interface HistoryItem {
  id: string;
  type: 'TEXT' | 'URL' | 'IMAGE' | 'AUDIO';
  content: string;
  score: number;
  level: string;
  date: string;
  status: 'COMPLETED' | 'FAILED';
}

const scanHistory: HistoryItem[] = [
  { id: 'SC-2026-001', type: 'URL', content: 'https://secure-invest-bonus.com', score: 94, level: 'CRITICAL', date: 'Aug 5, 2026', status: 'COMPLETED' },
  { id: 'SC-2026-002', type: 'TEXT', content: 'Urgent: Your trading account has been flagged for unusual activity...', score: 87, level: 'HIGH', date: 'Aug 5, 2026', status: 'COMPLETED' },
  { id: 'SC-2026-003', type: 'IMAGE', content: 'suspicious_brochure.png', score: 12, level: 'LOW', date: 'Aug 4, 2026', status: 'COMPLETED' },
  { id: 'SC-2026-004', type: 'URL', content: 'https://hdfc-securities.in.net', score: 91, level: 'CRITICAL', date: 'Aug 4, 2026', status: 'COMPLETED' },
  { id: 'SC-2026-005', type: 'AUDIO', content: 'investment_call_recording.mp3', score: 45, level: 'MEDIUM', date: 'Aug 3, 2026', status: 'COMPLETED' },
  { id: 'SC-2026-006', type: 'TEXT', content: 'Congratulations! You have been selected for guaranteed returns...', score: 96, level: 'CRITICAL', date: 'Aug 3, 2026', status: 'COMPLETED' },
  { id: 'SC-2026-007', type: 'URL', content: 'https://investindia.gov.in', score: 5, level: 'LOW', date: 'Aug 2, 2026', status: 'COMPLETED' },
  { id: 'SC-2026-008', type: 'IMAGE', content: 'bank_notice.png', score: 28, level: 'LOW', date: 'Aug 2, 2026', status: 'COMPLETED' },
];

const typeIcons = {
  TEXT: <FileText className="w-4 h-4" />,
  URL: <LinkIcon className="w-4 h-4" />,
  IMAGE: <ImageIcon className="w-4 h-4" />,
  AUDIO: <Music className="w-4 h-4" />,
};

export default function HistoryPage() {
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [levelFilter, setLevelFilter] = React.useState('');

  const filtered = scanHistory.filter((scan) => {
    const matchesSearch =
      scan.content.toLowerCase().includes(search.toLowerCase()) ||
      scan.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || scan.type === typeFilter;
    const matchesLevel = !levelFilter || scan.level === levelFilter;
    return matchesSearch && matchesType && matchesLevel;
  });

  const handleDownload = (id: string) => {
    toast.success(`Report for ${id} is being downloaded...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Scan History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and download reports for all your past scans.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scans..."
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
            <Select
              placeholder="Filter by risk"
              value={levelFilter}
              onChange={setLevelFilter}
              options={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'CRITICAL', label: 'Critical' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {filtered.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scan ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((scan, index) => (
                  <motion.tr
                    key={scan.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="font-mono text-xs">{scan.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{typeIcons[scan.type]}</span>
                        <Badge variant="outline" className="text-xs">{scan.type}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate text-muted-foreground">
                      {scan.content}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{scan.score}</span>
                        <Badge variant={getRiskVariant(scan.level)}>{scan.level}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{scan.date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toast.info(`Opening ${scan.id}...`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(scan.id)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No scans found"
          description="Try adjusting your filters or perform a new scan."
          action={<Button onClick={() => window.location.href = '/investor/scanner'}>New Scan</Button>}
        />
      )}
    </div>
  );
}