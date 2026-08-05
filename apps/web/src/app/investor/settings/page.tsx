'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Shield,
  Bell,
  Lock,
  Save,
  Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function InvestorSettingsPage() {
  const [saving, setSaving] = React.useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings saved successfully');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences and notifications.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Languages className="w-4 h-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Full Name" defaultValue="Investor User" />
                  <Input label="Email Address" type="email" defaultValue="investor@example.com" />
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
                <CardDescription>Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Current Password" type="password" />
                  <div className="hidden sm:block" />
                  <Input label="New Password" type="password" />
                  <Input label="Confirm New Password" type="password" />
                </div>
                <div className="rounded-xl bg-warning-500/10 border border-warning-500/30 p-4 text-sm text-warning-700">
                  Two-factor authentication (2FA) is recommended for enhanced security.
                  Enable it to protect your account from unauthorized access.
                </div>
                <div className="flex justify-end">
                  <Button variant="gradient" onClick={handleSave} loading={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Update Password
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
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what updates you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { label: 'Email notifications', desc: 'Receive updates about your scans and reports via email' },
                    { label: 'Threat alerts', desc: 'Get notified when new threats are identified in the feed' },
                    { label: 'Product updates', desc: 'Stay informed about new features and improvements' },
                    { label: 'Security alerts', desc: 'Critical alerts about your account security' },
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
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="preferences">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>General Preferences</CardTitle>
                <CardDescription>Customize your VeriFin AI experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Select
                    label="Language"
                    defaultValue="en"
                    onChange={() => {}}
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'hi', label: 'Hindi' },
                      { value: 'ta', label: 'Tamil' },
                      { value: 'te', label: 'Telugu' },
                    ]}
                  />
                  <Select
                    label="Time Zone"
                    defaultValue="ist"
                    onChange={() => {}}
                    options={[
                      { value: 'ist', label: 'IST (UTC+5:30)' },
                      { value: 'utc', label: 'UTC' },
                      { value: 'est', label: 'EST (UTC-5:00)' },
                    ]}
                  />
                </div>
                <div className="flex justify-end">
                  <Button variant="gradient" onClick={handleSave} loading={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
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