'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, Input, Label } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'INVESTOR',
  });

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          role: form.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || data.message || 'Registration failed');
        return;
      }
      toast.success('Account created');
      await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      router.push('/investor');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start scanning text, URLs, images, and audio for fraud</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required autoComplete="name" placeholder="Jane Investor" value={form.name} onChange={update('name')} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update('email')} />
        </div>
        <div>
          <Label htmlFor="role">I am a</Label>
          <div className="grid grid-cols-2 gap-2" role="radiogroup">
            {[
              { value: 'INVESTOR', label: 'Investor' },
              { value: 'INSTITUTION', label: 'Institution' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setForm((f) => ({ ...f, role: opt.value }))}
                className={`h-11 rounded-xl border text-sm font-medium transition-colors ${
                  form.role === opt.value
                    ? 'border-primary bg-primary-50 text-primary'
                    : 'border-input text-muted-foreground hover:bg-accent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={update('password')} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" type="password" required autoComplete="new-password" placeholder="Repeat password" value={form.confirmPassword} onChange={update('confirmPassword')} />
        </div>
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}