'use client';

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSent(true);
      toast.success('Password reset link sent to your email.');
    } catch {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong rounded-3xl p-8 shadow-elegant-hover"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          {isSent ? 'Check Your Email' : 'Forgot Password?'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSent
            ? 'We sent a password reset link to your email address.'
            : 'Enter your email and we will send you a reset link.'}
        </p>
      </div>

      {isSent ? (
        <div className="space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-success-500/10 flex items-center justify-center">
            <Send className="w-8 h-8 text-success-600" />
          </div>
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the link in the email to reset your password. The link expires in 30 minutes.
            </p>
            <Button variant="outline" onClick={() => setIsSent(false)}>
              Resend Email
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              className="pl-10"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
          <Button type="submit" size="lg" variant="gradient" className="w-full" loading={isLoading}>
            {!isLoading && <Send className="w-4 h-4 mr-2" />}
            Send Reset Link
          </Button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>
    </motion.div>
  );
}