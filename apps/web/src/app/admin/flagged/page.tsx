'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, XCircle, AlertTriangle, Eye, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/data-display/empty-state';
import { StatsCard } from '@/components/data-display/stats-card';
import { toast } from 'sonner';

interface FlaggedItem {
  id: string;
  scanId: string;
  content: string;
  type: string;
  risk: string;
  reason: string;
  action: 'PENDING' | 'CONFIRMED_THREAT' | 'FALSE_POSITIVE' | 'ESCALATED';
  date: string;
}

const flaggedData: FlaggedItem[] = [
  { id: 'FC-001', scanId: 'SC-2026-001', content: 'https://secure-invest-bonus.com', type: 'URL', risk: 'CRITICAL', reason: 'Domain matches threat feed indicator THR-2041', action: 'PENDING', date: '2 hours ago' },
  { id: 'FC-002', scanId: 'SC-2026-004', content: 'https://hdfc-securities.in.net', type: 'URL', risk: 'CRITICAL', reason: 'Typo-squatting detected', action: 'PENDING', date: '5 hours ago' },
  { id: 'FC-003', scanId: 'SC-2026-002', content: 'Trading account suspension notice', type: 'TEXT', risk: 'HIGH', reason: 'Urgency pattern + impersonation', action: 'CONFIRMED_THREAT', date: 'Yesterday' },
  { id: 'FC-004', scanId: 'SC-2026-008', content: 'investment_call_recording.mp3', type: 'AUDIO', risk: 'MEDIUM', reason: 'Guaranteed returns claim detected', action: 'FALSE_POSITIVE', date: '2 days ago' },
  { id: 'FC-005', scanId: 'SC-2026-012', content: 'suspicious_brochure.png', type: 'IMAGE', risk: 'HIGH', reason: 'Logo misuse detected', action: 'ESCALATED', date: '2 days ago' },
];

const actionVariants: Record<string, 'destructive' | 'warning' | 'success' | 'secondary'> = {
  PENDING: 'warning',
  CONFIRMED_THREAT: 'destructive',
  FALSE_POSITIVE: 'success',
  ESCALATED: 'secondary',
};

export default function FlaggedPage() {
  const [search, setSearch] = React.useState('');
  const [actionFilter, setActionFilter] = React.useState('');

  const filtered = flaggedData.filter((item) => {
    const matchesSearch =
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.scanId.toLowerCase().includes(search.toLowerCase());
    const matchesAction = !actionFilter || item.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleAction = (id: string, action: string) => {
    if (action === 'CONFIRMED_THREAT') {
      toast.success(`Threat confirmed and added to feed (${id})`);
    } else if (action === 'FALSE_POSITIVE') {
      toast.success(`Marked as false positive (${id})`);
    } else {
      toast.info(`Escalated for review (${id})`);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Flagged Content</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review content flagged by the AI detection system.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Pending Review" value="2" icon={<Flag className="w-5 h-5" />} color="warning" delay={0} />
        <StatsCard title="Confirmed Threats" value="1,248" change={12.4} changeLabel="vs last month" icon={<AlertTriangle className="w-5 h-5" />} color="destructive" delay={0.1} />
        <StatsCard title="False Positives" value="386" change={-5.2} changeLabel="vs last month" icon={<CheckCircle2 className="w-5 h-5" />} color="success" delay={0.2} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search flagged content..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select
          placeholder="Filter by status"
          value={actionFilter}
          onChange={setActionFilter}
          options={[
            { value: 'PENDING', label: 'Pending' },
            { value: 'CONFIRMED_THREAT', label: 'Confirmed Threat' },
            { value: 'FALSE_POSITIVE', label: 'False Positive' },
            { value: 'ESCALATED', label: 'Escalated' },
          ]}
        />
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant={actionVariants[item.action]}>{item.action.replace('_', ' ')}</Badge>
                    <Badge variant={item.risk === 'CRITICAL' ? 'destructive' : item.risk === 'HIGH' ? 'warning' : 'secondary'}>
                      {item.risk} RISK
                    </Badge>
                    <Badge variant="outline">{item.type}</Badge>
                    <span className="text-xs text-muted-foreground font-mono">{item.scanId}</span>
                  </div>
                  <div className="font-mono text-sm text-foreground truncate mb-1">{item.content}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-warning-600 shrink-0" />
                    {item.reason}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{item.date}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => toast.info(`Viewing scan ${item.scanId}`)}>
                    <Eye className="w-4 h-4 mr-1.5" />
                    View
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleAction(item.id, 'CONFIRMED_THREAT')}>
                    <AlertTriangle className="w-4 h-4 mr-1.5" />
                    Confirm Threat
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleAction(item.id, 'FALSE_POSITIVE')}>
                    <XCircle className="w-4 h-4 mr-1.5" />
                    False Positive
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Flag className="w-8 h-8 text-muted-foreground" />}
          title="No flagged content"
          description="No content matches your current filters."
        />
      )}
    </div>
  );
}