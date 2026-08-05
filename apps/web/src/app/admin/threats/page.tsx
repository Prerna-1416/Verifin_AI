'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  RadioTower,
  Plus,
  Search,
  Pencil,
  Trash2,
  ShieldCheck,
  Globe,
  Server,
  Hash,
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
import { toast } from 'sonner';

interface ThreatItem {
  id: string;
  title: string;
  type: string;
  severity: string;
  indicators: { domains?: number; ips?: number; hashes?: number; urls?: number };
  source: string;
  status: 'ACTIVE' | 'INACTIVE';
  published: string;
}

const threats: ThreatItem[] = [
  { id: 'THR-2041', title: 'Phishing wave targeting demat account holders', type: 'PHISHING', severity: 'CRITICAL', indicators: { domains: 24, urls: 87 }, source: 'SEBI Advisory', status: 'ACTIVE', published: 'Aug 5, 2026' },
  { id: 'THR-2040', title: 'Fake mutual fund guaranteed returns scam', type: 'SCAM', severity: 'HIGH', indicators: { domains: 15, hashes: 4 }, source: 'CERT-In', status: 'ACTIVE', published: 'Aug 4, 2026' },
  { id: 'THR-2039', title: 'Impersonation of broker WhatsApp groups', type: 'IMPERSONATION', severity: 'HIGH', indicators: { domains: 8 }, source: 'Community Report', status: 'ACTIVE', published: 'Aug 3, 2026' },
  { id: 'THR-2038', title: 'Malware-laced trading app download links', type: 'MALWARE', severity: 'CRITICAL', indicators: { hashes: 12, domains: 6 }, source: 'VirusTotal', status: 'ACTIVE', published: 'Aug 2, 2026' },
  { id: 'THR-2037', title: 'KYC document collection fraud', type: 'FRAUD', severity: 'MEDIUM', indicators: { domains: 10, urls: 34 }, source: 'RBI Alert', status: 'INACTIVE', published: 'Jul 28, 2026' },
];

const typeColors: Record<string, 'destructive' | 'warning' | 'secondary'> = {
  PHISHING: 'destructive',
  SCAM: 'warning',
  IMPERSONATION: 'warning',
  MALWARE: 'destructive',
  FRAUD: 'destructive',
};

export default function ThreatFeedPage() {
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [severityFilter, setSeverityFilter] = React.useState('');

  const filtered = threats.filter((threat) => {
    const matchesSearch =
      threat.title.toLowerCase().includes(search.toLowerCase()) ||
      threat.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || threat.type === typeFilter;
    const matchesSeverity = !severityFilter || threat.severity === severityFilter;
    return matchesSearch && matchesType && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Threat Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage threat intelligence shared with all investors.
          </p>
        </div>
        <Button variant="gradient" onClick={() => toast.success('New threat form opened')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Threat
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search threats..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select
              placeholder="Filter by type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'PHISHING', label: 'Phishing' },
                { value: 'MALWARE', label: 'Malware' },
                { value: 'SCAM', label: 'Scam' },
                { value: 'FRAUD', label: 'Fraud' },
                { value: 'IMPERSONATION', label: 'Impersonation' },
              ]}
            />
            <Select
              placeholder="Filter by severity"
              value={severityFilter}
              onChange={setSeverityFilter}
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

      {/* Threat list */}
      {filtered.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Threat</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Indicators</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((threat, index) => (
                  <motion.tr
                    key={threat.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="max-w-[260px]">
                      <div className="font-medium text-foreground truncate">{threat.title}</div>
                      <div className="font-mono text-xs text-muted-foreground mt-0.5">{threat.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={typeColors[threat.type] || 'secondary'}>{threat.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={threat.severity === 'CRITICAL' ? 'destructive' : threat.severity === 'HIGH' ? 'warning' : 'secondary'}>
                        {threat.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        {threat.indicators.domains && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {threat.indicators.domains}
                          </span>
                        )}
                        {threat.indicators.urls && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {threat.indicators.urls}
                          </span>
                        )}
                        {threat.indicators.hashes && (
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {threat.indicators.hashes}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{threat.source}</TableCell>
                    <TableCell>
                      <Badge variant={threat.status === 'ACTIVE' ? 'success' : 'secondary'}>{threat.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => toast.info(`Editing ${threat.id}`)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toast.error(`${threat.id} deleted`)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
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
          icon={<RadioTower className="w-8 h-8 text-muted-foreground" />}
          title="No threats found"
          description="Try adjusting your filters or add a new threat."
          action={<Button onClick={() => toast.success('New threat form opened')}>Add Threat</Button>}
        />
      )}
    </div>
  );
}