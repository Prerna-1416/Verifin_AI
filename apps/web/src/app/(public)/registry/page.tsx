'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Search, Building2, ShieldCheck, QrCode, MapPin, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/data-display/empty-state';
import { toast } from 'sonner';

interface InstitutionEntry {
  id: string;
  name: string;
  regNo: string;
  type: string;
  location: string;
  verified: boolean;
  notices: number;
}

const institutions: InstitutionEntry[] = [
  { id: 'INST-001', name: 'HDFC Securities Limited', regNo: 'SEBI-INZ000160731', type: 'Stock Broker', location: 'Mumbai', verified: true, notices: 42 },
  { id: 'INST-002', name: 'ICICI Direct', regNo: 'SEBI-INZ000156789', type: 'Stock Broker', location: 'Mumbai', verified: true, notices: 38 },
  { id: 'INST-003', name: 'Kotak Mahindra Bank', regNo: 'SEBI-INZ000190456', type: 'Bank', location: 'Mumbai', verified: true, notices: 56 },
  { id: 'INST-004', name: 'National Stock Exchange', regNo: 'SEBI-INZ000100234', type: 'Stock Exchange', location: 'Mumbai', verified: true, notices: 128 },
  { id: 'INST-005', name: 'Bombay Stock Exchange', regNo: 'SEBI-INZ000101567', type: 'Stock Exchange', location: 'Mumbai', verified: true, notices: 134 },
  { id: 'INST-006', name: 'Axis Asset Management', regNo: 'SEBI-INZ000278901', type: 'Asset Manager', location: 'Mumbai', verified: true, notices: 21 },
];

export default function PublicRegistryPage() {
  const [search, setSearch] = React.useState('');

  const filtered = institutions.filter(
    (inst) =>
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.regNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-16">
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-display-md font-display font-bold text-foreground mb-4">
                Verified Institution <span className="gradient-text">Registry</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Search the public registry of verified financial institutions. Cross-check any
                communication you receive against official registrations.
              </p>
            </motion.div>
          </div>

          <div className="relative max-w-md mx-auto mb-12">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by institution name or SEBI registration number..."
              className="pl-10 py-6 text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((inst, index) => (
                <motion.div
                  key={inst.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-2xl p-6 hover:shadow-elegant-hover transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <Badge variant={inst.verified ? 'success' : 'secondary'} className="gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{inst.name}</h3>
                  <div className="text-xs text-muted-foreground font-mono mb-2">{inst.regNo}</div>
                  <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-success-500" />
                      {inst.type}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {inst.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" />
                      {inst.notices} registered notices
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => toast.info(`Viewing ${inst.name} profile`)}>
                    View Profile
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Building2 className="w-8 h-8 text-muted-foreground" />}
              title="No institutions found"
              description="Try a different search term or check the registration number."
            />
          )}
        </div>
      </section>
    </div>
  );
}