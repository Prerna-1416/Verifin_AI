'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Share2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function QRGeneratorPage() {
  const [noticeId, setNoticeId] = React.useState('');
  const [qrSize, setQrSize] = React.useState('256');
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    setCopied(true);
    toast.success('QR code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    toast.success('QR code downloaded as SVG');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">QR Generator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate verifiable QR codes for your registered notices.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                QR Code Settings
              </CardTitle>
              <CardDescription>Configure your QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Select Notice"
                placeholder="Choose a registered notice"
                value={noticeId}
                onChange={setNoticeId}
                options={[
                  { value: 'NTC-2026-089', label: 'NTC-2026-089 - Advisory on Account Security' },
                  { value: 'NTC-2026-088', label: 'NTC-2026-088 - KYC Compliance Update' },
                  { value: 'NTC-2026-087', label: 'NTC-2026-087 - Trading Suspension' },
                ]}
              />
              <Select
                label="QR Code Size"
                value={qrSize}
                onChange={setQrSize}
                options={[
                  { value: '128', label: 'Small (128px)' },
                  { value: '256', label: 'Medium (256px)' },
                  { value: '512', label: 'Large (512px)' },
                ]}
              />
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-foreground mb-1">Signed Payload</div>
                    <div className="text-xs text-muted-foreground font-mono break-all">
                      v1.ntc-2026-089.sig=ed25519:a3f8...9c2b
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Download Options</CardTitle>
              <CardDescription>Export your QR code in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="svg">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="svg">SVG</TabsTrigger>
                  <TabsTrigger value="png">PNG</TabsTrigger>
                  <TabsTrigger value="pdf">PDF</TabsTrigger>
                </TabsList>
                <TabsContent value="svg">
                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    <Button variant="outline" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download SVG
                    </Button>
                    <Button variant="ghost" onClick={handleCopy}>
                      {copied ? <Check className="w-4 h-4 mr-2 text-success-500" /> : <Copy className="w-4 h-4 mr-2" />}
                      Copy
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="png">
                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    <Button variant="outline" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download PNG
                    </Button>
                    <Button variant="ghost" onClick={() => toast.success('PNG code copied')}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="pdf">
                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    <Button variant="outline" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="ghost" onClick={() => toast.success('PDF code copied')}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                Live Preview
              </CardTitle>
              <CardDescription>Your QR code as investors will see it</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="p-6 rounded-3xl bg-white shadow-elegant-hover"
              >
                <QRCodeSVG
                  value={`https://verifin.ai/verify/${noticeId || 'ntc-2026-089'}`}
                  size={parseInt(qrSize)}
                />
              </motion.div>

              <div className="mt-6 w-full space-y-3">
                <div className="rounded-xl bg-success-500/10 border border-success-500/30 p-4 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-success-600 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-foreground">Cryptographically Signed</div>
                    <div className="text-xs text-muted-foreground">Verified by Ed25519 digital signature</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="gradient" className="flex-1" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={() => toast.success('Share link copied')}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => toast.success('QR code regenerated')}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}