'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Camera,
  Upload,
  ShieldCheck,
  ShieldX,
  Building2,
  CheckCircle2,
  FileText,
  MapPin,
  Calendar,
  Lock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FileUpload } from '@/components/forms/file-upload';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VerificationResult {
  isValid: boolean;
  institution: {
    name: string;
    registrationNo: string;
    type: string;
    location: string;
    verified: boolean;
  };
  notice: {
    title: string;
    reference: string;
    issuedAt: string;
    signedBy: string;
  };
  message: string;
}

const mockResult: VerificationResult = {
  isValid: true,
  institution: {
    name: 'HDFC Securities Limited',
    registrationNo: 'SEBI-INZ000160731',
    type: 'Stock Broker - Registered',
    location: 'Mumbai, Maharashtra',
    verified: true,
  },
  notice: {
    title: 'Regulatory Advisory on Account Security',
    reference: 'HDFC-ADV-2026-0812',
    issuedAt: 'August 1, 2026',
    signedBy: 'HDFC Securities Compliance Team',
  },
  message: 'This QR code is cryptographically signed and matches an official communication in the VeriFin AI registry.',
};

export default function VerifyPage() {
  const [qrFiles, setQrFiles] = React.useState<File[]>([]);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [result, setResult] = React.useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (qrFiles.length === 0) {
      toast.error('Please upload a QR code image to verify');
      return;
    }
    setIsVerifying(true);
    setResult(null);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    setResult(mockResult);
    setIsVerifying(false);
  };

  const handleReset = () => {
    setResult(null);
    setQrFiles([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">QR Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verify official financial communications using cryptographically signed QR codes.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload side */}
        <div className="space-y-4">
          <Tabs defaultValue="upload">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Image
              </TabsTrigger>
              <TabsTrigger value="camera" className="gap-2">
                <Camera className="w-4 h-4" />
                Scan with Camera
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              <FileUpload
                accept="image/*"
                label="Upload QR code image from the official communication"
                value={qrFiles}
                onChange={setQrFiles}
              />
            </TabsContent>

            <TabsContent value="camera" className="mt-4">
              <div className="relative rounded-2xl border-2 border-dashed border-muted-foreground/25 min-h-[200px] flex flex-col items-center justify-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Camera className="w-7 h-7 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Camera scanning coming soon
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Use the upload option to verify QR codes now. Camera-based scanning
                  will be available in the browser extension.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3">
            <Button
              size="lg"
              variant="gradient"
              className="flex-1"
              onClick={handleVerify}
              loading={isVerifying}
              disabled={isVerifying}
            >
              {!isVerifying && <QrCode className="w-5 h-5 mr-2" />}
              {isVerifying ? 'Verifying...' : 'Verify QR Code'}
            </Button>
            {result && (
              <Button size="lg" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            )}
          </div>

          {isVerifying && (
            <div className="rounded-2xl bg-muted/50 p-4 flex items-center gap-3 animate-pulse">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <div>
                <div className="text-sm font-medium">Decoding QR code...</div>
                <div className="text-xs text-muted-foreground">
                  Validating cryptographic signature
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              How it works
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success-500 shrink-0 mt-0.5" />
                Institutions sign notices with Ed25519 private keys
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success-500 shrink-0 mt-0.5" />
                The signature is embedded in the QR code payload
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success-500 shrink-0 mt-0.5" />
                We verify against the institution's registered public key
              </li>
            </ul>
          </div>
        </div>

        {/* Result side */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {!result && !isVerifying ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full rounded-3xl border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <QrCode className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Ready to Verify</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Upload a QR code from any official financial communication to verify
                  its authenticity.
                </p>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Result banner */}
                <div
                  className={cn(
                    'rounded-3xl p-6 flex items-center gap-4',
                    result.isValid
                      ? 'bg-success-500/10 border border-success-500/30'
                      : 'bg-destructive/10 border border-destructive/30'
                  )}
                >
                  <div
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0',
                      result.isValid ? 'bg-success-500/20 text-success-600' : 'bg-destructive/20 text-destructive'
                    )}
                  >
                    {result.isValid ? <ShieldCheck className="w-7 h-7" /> : <ShieldX className="w-7 h-7" />}
                  </div>
                  <div>
                    <div className="text-lg font-bold mb-1">
                      {result.isValid ? 'Verified Authentic' : 'Verification Failed'}
                    </div>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                </div>

                {/* Institution details */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        Issuing Institution
                      </h3>
                      <Badge variant={result.institution.verified ? 'success' : 'secondary'}>
                        {result.institution.verified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-foreground">{result.institution.name}</div>
                        <div className="text-xs text-muted-foreground">{result.institution.type}</div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="font-mono">{result.institution.registrationNo}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 shrink-0" />
                        {result.institution.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notice details */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      Signed Communication
                    </h3>
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-foreground">{result.notice.title}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="font-mono">{result.notice.reference}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 shrink-0" />
                        Issued: {result.notice.issuedAt}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        Signed by: {result.notice.signedBy}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Verification Certificate
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}