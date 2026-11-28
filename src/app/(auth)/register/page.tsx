'use client';
import { z } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/features/auth/schema';
import { registerAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import AuthCard from '@/features/auth/components/AuthCard';
import PasswordInput from '@/features/auth/components/PasswordInput';
import { useAuthForm } from '@/features/auth/hooks';
import GoogleButton from '@/features/auth/components/GoogleButton';

type FormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { isPending, startTransition } = useAuthForm();
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: '', email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setErrorMessage('');
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('full_name', data.full_name);
        formData.append('email', data.email);
        formData.append('password', data.password);
        await registerAction(formData);
      } catch (error: unknown) {
        setErrorMessage(error instanceof Error ? error.message : 'Registration failed.');
      }
    });
  };

  return (
    <AuthCard title="Create your business account">
      <GoogleButton label="Continue with Google" />
      <div className="my-4 flex items-center gap-3 text-xs text-zinc-500">
        <span className="h-px flex-1 bg-[#E5E7EB]" />
        or
        <span className="h-px flex-1 bg-[#E5E7EB]" />
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-600">{errorMessage}</div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="full_name" className="text-zinc-600">Full name</Label>
          <Input {...form.register('full_name')} placeholder="Ada Okafor" autoComplete="name" />
          {form.formState.errors.full_name ? <p className="text-xs text-red-500">{form.formState.errors.full_name.message}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-zinc-600">Email</Label>
          <Input {...form.register('email')} type="email" placeholder="you@email.com" autoComplete="email" />
          {form.formState.errors.email ? <p className="text-xs text-red-500">{form.formState.errors.email.message}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-zinc-600">Password</Label>
          <PasswordInput {...form.register('password')} placeholder="At least 8 characters" autoComplete="new-password" />
          {form.formState.errors.password ? <p className="text-xs text-red-500">{form.formState.errors.password.message}</p> : null}
        </div>

        <Button type="submit" className="h-11 w-full bg-[#635BFF] text-white hover:bg-[#635BFF]/90" disabled={isPending}>
          {isPending ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-3 text-center text-[12px] leading-5 text-zinc-400">
        By creating an account, you agree to Brinset's{' '}
        <Link href="/terms" className="font-medium text-[#635BFF]">Terms of Service</Link> and{' '}
        <Link href="/privacy" className="font-medium text-[#635BFF]">Privacy Policy</Link>.
      </p>
      <div className="mt-4 text-center text-sm text-zinc-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-[#635BFF]">Log in</Link>
      </div>
    </AuthCard>
  );
}
