'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Search, Building2, FileText, QrCode, ShieldCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from 'sonner';

interface RegistryItem {
  id: string;
  title: string;
  noticeId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  qrScans: number;
  views: number;
  date: string;
}

const registryData: RegistryItem[] = [
  { id: 'R-001', title: 'Regulatory Advisory on Account Security', noticeId: 'NTC-2026-089', status: 'ACTIVE', qrScans: 856, views: 1243, date: 'Aug 5, 2026' },
  { id: 'R-002', title: 'Update on KYC Compliance Requirements', noticeId: 'NTC-2026-088', status: 'ACTIVE', qrScans: 654, views: 987, date: 'Aug 4, 2026' },
  { id: 'R-003', title: 'Suspension of Trading for Certain Scrips', noticeId: 'NTC-2026-087', status: 'ACTIVE', qrScans: 1432, views: 2104, date: 'Aug 3, 2026' },
  { id: 'R-004', title: 'Important: Revised Fee Structure', noticeId: 'NTC-2026-086', status: 'EXPIRED', qrScans: 1102, views: 1567, date: 'Jul 28, 2026' },
  { id: 'R-005', title: 'Annual Report 2025-26', noticeId: 'NTC-2026-085', status: 'ACTIVE', qrScans: 2345, views: 3120, date: 'Jul 22, 2026' },
];

export default function RegistryPage() {
  const [search, setSearch] = React.useState('');

  const filtered = registryData.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.noticeId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Institution Registry</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All your registered communications visible in the public registry.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notices..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          <Building2 className="w-4 h-4 mr-2" />
          View Institution Profile
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Notice</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>QR Scans</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="max-w-[250px]">
                      <div className="font-medium text-foreground truncate">{item.title}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{item.noticeId}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'ACTIVE' ? 'success' : item.status === 'EXPIRED' ? 'warning' : 'destructive'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <QrCode className="w-3.5 h-3.5" />
                        {item.qrScans.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.views.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toast.info(`Viewing ${item.noticeId}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toast.success(`QR for ${item.noticeId} downloaded`)}>
                          <QrCode className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No notices found"
              description="Try adjusting your search or register a new notice."
            />
          )}
        </CardContent>
      </Card>

      {/* Verification summary */}
      <Card className="bg-success-500/5 border-success-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-success-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <div className="font-semibold text-foreground">All notices verified & signed</div>
              <div className="text-sm text-muted-foreground">
                Your institution&apos;s communications are cryptographically protected against tampering.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}