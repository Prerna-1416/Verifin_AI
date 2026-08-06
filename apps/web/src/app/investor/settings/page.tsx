'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, Input, Label } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Profile updated (local demo)');
    }, 600);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-elegant">
          <Settings className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-heading-lg font-bold tracking-tight text-foreground">Settings</h2>
          <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your account information</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Display name</Label>
            <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" disabled placeholder="you@example.com" />
          </div>
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
