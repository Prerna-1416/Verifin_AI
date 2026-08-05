'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Save, Shield, Bell, Globe, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [saving, setSaving] = React.useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Platform settings saved');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Platform Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure global platform settings and policies.
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Globe className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Database className="w-4 h-4" />
            AI & Models
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic platform configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Platform Name" defaultValue="VeriFin AI" />
                  <Input label="Support Email" type="email" defaultValue="support@verifin.ai" />
                  <Select
                    label="Default Language"
                    defaultValue="en"
                    onChange={() => {}}
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'hi', label: 'Hindi' },
                      { value: 'ta', label: 'Tamil' },
                    ]}
                  />
                  <Select
                    label="Default Timezone"
                    defaultValue="ist"
                    onChange={() => {}}
                    options={[
                      { value: 'ist', label: 'IST (UTC+5:30)' },
                      { value: 'utc', label: 'UTC' },
                    ]}
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

        <TabsContent value="security">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { label: 'Require 2FA for admin accounts', desc: 'Enforce two-factor authentication for all admin users' },
                    { label: 'Session timeout', desc: 'Automatically sign out inactive users' },
                    { label: 'IP rate limiting', desc: 'Limit API requests per IP address' },
                    { label: 'Audit logging', desc: 'Log all admin actions for compliance' },
                  ].map((item) => (
                    <label key={item.label} className="flex items-start justify-between p-4 rounded-xl border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                      <div>
                        <div className="font-medium text-foreground text-sm">{item.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                      </div>
                      <input type="checkbox" className="w-4 h-4 rounded border-border accent-primary mt-1" defaultChecked />
                    </label>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button variant="gradient" onClick={handleSave} loading={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure platform notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { label: 'Threat alert emails', desc: 'Send threat alerts to all subscribed investors' },
                    { label: 'Institution verification emails', desc: 'Notify institutions about verification status' },
                    { label: 'Weekly digest', desc: 'Send weekly platform activity digest to admins' },
                    { label: 'System alerts', desc: 'Notify admins about system health issues' },
                  ].map((item) => (
                    <label key={item.label} className="flex items-start justify-between p-4 rounded-xl border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                      <div>
                        <div className="font-medium text-foreground text-sm">{item.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                      </div>
                      <input type="checkbox" className="w-4 h-4 rounded border-border accent-primary mt-1" defaultChecked />
                    </label>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button variant="gradient" onClick={handleSave} loading={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="ai">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>AI & Model Settings</CardTitle>
                <CardDescription>Configure detection thresholds and models</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="High Risk Threshold" type="number" defaultValue="75" />
                  <Input label="Critical Risk Threshold" type="number" defaultValue="90" />
                  <Select
                    label="Text Detection Model"
                    defaultValue="distilbert"
                    onChange={() => {}}
                    options={[
                      { value: 'distilbert', label: 'DistilBERT (fast)' },
                      { value: 'roberta', label: 'RoBERTa (accurate)' },
                      { value: 'ensemble', label: 'Ensemble (recommended)' },
                    ]}
                  />
                  <Select
                    label="URL Detection Model"
                    defaultValue="xgboost"
                    onChange={() => {}}
                    options={[
                      { value: 'xgboost', label: 'XGBoost (fast)' },
                      { value: 'randomforest', label: 'Random Forest' },
                      { value: 'ensemble', label: 'Ensemble (recommended)' },
                    ]}
                  />
                </div>
                <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-sm text-muted-foreground">
                  Adjusting thresholds affects detection sensitivity. Lower thresholds catch more
                  threats but increase false positives.
                </div>
                <div className="flex justify-end">
                  <Button variant="gradient" onClick={handleSave} loading={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save AI Settings
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