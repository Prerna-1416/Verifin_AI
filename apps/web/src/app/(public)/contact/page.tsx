'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const contactInfo = [
  {
    icon: <Mail className="w-5 h-5" />,
    title: 'Email',
    value: 'hello@verifin.ai',
    href: 'mailto:hello@verifin.ai',
  },
  {
    icon: <Phone className="w-5 h-5" />,
    title: 'Phone',
    value: '+91 98765 43210',
    href: 'tel:+919876543210',
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    title: 'Office',
    value: 'Mumbai, Maharashtra, India',
    href: '#',
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Message sent successfully! We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="pt-16">
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-display-lg font-display font-bold text-foreground mb-6"
            >
              Get in <span className="gradient-text">Touch</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Have a question about VeriFin AI, want to report a threat, or interested in
              partnering with us? We&apos;d love to hear from you.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <motion.a
                  key={info.title}
                  href={info.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="glass rounded-2xl p-6 flex items-start gap-4 hover:shadow-elegant-hover transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    {info.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{info.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{info.value}</div>
                  </div>
                </motion.a>
              ))}

              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">Report a Threat</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Found suspicious financial content? Report it to our threat intelligence
                  team to protect other investors.
                </p>
                <Button variant="outline" className="w-full">Report Threat</Button>
              </div>
            </div>

            {/* Contact Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="lg:col-span-2 glass rounded-3xl p-8 space-y-6"
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <Input
                  label="Your Name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange('name')}
                  required
                />
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  required
                />
              </div>
              <Input
                label="Subject"
                placeholder="How can we help?"
                value={form.subject}
                onChange={handleChange('subject')}
                required
              />
              <Textarea
                label="Message"
                placeholder="Tell us about your question or concern..."
                className="min-h-[200px]"
                value={form.message}
                onChange={handleChange('message')}
                required
              />
              <div className="flex justify-end">
                <Button type="submit" size="lg" variant="gradient" loading={isSubmitting}>
                  {!isSubmitting && <Send className="w-4 h-4 mr-2" />}
                  Send Message
                </Button>
              </div>
            </motion.form>
          </div>
        </div>
      </section>
    </div>
  );
}