'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Building2, Save, Shield, KeyRound, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileUpload } from '@/components/forms/file-upload';
import { toast } from 'sonner';

export default function InstitutionSettingsPage() {
  const [saving, setSaving] = React.useState(false);
  const [logo, setLogo] = React.useState<File[]>([]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Institution settings saved');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Institution Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your institution profile and signing keys.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <Building2 className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="keys" className="gap-2">
            <KeyRound className="w-4 h-4" />
            Signing Keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Institution Profile</CardTitle>
                <CardDescription>Your public information shown in the registry</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Institution Name" defaultValue="HDFC Securities Limited" />
                  <Input label="Registration Number" defaultValue="SEBI-INZ000160731" />
                  <Input label="Website" type="url" defaultValue="https://www.hdfcsec.com" />
                  <Input label="Contact Email" type="email" defaultValue="compliance@hdfcsec.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Institution Logo
                  </label>
                  <FileUpload
                    accept="image/*"
                    label="Upload institution logo"
                    value={logo}
                    onChange={setLogo}
                  />
                </div>
                <div className="flex justify-end">
                  <Button variant="gradient" onClick={handleSave} loading={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="keys">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Signing Keys</CardTitle>
                <CardDescription>Manage your cryptographic signing keys for QR codes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-foreground mb-1">Active Public Key</div>
                    <div className="text-xs text-muted-foreground font-mono break-all">
                      ed25519:9e8f2c4a7d3b5c6e8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d
                    </div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Key ID" value="KEY-2026-001" disabled />
                  <Input label="Algorithm" value="Ed25519" disabled />
                </div>
                <div className="rounded-xl bg-warning-500/10 border border-warning-500/30 p-4 text-sm text-warning-700">
                  Rotate your signing key if it is compromised. Rotating the key will require
                  re-signing all active notices.
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => toast.info('Key rotation requested')}>
                    <KeyRound className="w-4 h-4 mr-2" />
                    Rotate Key
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}