'use client';

import { Settings, ShieldAlert, KeyRound } from 'lucide-react';
import { PortalCard, SectionTitle } from '@/components/ui/portal-card';
import { Input, Label } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function InstitutionSettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <SectionTitle title="Settings" subtitle="Manage your institution account" />

      <PortalCard>
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
          <Settings className="h-4 w-4 text-emerald-600" /> Profile
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" defaultValue="" placeholder="Your name" />
          </div>
          <Button>Save profile</Button>
        </div>
      </PortalCard>

      <PortalCard>
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
          <ShieldAlert className="h-4 w-4 text-emerald-600" /> Security
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button variant="outline">Update password</Button>
        </div>
      </PortalCard>

      <PortalCard>
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
          <KeyRound className="h-4 w-4 text-emerald-600" /> Verification keys
        </h3>
        <p className="text-sm text-muted-foreground">
          Your institution uses an asymmetric key pair to sign notices. Keys are generated on
          registration and can be rotated by an administrator.
        </p>
      </PortalCard>
    </div>
  );
}
