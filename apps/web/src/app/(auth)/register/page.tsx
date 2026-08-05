'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Lock, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { registerSchema, type RegisterInput } from '@/lib/validations';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', role: 'INVESTOR' },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Account created! Please sign in.');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to create account. Please try again.');
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
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Create Account</h1>
        <p className="text-sm text-muted-foreground">
          Join VeriFin AI to scan and verify financial communications
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="relative">
          <User className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
          <Input
            label="Full Name"
            placeholder="John Doe"
            className="pl-10"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

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

        <div className="relative">
          <Lock className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="At least 8 characters"
            className="pl-10 pr-10"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirm Password"
            placeholder="Re-enter your password"
            className="pl-10 pr-10"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Account Type</label>
          <div className="grid grid-cols-2 gap-3">
            <label className="cursor-pointer">
              <input type="radio" value="INVESTOR" className="sr-only peer" defaultChecked {...register('role')} />
              <div className="p-3 rounded-xl border border-border peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-elegant text-center transition-all">
                <div className="font-medium text-sm">Investor</div>
                <div className="text-xs text-muted-foreground mt-1">Scan & verify</div>
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="radio" value="INSTITUTION" className="sr-only peer" {...register('role')} />
              <div className="p-3 rounded-xl border border-border peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-elegant text-center transition-all">
                <div className="font-medium text-sm">Institution</div>
                <div className="text-xs text-muted-foreground mt-1">Register & sign</div>
              </div>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          variant="gradient"
          className="w-full"
          loading={isLoading}
        >
          {!isLoading && <UserPlus className="w-4 h-4 mr-2" />}
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:text-primary/80">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}