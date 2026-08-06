'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilePlus2, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label, Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiPost } from '@/lib/portal-api';

export default function RegisterNoticePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    documentUrl: '',
    expiresAt: '',
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiPost('/api/notices', {
        title: form.title,
        content: form.content,
        documentUrl: form.documentUrl || undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      });
      setSuccess(true);
      setTimeout(() => router.push('/institution/registry'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register notice');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
        <h2 className="text-xl font-bold">Notice registered</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your notice has been digitally signed.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="max-w-none">
        <CardHeader className="text-left">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <FilePlus2 className="h-6 w-6" />
          </div>
          <CardTitle>Register a Notice</CardTitle>
          <CardDescription>
            Publish a signed advisory, circular, or alert. It will be verifiable via QR and listed in
            the public registry.
          </CardDescription>
        </CardHeader>
        <div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                minLength={5}
                placeholder="e.g. Advisory on unsolicited trading tips"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                required
                minLength={50}
                rows={7}
                placeholder="Full text of the notice..."
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="doc">Document URL (optional)</Label>
                <Input
                  id="doc"
                  type="url"
                  placeholder="https://..."
                  value={form.documentUrl}
                  onChange={(e) => setForm({ ...form, documentUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp">Expires on (optional)</Label>
                <Input
                  id="exp"
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing...
                </>
              ) : (
                'Register notice'
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
