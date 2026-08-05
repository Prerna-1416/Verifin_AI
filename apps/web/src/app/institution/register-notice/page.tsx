'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone,
  FileText,
  Upload,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { FileUpload } from '@/components/forms/file-upload';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function RegisterNoticePage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    title: '',
    type: '',
    content: '',
    expiresAt: '',
  });
  const [documents, setDocuments] = React.useState<File[]>([]);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content || form.content.length < 50) {
      toast.error('Please fill in all required fields. Content must be at least 50 characters.');
      return;
    }
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    toast.success('Notice registered and cryptographically signed! QR code generated.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Register Communication</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Register official communications, sign them digitally, and generate verifiable QR codes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Notice Details
              </CardTitle>
              <CardDescription>Enter the official communication details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Notice Title"
                placeholder="e.g., Regulatory Advisory on Account Security"
                value={form.title}
                onChange={handleChange('title')}
                required
              />
              <Select
                label="Notice Type"
                placeholder="Select notice type"
                value={form.type}
                onChange={(v) => setForm((prev) => ({ ...prev, type: v }))}
                options={[
                  { value: 'ADVISORY', label: 'Advisory' },
                  { value: 'CIRCULAR', label: 'Circular' },
                  { value: 'ALERT', label: 'Alert' },
                  { value: 'OTHER', label: 'Other' },
                ]}
              />
              <Textarea
                label="Notice Content"
                placeholder="Enter the full content of the official communication..."
                className="min-h-[200px]"
                value={form.content}
                onChange={handleChange('content')}
                helperText={`${form.content.length}/10000 characters`}
                required
              />
              <Input
                type="date"
                label="Expiry Date (Optional)"
                value={form.expiresAt}
                onChange={handleChange('expiresAt')}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Supporting Documents
              </CardTitle>
              <CardDescription>Upload the official document (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                accept=".pdf,.doc,.docx"
                label="Upload supporting document"
                value={documents}
                onChange={setDocuments}
              />
            </CardContent>
          </Card>
        </div>

        {/* Preview / Confirmation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Digital Signature
              </CardTitle>
              <CardDescription>What happens when you register</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: 'Content is hashed', desc: 'SHA-256 hash of the notice content is computed', done: true },
                { title: 'Digitally signed', desc: 'Hashed using your institution Ed25519 private key', done: true },
                { title: 'QR code generated', desc: 'Signature + metadata embedded in a verifiable QR code', done: true },
                { title: 'Added to registry', desc: 'Notice appears in the public institution registry', done: true },
              ].map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
                >
                  <CheckCircle2 className="w-5 h-5 text-success-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-foreground">{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.desc}</div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="rounded-xl bg-warning-500/10 border border-warning-500/30 p-4 text-sm text-warning-700">
                By registering this notice, you confirm it is an official communication
                from your institution and you have authority to sign it.
              </div>
              <Button type="submit" size="lg" variant="gradient" className="w-full" loading={isSubmitting}>
                {!isSubmitting && <Save className="w-4 h-4 mr-2" />}
                {isSubmitting ? 'Signing & Registering...' : 'Register & Generate QR'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}