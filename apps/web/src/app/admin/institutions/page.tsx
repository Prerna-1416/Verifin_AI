'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Search, Building2, ShieldCheck, ShieldX, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/data-display/empty-state';
import { StatsCard } from '@/components/data-display/stats-card';
import { toast } from 'sonner';

interface Institution {
  id: string;
  name: string;
  regNo: string;
  type: string;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  notices: number;
  verifiedAt: string;
  location: string;
}

const institutions: Institution[] = [
  { id: 'INST-001', name: 'HDFC Securities Limited', regNo: 'SEBI-INZ000160731', type: 'Stock Broker', status: 'VERIFIED', notices: 42, verifiedAt: 'Jan 2026', location: 'Mumbai' },
  { id: 'INST-002', name: 'ICICI Direct', regNo: 'SEBI-INZ000156789', type: 'Stock Broker', status: 'VERIFIED', notices: 38, verifiedAt: 'Jan 2026', location: 'Mumbai' },
  { id: 'INST-003', name: 'Axis Capital Ltd', regNo: 'SEBI-INZ000245678', type: 'Investment Bank', status: 'PENDING', notices: 0, verifiedAt: '-', location: 'Mumbai' },
  { id: 'INST-004', name: 'ICICI Prudential AMC', regNo: 'SEBI-INZ000312987', type: 'Asset Manager', status: 'PENDING', notices: 0, verifiedAt: '-', location: 'Mumbai' },
  { id: 'INST-005', name: 'Reliance Securities', regNo: 'SEBI-INZ000178934', type: 'Stock Broker', status: 'REJECTED', notices: 0, verifiedAt: '-', location: 'Delhi' },
  { id: 'INST-006', name: 'Kotak Mahindra Bank', regNo: 'SEBI-INZ000190456', type: 'Bank', status: 'VERIFIED', notices: 56, verifiedAt: 'Feb 2026', location: 'Mumbai' },
];

const statusVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
  VERIFIED: 'success',
  PENDING: 'warning',
  REJECTED: 'destructive',
};

export default function InstitutionsPage() {
  const [search, setSearch] = React.useState('');

  const filtered = institutions.filter(
    (inst) =>
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.regNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleVerify = (id: string) => {
    toast.success(`Institution ${id} verified`);
  };

  const handleReject = (id: string) => {
    toast.error(`Institution ${id} rejected`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Institutions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verify and manage registered financial institutions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Institutions" value="1,284" change={6.8} changeLabel="vs last month" icon={<Building2 className="w-5 h-5" />} color="primary" delay={0} />
        <StatsCard title="Verified" value="1,208" change={7.2} changeLabel="vs last month" icon={<ShieldCheck className="w-5 h-5" />} color="success" delay={0.1} />
        <StatsCard title="Pending Approval" value="2" icon={<ShieldX className="w-5 h-5" />} color="warning" delay={0.2} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search institutions..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((inst, index) => (
            <motion.div
              key={inst.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-foreground">{inst.name}</span>
                    <Badge variant={statusVariant[inst.status]}>{inst.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="font-mono">{inst.regNo}</span>
                    <span>{inst.type}</span>
                    <span>{inst.location}</span>
                    <span>{inst.notices} notices</span>
                    {inst.status === 'VERIFIED' && <span>Verified: {inst.verifiedAt}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => toast.info(`Viewing ${inst.name}`)}>
                    <Eye className="w-4 h-4 mr-1.5" />
                    View
                  </Button>
                  {inst.status === 'PENDING' && (
                    <>
                      <Button variant="default" size="sm" className="bg-success-500 hover:bg-success-600 text-white" onClick={() => handleVerify(inst.id)}>
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Verify
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleReject(inst.id)}>
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Building2 className="w-8 h-8 text-muted-foreground" />}
          title="No institutions found"
          description="Try adjusting your search."
        />
      )}
    </div>
  );
}